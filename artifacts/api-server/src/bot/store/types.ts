import type { ActiveActivity, AuditLogEntry, BotState, MiniAppGroupAccess } from "../types";

export interface BotStore {
  load(): Promise<BotState>;
  save(state: BotState): Promise<void>;
  update(mutator: (state: BotState) => void): Promise<BotState>;
  getMiniAppGroupAccess(userId: number, groupId: number): Promise<MiniAppGroupAccess | undefined>;
  cacheMiniAppGroupAccess(
    userId: number,
    groupId: number,
    role: MiniAppGroupAccess["role"],
  ): Promise<MiniAppGroupAccess>;
  clearMiniAppGroupAccess(userId: number, groupId: number): Promise<void>;
  createAuditLog(entry: AuditLogEntry): Promise<void>;
  deleteAuditLogsBefore(cutoff: Date): Promise<number>;
  listAuditLogs(options: { search?: string; action?: string; page: number; pageSize: number }): Promise<{ logs: AuditLogEntry[]; total: number; totalPages: number; page: number; pageSize: number }>;
  getActiveActivity(chatId: number, userId: number): Promise<ActiveActivity | undefined>;
  listActiveActivities(): Promise<ActiveActivity[]>;
  createActiveActivity(activity: ActiveActivity): Promise<boolean>;
  deleteActiveActivity(chatId: number, userId: number, activityId: string): Promise<void>;
  listDueActiveActivities(now: Date, graceMs: number): Promise<ActiveActivity[]>;
  claimActiveActivityReminder(
    candidate: Pick<ActiveActivity, "chatId" | "userId" | "startedAt">,
    now: Date,
    graceMs: number,
    leaseMs: number,
  ): Promise<{ activity: ActiveActivity; claimedAt: string } | undefined>;
  markActiveActivityReminderSent(
    claim: { activity: ActiveActivity; claimedAt: string },
    sentAt: Date,
  ): Promise<void>;
  releaseActiveActivityReminderClaim(
    claim: { activity: ActiveActivity; claimedAt: string },
  ): Promise<void>;
}
