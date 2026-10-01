import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";
import { emptyState, FileBotStore, isBotState } from "./file-store";
import type {
  ActiveActivity,
  AuditLogEntry,
  BotState,
  MiniAppGroupAccess,
} from "../types";
import type { BotStore } from "./types";

type MongoStateDocument = {
  _id: "bot-state";
  state: BotState;
  updatedAt: Date;
};

type MongoActiveActivityDocument = {
  _id: string;
  id: string;
  chatId: number;
  userId: number;
  displayName: string;
  kind: ActiveActivity["kind"];
  startedAt: Date;
  limitMinutes: number;
  dueAt: Date;
  reminderClaimedAt?: Date;
  reminderSentAt?: Date;
};

type MongoAuditLogDocument = {
  _id: string;
  id: string;
  actorUserId: number;
  actorName: string;
  role: AuditLogEntry["role"];
  action: string;
  target: string;
  details: string;
  createdAt: Date;
};

type MongoMiniAppAccessDocument = {
  _id: string;
  userId: number;
  groupId: number;
  role: MiniAppGroupAccess["role"];
  expiresAt: Date;
};

const COLLECTION_NAME = "bot_state";
const STATE_ID = "bot-state";
const ACTIVE_ACTIVITY_COLLECTION = "active_activities";
const MINI_APP_ACCESS_COLLECTION = "mini_app_access";
const AUDIT_LOG_COLLECTION = "audit_logs";
const MINI_APP_ACCESS_TTL_MS = 5 * 60 * 1000;

const activeActivityKey = (chatId: number, userId: number) =>
  `${chatId}:${userId}`;

const miniAppAccessId = (userId: number, groupId: number) =>
  `${userId}:${groupId}`;

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === 11000;

const toActiveActivity = (
  document: MongoActiveActivityDocument,
): ActiveActivity => ({
  id: document.id,
  chatId: document.chatId,
  userId: document.userId,
  displayName: document.displayName,
  kind: document.kind,
  startedAt: document.startedAt.toISOString(),
  limitMinutes: document.limitMinutes,
  ...(document.reminderClaimedAt
    ? { reminderClaimedAt: document.reminderClaimedAt.toISOString() }
    : {}),
  ...(document.reminderSentAt
    ? { reminderSentAt: document.reminderSentAt.toISOString() }
    : {}),
});

const toMongoActiveActivity = (
  activity: ActiveActivity,
): MongoActiveActivityDocument => {
  const startedAt = new Date(activity.startedAt);
  return {
    _id: activeActivityKey(activity.chatId, activity.userId),
    id: activity.id,
    chatId: activity.chatId,
    userId: activity.userId,
    displayName: activity.displayName,
    kind: activity.kind,
    startedAt,
    limitMinutes: activity.limitMinutes,
    dueAt: new Date(startedAt.getTime() + activity.limitMinutes * 60_000),
    ...(activity.reminderClaimedAt
      ? { reminderClaimedAt: new Date(activity.reminderClaimedAt) }
      : {}),
    ...(activity.reminderSentAt
      ? { reminderSentAt: new Date(activity.reminderSentAt) }
      : {}),
  };
};

export class MongoBotStore implements BotStore {
  private readonly client: MongoClient;
  private connected = false;
  private state?: BotState;
  private updateQueue: Promise<void> = Promise.resolve();
  private miniAppAccessIndexPromise?: Promise<void>;
  private auditLogIndexPromise?: Promise<void>;

