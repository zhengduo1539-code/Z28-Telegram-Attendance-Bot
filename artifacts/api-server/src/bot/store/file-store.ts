import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ActiveActivity, AuditLogEntry, BotState, MiniAppGroupAccess } from "../types";
import type { BotStore, StorageStats } from "./types";

export const emptyState = (): BotState => ({
  users: {},
  activeActivities: {},
  records: [],
  activityLimits: {},
  connectedGroups: {},
  pendingConnects: {},
});

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const stripLegacySupportTickets = (state: BotState): BotState => {
  if (!Object.prototype.hasOwnProperty.call(state, "supportTickets")) return state;
  const cleanedState = { ...state } as BotState & { supportTickets?: unknown };
  delete cleanedState.supportTickets;
  return cleanedState;
};

export const isBotState = (value: unknown): value is BotState => {
  if (!isObjectRecord(value)) return false;
  const candidate = value as Partial<BotState>;
  return (
    isObjectRecord(candidate.users) &&
    Object.values(candidate.users).every(isObjectRecord) &&
    isObjectRecord(candidate.activeActivities) &&
    Object.values(candidate.activeActivities).every(isObjectRecord) &&
    Array.isArray(candidate.records) &&
    candidate.records.every(isObjectRecord) &&
    (candidate.activityLimits === undefined ||
      isObjectRecord(candidate.activityLimits)) &&
    (candidate.connectedGroups === undefined ||
      isObjectRecord(candidate.connectedGroups)) &&
    (candidate.pendingConnects === undefined ||
      isObjectRecord(candidate.pendingConnects)) &&
    (candidate.groupActivityLimits === undefined ||
      isObjectRecord(candidate.groupActivityLimits)) &&
    (candidate.groupActivityCountLimits === undefined ||
      isObjectRecord(candidate.groupActivityCountLimits)) &&
    (candidate.groupWarnings === undefined ||
      isObjectRecord(candidate.groupWarnings)) &&
    (candidate.groupActivityReplyMessages === undefined ||
      isObjectRecord(candidate.groupActivityReplyMessages)) &&
    (candidate.groupActivityNames === undefined ||
      isObjectRecord(candidate.groupActivityNames)) &&
    (candidate.reminderEnabled === undefined ||
      typeof candidate.reminderEnabled === "boolean") &&
    (candidate.managedGroups === undefined ||
      isObjectRecord(candidate.managedGroups))
  );
};

const MINI_APP_ACCESS_TTL_MS = 5 * 60 * 1000;

const activeActivityKey = (chatId: number, userId: number) =>
  `${chatId}:${userId}`;


const miniAppAccessKey = (userId: number, groupId: number) =>
  `${userId}:${groupId}`;

export class FileBotStore implements BotStore {
  async getStorageStats(): Promise<StorageStats | undefined> {
    return undefined;
  }

  private state?: BotState;
  private readonly miniAppAccess = new Map<string, MiniAppGroupAccess>();
  private readonly auditLogs: AuditLogEntry[] = [];
  private writeQueue: Promise<void> = Promise.resolve();
  private updateQueue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async load(): Promise<BotState> {
    if (this.state) return this.state;

    let raw: string;
    try {
      raw = await readFile(this.filePath, "utf8");
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      if (code === "ENOENT") {
        this.state = emptyState();
        return this.state;
      }
      throw error;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      await this.quarantineCorruptState();
      this.state = emptyState();
      return this.state;
    }

    if (!isBotState(parsed)) {
      await this.quarantineCorruptState();
      this.state = emptyState();
      return this.state;
    }

    const cleanedState = stripLegacySupportTickets(parsed);
    if (cleanedState !== parsed) await this.save(cleanedState);
    else this.state = cleanedState;
    return this.state;
  }

  async save(state: BotState): Promise<void> {
    const cleanedState = stripLegacySupportTickets(state);
    this.state = cleanedState;
    const directory = path.dirname(this.filePath);
    const temporaryPath = `${this.filePath}.tmp`;
    const write = this.writeQueue.then(async () => {
      await mkdir(directory, { recursive: true });
      await writeFile(temporaryPath, JSON.stringify(cleanedState, null, 2), "utf8");
      await rename(temporaryPath, this.filePath);
    });
    this.writeQueue = write.catch(() => undefined);
    await write;
  }

  async update(mutator: (state: BotState) => void): Promise<BotState> {
    let updatedState: BotState | undefined;
    const update = this.updateQueue.then(async () => {
      const state = await this.load();
      const nextState: BotState = structuredClone(state);
      mutator(nextState);
      await this.save(nextState);
      updatedState = nextState;
    });
    this.updateQueue = update.catch(() => undefined);
    await update;
    return updatedState as BotState;
  }

  async getActiveActivity(chatId: number, userId: number): Promise<ActiveActivity | undefined> {
    const state = await this.load();
    return state.activeActivities[activeActivityKey(chatId, userId)];
  }

  async listActiveActivities(): Promise<ActiveActivity[]> {
    const state = await this.load();
    return Object.values(state.activeActivities).map((activity) => ({ ...activity }));
  }

  async createActiveActivity(activity: ActiveActivity): Promise<boolean> {
    let created = false;
    await this.update((state) => {
      const key = activeActivityKey(activity.chatId, activity.userId);
      if (state.activeActivities[key]) return;
      state.activeActivities[key] = { ...activity };
      created = true;
    });
    return created;
  }

  async deleteActiveActivity(chatId: number, userId: number, activityId: string): Promise<void> {
    await this.update((state) => {
      const key = activeActivityKey(chatId, userId);
      if (state.activeActivities[key]?.id === activityId) delete state.activeActivities[key];
    });
  }

