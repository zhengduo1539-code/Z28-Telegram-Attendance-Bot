import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";
import { emptyState, FileBotStore, isBotState } from "./file-store";
import type { BotState, MiniAppGroupAccess } from "../types";
import type { BotStore } from "./types";

type MongoStateDocument = {
  _id: "bot-state";
  state: BotState;
  updatedAt: Date;
};

const COLLECTION_NAME = "bot_state";
const STATE_ID = "bot-state";
const MINI_APP_ACCESS_COLLECTION = "mini_app_access";
const MINI_APP_ACCESS_TTL_MS = 5 * 60 * 1000;

type MongoMiniAppAccessDocument = {
  _id: string;
  userId: number;
  groupId: number;
  role: MiniAppGroupAccess["role"];
  expiresAt: Date;
};

const miniAppAccessId = (userId: number, groupId: number) =>
  `${userId}:${groupId}`;

export class MongoBotStore implements BotStore {
  private readonly client: MongoClient;
  private connected = false;
  private state?: BotState;
  private updateQueue: Promise<void> = Promise.resolve();
  private miniAppAccessIndexPromise?: Promise<void>;

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

  private async miniAppAccessCollection() {
    const collection = (await this.database()).collection<MongoMiniAppAccessDocument>(
      MINI_APP_ACCESS_COLLECTION,
    );
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
      this.state = document.state;
      return this.state;
    }

    const migratedState = await this.loadLegacyState();
    const initialState = migratedState || emptyState();
    await this.save(initialState);
    return this.state as BotState;
  }

  async save(state: BotState): Promise<void> {
    this.state = state;
    const collection = await this.collection();
    await collection.replaceOne(
      { _id: STATE_ID },
      {
        _id: STATE_ID,
        state,
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

  async getMiniAppGroupAccess(
    userId: number,
    groupId: number,
  ): Promise<MiniAppGroupAccess | undefined> {
    const collection = await this.miniAppAccessCollection();
    const document = await collection.findOne({ _id: miniAppAccessId(userId, groupId) });
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
    await collection.replaceOne(
      { _id: document._id },
      document,
      { upsert: true },
    );
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

    // Reuse the existing file-store parser/quarantine behavior for a
    // one-time migration. MongoDB remains the source of truth afterward.
    const legacyStore = new FileBotStore(this.legacyFilePath);
    return legacyStore.load();
  }
}