  constructor(
    private readonly uri: string,
    private readonly legacyFilePath?: string,
  ) {
    this.client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      appName: "z28-telegram-attendance-bot",
    });
  }

  private async database() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
    return this.client.db();
  }

  private async collection() {
    return (await this.database()).collection<MongoStateDocument>(COLLECTION_NAME);
  }

  private async activeActivityCollection() {
    return (await this.database()).collection<MongoActiveActivityDocument>(
      ACTIVE_ACTIVITY_COLLECTION,
    );
  }

  private async miniAppAccessCollection() {
    const collection = (
      await this.database()
    ).collection<MongoMiniAppAccessDocument>(MINI_APP_ACCESS_COLLECTION);
    if (!this.miniAppAccessIndexPromise) {
      this.miniAppAccessIndexPromise = collection
        .createIndex(
          { expiresAt: 1 },
          { expireAfterSeconds: 0, name: "mini_app_access_ttl" },
        )
        .then(() => undefined)
        .catch((error: unknown) => {
          this.miniAppAccessIndexPromise = undefined;
          throw error;
        });
    }
    await this.miniAppAccessIndexPromise;
    return collection;
  }

  async load(): Promise<BotState> {
    if (this.state) return this.state;

    const collection = await this.collection();
    const document = await collection.findOne({ _id: STATE_ID });

    if (document) {
      if (!isBotState(document.state)) {
        throw new Error("MongoDB bot state document is invalid.");
      }

      const legacyActiveActivities = document.state.activeActivities || {};
      if (Object.keys(legacyActiveActivities).length) {
        const activeCollection = await this.activeActivityCollection();
        for (const activity of Object.values(legacyActiveActivities)) {
          const normalizedActivity = activity.id
            ? activity
            : { ...activity, id: `${activity.chatId}:${activity.userId}:${activity.startedAt}` };
          await activeCollection.updateOne(
            { _id: activeActivityKey(activity.chatId, activity.userId) },
            { $setOnInsert: toMongoActiveActivity(normalizedActivity) },
            { upsert: true },
          );
        }

        const migratedState = { ...document.state, activeActivities: {} };
        await collection.replaceOne(
          { _id: STATE_ID },
          {
            _id: STATE_ID,
            state: migratedState,
            updatedAt: new Date(),
          },
        );
        this.state = migratedState;
      } else {
        this.state = { ...document.state, activeActivities: {} };
      }

      return this.state;
    }

    const migratedState = await this.loadLegacyState();
    const initialState = migratedState || emptyState();
    const legacyActiveActivities = initialState.activeActivities || {};
    if (Object.keys(legacyActiveActivities).length) {
      const activeCollection = await this.activeActivityCollection();
      for (const activity of Object.values(legacyActiveActivities)) {
        const normalizedActivity = activity.id
          ? activity
          : { ...activity, id: `${activity.chatId}:${activity.userId}:${activity.startedAt}` };
        await activeCollection.updateOne(
          { _id: activeActivityKey(activity.chatId, activity.userId) },
          { $setOnInsert: toMongoActiveActivity(normalizedActivity) },
          { upsert: true },
        );
      }
    }

    const stateWithoutActiveActivities = {
      ...initialState,
      activeActivities: {},
    };
    await this.save(stateWithoutActiveActivities);
    return this.state as BotState;
  }

  async save(state: BotState): Promise<void> {
    const stateWithoutActiveActivities = {
      ...state,
      activeActivities: {},
    };
    this.state = stateWithoutActiveActivities;

    const collection = await this.collection();
    await collection.replaceOne(
      { _id: STATE_ID },
      {
        _id: STATE_ID,
        state: stateWithoutActiveActivities,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
  }

  async update(mutator: (state: BotState) => void): Promise<BotState> {
    let updatedState: BotState | undefined;

    const update = this.updateQueue.then(async () => {
      const state = await this.load();
      const nextState = structuredClone(state);
      mutator(nextState);
      await this.save(nextState);
      updatedState = nextState;
    });

    this.updateQueue = update.catch(() => undefined);
    await update;
    return updatedState as BotState;
  }

  async getActiveActivity(
    chatId: number,
    userId: number,
  ): Promise<ActiveActivity | undefined> {
    const document = await (
      await this.activeActivityCollection()
    ).findOne({ _id: activeActivityKey(chatId, userId) });
    return document ? toActiveActivity(document) : undefined;
  }

  async listActiveActivities(): Promise<ActiveActivity[]> {
    const documents = await (await this.activeActivityCollection()).find({}).toArray();
    return documents.map(toActiveActivity);
  }

  async createActiveActivity(activity: ActiveActivity): Promise<boolean> {
    try {
      await (await this.activeActivityCollection()).insertOne(
        toMongoActiveActivity(activity),
      );
      return true;
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) return false;
      throw error;
    }
  }

  async deleteActiveActivity(
    chatId: number,
    userId: number,
    activityId: string,
  ): Promise<void> {
    await (
      await this.activeActivityCollection()
    ).deleteOne({
      _id: activeActivityKey(chatId, userId),
      id: activityId,
    });
  }

  async listDueActiveActivities(
    now: Date,
    graceMs: number,
  ): Promise<ActiveActivity[]> {
    const dueBefore = new Date(now.getTime() - graceMs);
    const documents = await (
      await this.activeActivityCollection()
    )
      .find({
        dueAt: { $lte: dueBefore },
        reminderSentAt: { $exists: false },
      })
      .toArray();
    return documents.map(toActiveActivity);
  }

  async claimActiveActivityReminder(
    candidate: Pick<ActiveActivity, "chatId" | "userId" | "startedAt">,
    now: Date,
    graceMs: number,
    leaseMs: number,
  ): Promise<{ activity: ActiveActivity; claimedAt: string } | undefined> {
    const claimedAt = now.toISOString();
    const claimableBefore = new Date(now.getTime() - leaseMs);
    const document = await (
      await this.activeActivityCollection()
    ).findOneAndUpdate(
      {
        _id: activeActivityKey(candidate.chatId, candidate.userId),
        startedAt: new Date(candidate.startedAt),
        reminderSentAt: { $exists: false },
        dueAt: { $lte: new Date(now.getTime() - graceMs) },
        $or: [
          { reminderClaimedAt: { $exists: false } },
          { reminderClaimedAt: { $lte: claimableBefore } },
        ],
      },
      { $set: { reminderClaimedAt: new Date(claimedAt) } },
      { returnDocument: "after" },
    );

    return document
      ? {
          activity: toActiveActivity(document),
          claimedAt,
        }
      : undefined;
  }

  async markActiveActivityReminderSent(
    claim: { activity: ActiveActivity; claimedAt: string },
    sentAt: Date,
  ): Promise<void> {
    await (
      await this.activeActivityCollection()
    ).updateOne(
      {
        _id: activeActivityKey(claim.activity.chatId, claim.activity.userId),
        id: claim.activity.id,
        startedAt: new Date(claim.activity.startedAt),
        reminderClaimedAt: new Date(claim.claimedAt),
      },
      {
        $set: { reminderSentAt: sentAt },
        $unset: { reminderClaimedAt: "" },
      },
    );
  }

  async releaseActiveActivityReminderClaim(
    claim: { activity: ActiveActivity; claimedAt: string },
  ): Promise<void> {
    await (
      await this.activeActivityCollection()
    ).updateOne(
      {
        _id: activeActivityKey(claim.activity.chatId, claim.activity.userId),
        id: claim.activity.id,
        startedAt: new Date(claim.activity.startedAt),
        reminderClaimedAt: new Date(claim.claimedAt),
      },
      { $unset: { reminderClaimedAt: "" } },
    );
  }

  async createAuditLog(entry: AuditLogEntry): Promise<void> {
    const collection = (await this.database()).collection<MongoAuditLogDocument>(AUDIT_LOG_COLLECTION);
    if (!this.auditLogIndexPromise) {
      this.auditLogIndexPromise = collection.createIndex({ createdAt: -1 }, { name: "audit_logs_created_at" }).then(() => undefined).catch((error: unknown) => {
        this.auditLogIndexPromise = undefined;
        throw error;
      });
    }
    await this.auditLogIndexPromise;
    await collection.insertOne({ _id: entry.id, id: entry.id, actorUserId: entry.actorUserId, actorName: entry.actorName, role: entry.role, action: entry.action, target: entry.target, details: entry.details, createdAt: new Date(entry.createdAt) });
  }

  async listAuditLogs(options: { search?: string; action?: string; page: number; pageSize: number }): Promise<{ logs: AuditLogEntry[]; total: number; totalPages: number; page: number; pageSize: number }> {
    const collection = (await this.database()).collection<MongoAuditLogDocument>(AUDIT_LOG_COLLECTION);
    const filter: Record<string, unknown> = {};
    if (options.action) filter.action = options.action;
    if (options.search) {
      const expression = new RegExp(options.search.replace(/[.*+?^\${}()|[\]\\]/g, "\\  async getMiniAppGroupAccess("), "i");
      filter.$or = [{ actorName: expression }, { action: expression }, { target: expression }, { details: expression }];
      const numericSearch = Number(options.search);
      if (Number.isSafeInteger(numericSearch)) (filter.$or as unknown[]).push({ actorUserId: numericSearch });
    }
    const total = await collection.countDocuments(filter);
    const pageSize = Math.min(Math.max(options.pageSize, 1), 50);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(options.page, 1), totalPages);
    const documents = await collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
    return { logs: documents.map((document) => ({ id: document.id, actorUserId: document.actorUserId, actorName: document.actorName, role: document.role, action: document.action, target: document.target, details: document.details, createdAt: document.createdAt.toISOString() })), total, totalPages, page, pageSize };
  }

  async getMiniAppGroupAccess(
    userId: number,
    groupId: number,
  ): Promise<MiniAppGroupAccess | undefined> {
    const collection = await this.miniAppAccessCollection();
    const document = await collection.findOne({
      _id: miniAppAccessId(userId, groupId),
    });
    if (!document) return undefined;

    if (document.expiresAt.getTime() <= Date.now()) {
      await collection.deleteOne({ _id: document._id });
      return undefined;
    }

    return {
      userId: document.userId,
      groupId: document.groupId,
      role: document.role,
      expiresAt: document.expiresAt.toISOString(),
    };
  }

  async cacheMiniAppGroupAccess(
    userId: number,
    groupId: number,
    role: MiniAppGroupAccess["role"],
  ): Promise<MiniAppGroupAccess> {
    const expiresAt = new Date(Date.now() + MINI_APP_ACCESS_TTL_MS);
    const document: MongoMiniAppAccessDocument = {
      _id: miniAppAccessId(userId, groupId),
      userId,
      groupId,
      role,
      expiresAt,
    };
    const collection = await this.miniAppAccessCollection();
    await collection.replaceOne({ _id: document._id }, document, { upsert: true });
    return {
      userId,
      groupId,
      role,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async clearMiniAppGroupAccess(userId: number, groupId: number): Promise<void> {
    const collection = await this.miniAppAccessCollection();
    await collection.deleteOne({ _id: miniAppAccessId(userId, groupId) });
  }

  private async loadLegacyState(): Promise<BotState | undefined> {
    if (!this.legacyFilePath) return undefined;

    try {
      await readFile(this.legacyFilePath, "utf8");
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      if (code === "ENOENT") return undefined;
      throw error;
    }

    const legacyStore = new FileBotStore(this.legacyFilePath);
    return legacyStore.load();
  }
}
