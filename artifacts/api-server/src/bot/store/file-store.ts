import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BotState, MiniAppGroupAccess } from "../types";
import type { BotStore } from "./types";

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
    (candidate.reminderEnabled === undefined ||
      typeof candidate.reminderEnabled === "boolean") &&
    (candidate.managedGroups === undefined ||
      isObjectRecord(candidate.managedGroups))
  );
};

const MINI_APP_ACCESS_TTL_MS = 5 * 60 * 1000;

const miniAppAccessKey = (userId: number, groupId: number) =>
  `${userId}:${groupId}`;

export class FileBotStore implements BotStore {
  private state?: BotState;
  private readonly miniAppAccess = new Map<string, MiniAppGroupAccess>();
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

    this.state = parsed;
    return this.state;
  }

  async save(state: BotState): Promise<void> {
    this.state = state;
    const directory = path.dirname(this.filePath);
    const temporaryPath = `${this.filePath}.tmp`;
    const write = this.writeQueue.then(async () => {
      await mkdir(directory, { recursive: true });
      await writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
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