  async listDueActiveActivities(now: Date, graceMs: number): Promise<ActiveActivity[]> {
    const nowMs = now.getTime();
    return (await this.listActiveActivities()).filter((activity) => {
      if (activity.reminderSentAt) return false;
      const dueAt = new Date(activity.startedAt).getTime() + activity.limitMinutes * 60_000 + graceMs;
      return Number.isFinite(dueAt) && dueAt <= nowMs;
    });
  }

  async claimActiveActivityReminder(
    candidate: Pick<ActiveActivity, "chatId" | "userId" | "startedAt">,
    now: Date,
    graceMs: number,
    leaseMs: number,
  ): Promise<{ activity: ActiveActivity; claimedAt: string } | undefined> {
    const key = activeActivityKey(candidate.chatId, candidate.userId);
    const claimedAt = now.toISOString();
    let claim: { activity: ActiveActivity; claimedAt: string } | undefined;
    await this.update((state) => {
      const activity = state.activeActivities[key];
      if (!activity || activity.startedAt !== candidate.startedAt || activity.reminderSentAt) return;
      const dueAt = new Date(activity.startedAt).getTime() + activity.limitMinutes * 60_000 + graceMs;
      if (!Number.isFinite(dueAt) || dueAt > now.getTime()) return;
      const existingClaim = activity.reminderClaimedAt ? new Date(activity.reminderClaimedAt).getTime() : Number.NaN;
      if (Number.isFinite(existingClaim) && now.getTime() - existingClaim < leaseMs) return;
      activity.reminderClaimedAt = claimedAt;
      claim = { activity: { ...activity }, claimedAt };
    });
    return claim;
  }

  async markActiveActivityReminderSent(
    claim: { activity: ActiveActivity; claimedAt: string },
    sentAt: Date,
  ): Promise<void> {
    await this.update((state) => {
      const activity = state.activeActivities[activeActivityKey(claim.activity.chatId, claim.activity.userId)];
      if (!activity || activity.id !== claim.activity.id || activity.startedAt !== claim.activity.startedAt || activity.reminderClaimedAt !== claim.claimedAt) return;
      activity.reminderSentAt = sentAt.toISOString();
      delete activity.reminderClaimedAt;
    });
  }

  async releaseActiveActivityReminderClaim(
    claim: { activity: ActiveActivity; claimedAt: string },
  ): Promise<void> {
    await this.update((state) => {
      const activity = state.activeActivities[activeActivityKey(claim.activity.chatId, claim.activity.userId)];
      if (activity?.id === claim.activity.id && activity.startedAt === claim.activity.startedAt && activity.reminderClaimedAt === claim.claimedAt) {
        delete activity.reminderClaimedAt;
      }
    });
  }

  async createAuditLog(entry: AuditLogEntry): Promise<void> {
    this.auditLogs.push({ ...entry });
    if (this.auditLogs.length > 1000) this.auditLogs.splice(0, this.auditLogs.length - 1000);
  }

  async deleteAuditLogsBefore(cutoff: Date): Promise<number> {
    const before = this.auditLogs.length;
    const kept = this.auditLogs.filter((entry) => new Date(entry.createdAt).getTime() >= cutoff.getTime());
    this.auditLogs.splice(0, this.auditLogs.length, ...kept);
    return before - kept.length;
  }

  async listAuditLogs(options: { search?: string; action?: string; page: number; pageSize: number }): Promise<{ logs: AuditLogEntry[]; total: number; totalPages: number; page: number; pageSize: number }> {
    const search = (options.search || "").trim().toLowerCase();
    const filtered = this.auditLogs.filter((entry) => !options.action || entry.action === options.action).filter((entry) => !search || [entry.actorName, entry.action, entry.target, entry.details, String(entry.actorUserId)].some((value) => value.toLowerCase().includes(search))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const pageSize = Math.min(Math.max(options.pageSize, 1), 50);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(options.page, 1), totalPages);
    const offset = (page - 1) * pageSize;
    return { logs: filtered.slice(offset, offset + pageSize).map((entry) => ({ ...entry })), total, totalPages, page, pageSize };
  }

  async getMiniAppGroupAccess(
    userId: number,
    groupId: number,
  ): Promise<MiniAppGroupAccess | undefined> {
    const key = miniAppAccessKey(userId, groupId);
    const access = this.miniAppAccess.get(key);
    if (!access) return undefined;
    if (new Date(access.expiresAt).getTime() <= Date.now()) {
      this.miniAppAccess.delete(key);
      return undefined;
    }
    return { ...access };
  }

  async cacheMiniAppGroupAccess(
    userId: number,
    groupId: number,
    role: MiniAppGroupAccess["role"],
  ): Promise<MiniAppGroupAccess> {
    const access: MiniAppGroupAccess = {
      userId,
      groupId,
      role,
      expiresAt: new Date(Date.now() + MINI_APP_ACCESS_TTL_MS).toISOString(),
    };
    this.miniAppAccess.set(miniAppAccessKey(userId, groupId), access);
    return { ...access };
  }

  async clearMiniAppGroupAccess(userId: number, groupId: number): Promise<void> {
    this.miniAppAccess.delete(miniAppAccessKey(userId, groupId));
  }

  private async quarantineCorruptState(): Promise<void> {
    const quarantinePath = `${this.filePath}.corrupt-${Date.now()}.json`;
    try {
      await rename(this.filePath, quarantinePath);
    } catch {
      // If the file disappears between read and rename, the next write can
      // still recreate a valid state file.
    }
  }
}
