import type { BotConfig } from "./config";
import { activityLabel, getLocale, type ActivitySummary } from "./locales";
import type {
  ActivityKind,
  ActiveActivity,
  ActivityLimits,
  ActivityCountLimits,
  BotState,
  Locale,
  UserProfile,
  MiniAppGroupAccess,
  GroupWarning,
  AuditLogEntry,
} from "./types";
import type { BotStore } from "./store/types";

const trackedActivities: ActivityKind[] = ["eat", "wc", "smoke", "wcd"];
const DEFAULT_ACTIVITY_COUNT_LIMITS: ActivityCountLimits = {
  eat: Number.POSITIVE_INFINITY,
  wc: 7,
  smoke: 7,
  wcd: 2,
};
const REMINDER_GRACE_MS = 45_000;
const REMINDER_CLAIM_LEASE_MS = 60_000;

const userKey = (chatId: number, userId: number) => `${chatId}:${userId}`;

export type ActivityReminderClaim = {
  activity: ActiveActivity;
  locale: Locale;
  claimedAt: string;
};

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const localDateKey = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values["year"]}-${values["month"]}-${values["day"]}`;
};

const formatDateTime = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "");

const formatWarningDateTime = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  return [hours, minutes, remainder]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const ensureProfile = (
  state: BotState,
  profile: Omit<UserProfile, "createdAt" | "updatedAt">,
  now: string,
) => {
  const key = userKey(profile.chatId, profile.userId);
  const existing = state.users[key];
  state.users[key] = {
    ...profile,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  return state.users[key];
};

const buildSettlementResponse = (
  state: BotState,
  record: BotState["records"][number],
  active: ActiveActivity,
  locale: Locale,
  text: ReturnType<typeof getLocale>,
  timeZone: string,
): string => {
  const dayKey = localDateKey(
    new Date(record.endedAt),
    timeZone,
  );
  const matchingRecords = state.records.filter(
    (item) =>
      item.chatId === record.chatId &&
      item.userId === record.userId &&
      localDateKey(new Date(item.endedAt), timeZone) === dayKey,
  );
  const activitySummary = matchingRecords
    .filter((item) => item.kind === active.kind)
    .reduce<ActivitySummary>(
      (summary, item) => ({
        count: summary.count + 1,
        seconds: summary.seconds + item.elapsedSeconds,
      }),
      { count: 0, seconds: 0 },
    );
  const totalSeconds = matchingRecords.reduce(
    (total, item) => total + item.elapsedSeconds,
    0,
  );
  const todayCounts = trackedActivities.reduce(
    (counts, kind) => {
      counts[kind] = matchingRecords.filter(
        (item) => item.kind === kind,
      ).length;
      return counts;
    },
    {
      eat: 0,
      wc: 0,
      smoke: 0,
      wcd: 0,
    } as Record<ActivityKind, number>,
  );

  return text.settled(
    record.displayName,
    record.userId,
    activityLabel(record.kind, locale),
    formatDateTime(new Date(record.startedAt), timeZone),
    record.elapsedSeconds,
    active.limitMinutes,
    activitySummary.seconds,
    totalSeconds,
    todayCounts,
  );
};

export class AttendanceService {
  constructor(
    private readonly store: BotStore,
    private readonly config: BotConfig,
  ) {}

  async createAuditLog(entry: AuditLogEntry): Promise<void> {
    await this.store.createAuditLog(entry);
  }

  async deleteAuditLogsBefore(cutoff: Date): Promise<number> {
    return this.store.deleteAuditLogsBefore(cutoff);
  }

  async listAuditLogs(options: { search?: string; action?: string; page: number; pageSize: number }) {
    return this.store.listAuditLogs(options);
  }

  getHistoryRetentionDays(): number {
    return this.config.historyRetentionDays;
  }

  async getStorageHealth() {
    const stats = await this.store.getStorageStats();
    if (!stats) return undefined;
    const limitBytes = this.config.mongodbStorageLimitMb * 1024 * 1024;
    const usagePercent = limitBytes > 0 ? (stats.storageBytes / limitBytes) * 100 : 0;
    const status = usagePercent >= this.config.mongodbStorageCriticalPercent
      ? "critical"
      : usagePercent >= this.config.mongodbStorageWarnPercent
        ? "warning"
        : "healthy";
    return {
      ...stats,
      limitBytes,
      limitMb: this.config.mongodbStorageLimitMb,
      usagePercent: Math.round(usagePercent * 100) / 100,
      status,
      warnPercent: this.config.mongodbStorageWarnPercent,
      criticalPercent: this.config.mongodbStorageCriticalPercent,
      emergencyRetentionDays: this.config.mongodbEmergencyRetentionDays,
    } as const;
  }

  async enforceStorageProtection() {
    const health = await this.getStorageHealth();
    if (!health || health.status === "healthy") return { health, cleanup: undefined };
    const days = health.status === "critical"
      ? this.config.mongodbEmergencyRetentionDays
      : Math.max(this.config.mongodbEmergencyRetentionDays, Math.floor(this.config.historyRetentionDays / 2));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const cleanup = await this.pruneHistoryBefore(cutoff);
    return { health, cleanup: { ...cleanup, retentionDays: days } };
  }

  async pruneHistoryBefore(cutoff: Date): Promise<{ records: number; warnings: number; pendingConnects: number }> {
    let removedRecords = 0;
    let removedWarnings = 0;
    let removedPendingConnects = 0;

    await this.store.update((state) => {
      const beforeRecords = state.records.length;
      state.records = state.records.filter((record) => {
        const endedAt = new Date(record.endedAt).getTime();
        return !Number.isFinite(endedAt) || endedAt >= cutoff.getTime();
      });
      removedRecords = beforeRecords - state.records.length;

      if (state.groupWarnings) {
        for (const [chatId, warnings] of Object.entries(state.groupWarnings)) {
          const kept = warnings.filter((warning) => {
            const createdAt = new Date(warning.createdAt).getTime();
            return !Number.isFinite(createdAt) || createdAt >= cutoff.getTime();
          });
          removedWarnings += warnings.length - kept.length;
          if (kept.length) state.groupWarnings[chatId] = kept;
          else delete state.groupWarnings[chatId];
        }
      }

      if (state.pendingConnects) {
        const pendingCutoff = Date.now() - 24 * 60 * 60 * 1000;
        for (const [key, pending] of Object.entries(state.pendingConnects)) {
          const requestedAt = new Date(pending.requestedAt).getTime();
          if (Number.isFinite(requestedAt) && requestedAt < pendingCutoff) {
            delete state.pendingConnects[key];
            removedPendingConnects += 1;
          }
        }
      }
    });

    return { records: removedRecords, warnings: removedWarnings, pendingConnects: removedPendingConnects };
  }


  async getMiniAppGroupAccess(userId: number, groupId: number) {
    return this.store.getMiniAppGroupAccess(userId, groupId);
  }

  async cacheMiniAppGroupAccess(
    userId: number,
    groupId: number,
    role: MiniAppGroupAccess["role"],
  ) {
    return this.store.cacheMiniAppGroupAccess(userId, groupId, role);
  }

  async clearMiniAppGroupAccess(userId: number, groupId: number): Promise<void> {
    await this.store.clearMiniAppGroupAccess(userId, groupId);
  }

  async setLocale(
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    locale: Locale,
  ) {
    await this.store.update((state) => {
      const now = new Date().toISOString();
      ensureProfile(state, { ...profile, locale }, now);
    });
  }

  async getLocale(chatId: number, userId: number): Promise<Locale> {
    const state = await this.store.load();
    return state.users[userKey(chatId, userId)]?.locale || "zh";
  }

  async workCheckIn(
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = new Date();
    const key = userKey(profile.chatId, profile.userId);
    const state = await this.store.load();
    const locale = state.users[key]?.locale || profile.locale;
    const text = getLocale(locale);
    const checkedAt = new Intl.DateTimeFormat("en-GB", {
      timeZone: this.config.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now).replace(",", " ");
    return text.workCheckIn(profile.displayName, profile.userId, checkedAt);
  }

  async startActivity(
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    kind: ActivityKind,
  ) {
    const now = new Date();
    const key = userKey(profile.chatId, profile.userId);

    await this.store.update((state) => {
      ensureProfile(state, profile, now.toISOString());
    });

    const state = await this.store.load();
    const locale = state.users[key]?.locale || profile.locale;
    const text = getLocale(locale);
    const active = await this.store.getActiveActivity(
      profile.chatId,
      profile.userId,
    );

    if (active) {
      return text.alreadyActive(
        profile.displayName,
        profile.userId,
        activityLabel(active.kind, locale),
      );
    }

    const dayKey = localDateKey(now, this.config.timeZone);
    const todayCount = state.records.filter(
      (record) =>
        record.chatId === profile.chatId &&
        record.userId === profile.userId &&
        record.kind === kind &&
        localDateKey(new Date(record.endedAt), this.config.timeZone) === dayKey,
    ).length;
    const countLimit =
      state.groupActivityCountLimits?.[String(profile.chatId)]?.[kind] ??
      state.activityCountLimits?.[kind] ??
      DEFAULT_ACTIVITY_COUNT_LIMITS[kind];

    if (countLimit !== undefined && todayCount >= countLimit) {
      return text.dailyCountLimitReached(
        profile.displayName,
        profile.userId,
        activityLabel(kind, locale),
        countLimit,
      );
    }

    const limitMinutes =
      state.groupActivityLimits?.[String(profile.chatId)]?.[kind] ??
      state.activityLimits?.[kind] ??
      this.config.activityLimits[kind];

    const activity: ActiveActivity = {
      id: createId(),
      chatId: profile.chatId,
      userId: profile.userId,
      displayName: profile.displayName,
      kind,
      startedAt: now.toISOString(),
      limitMinutes,
    };

    const created = await this.store.createActiveActivity(activity);
    if (!created) {
      const concurrentActive = await this.store.getActiveActivity(
        profile.chatId,
        profile.userId,
      );
      return text.alreadyActive(
        profile.displayName,
        profile.userId,
        concurrentActive
          ? activityLabel(concurrentActive.kind, locale)
          : activityLabel(kind, locale),
      );
    }

    return text.started(
      profile.displayName,
      profile.userId,
      activityLabel(kind, locale),
      formatDateTime(now, this.config.timeZone),
      todayCount + 1,
      limitMinutes,
    );
  }

  async settle(
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    settledBy: "back" | "offwork" = "back",
  ): Promise<{
    response: string;
    timeoutNotification?: string;
    notificationChatId?: number;
    pendingActivityId?: string;
  }> {
    const now = new Date();
    const key = userKey(profile.chatId, profile.userId);
    const state = await this.store.load();
    const locale = state.users[key]?.locale || profile.locale;
    const text = getLocale(locale);
    const active = await this.store.getActiveActivity(
      profile.chatId,
      profile.userId,
    );

    if (!active) {
      return {
        response:
          settledBy === "offwork"
            ? text.shiftEnded(formatDateTime(now, this.config.timeZone))
            : text.noActive(profile.displayName, profile.userId),
      };
    }

    const existingRecord = state.records.find(
      (record) => record.id === active.id,
    );
    const warningKey = String(profile.chatId);
    const existingWarning = state.groupWarnings?.[warningKey]?.find(
      (warning) => warning.id === active.id,
    );

    // A completed record plus no warning means the previous settlement already
    // finished and only temporary cleanup was interrupted by a restart.
    if (existingRecord && !existingWarning) {
      await this.store.deleteActiveActivity(
        profile.chatId,
        profile.userId,
        active.id,
      );
      return {
        response: buildSettlementResponse(
          state,
          existingRecord,
          active,
          locale,
          text,
          this.config.timeZone,
        ),
      };
    }

    // A completed record with a warning means warning delivery was the only
    // step left when the process stopped. Reuse the original warning message.
    if (existingRecord && existingWarning) {
      const notificationChatId =
        state.connectedGroups?.[String(profile.chatId)]?.targetChatId;
      if (notificationChatId) {
        return {
          response: buildSettlementResponse(
            state,
            existingRecord,
            active,
            locale,
            text,
            this.config.timeZone,
          ),
          timeoutNotification: existingWarning.message,
          notificationChatId,
          pendingActivityId: active.id,
        };
      }

      await this.store.deleteActiveActivity(
        profile.chatId,
        profile.userId,
        active.id,
      );
      return {
        response: buildSettlementResponse(
          state,
          existingRecord,
          active,
          locale,
          text,
          this.config.timeZone,
        ),
      };
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor(
        (now.getTime() - new Date(active.startedAt).getTime()) / 1000,
      ),
    );
    const timeoutSeconds = Math.max(
      0,
      Math.floor(elapsedSeconds - active.limitMinutes * 60),
    );
    const isTimeout = settledBy === "back" && timeoutSeconds > 0;
    const connection = isTimeout
      ? state.connectedGroups?.[String(profile.chatId)]
      : undefined;

    let response = "";
    let timeoutNotification: string | undefined;
    let notificationChatId: number | undefined;

    await this.store.update((nextState) => {
      ensureProfile(nextState, profile, now.toISOString());

      const record = {
        id: active.id,
        chatId: active.chatId,
        userId: active.userId,
        displayName: active.displayName,
        kind: active.kind,
        startedAt: active.startedAt,
        endedAt: now.toISOString(),
        elapsedSeconds,
        settledBy,
      } as BotState["records"][number];
      nextState.records.push(record);

      let warning: GroupWarning | undefined;
      if (isTimeout) {
        nextState.groupWarnings = nextState.groupWarnings || {};
        const warnings = nextState.groupWarnings[warningKey] || [];
        const activityName = activityLabel(active.kind, locale);
        const message = connection
          ? getLocale(locale).groupTimeoutNotification(
              connection.targetGroupName,
              connection.sourceChatId,
              connection.sourceUsername,
              active.displayName,
              active.userId,
              activityName,
              timeoutSeconds,
              formatWarningDateTime(now, this.config.timeZone),
            )
          : getLocale(locale).groupTimeoutNotification(
              "Group",
              profile.chatId,
              undefined,
              active.displayName,
              active.userId,
              activityName,
              timeoutSeconds,
              formatWarningDateTime(now, this.config.timeZone),
            );

        warning = {
          id: active.id,
          chatId: profile.chatId,
          userId: active.userId,
          displayName: active.displayName,
          kind: active.kind,
          message,
          timeoutSeconds,
          createdAt: now.toISOString(),
        };
        warnings.push(warning);
        nextState.groupWarnings[warningKey] = warnings.slice(-50);
      }

      response = buildSettlementResponse(
        nextState,
        record,
        active,
        locale,
        text,
        this.config.timeZone,
      );

      if (isTimeout && warning) {
        timeoutNotification = warning.message;
        notificationChatId = connection?.targetChatId;
      }
    });

    if (isTimeout && notificationChatId) {
      return {
        response,
        timeoutNotification,
        notificationChatId,
        pendingActivityId: active.id,
      };
    }

    await this.store.deleteActiveActivity(
      profile.chatId,
      profile.userId,
      active.id,
    );
    return { response };
  }

  async completePendingActivity(
    chatId: number,
    userId: number,
    activityId: string,
  ): Promise<void> {
    await this.store.deleteActiveActivity(chatId, userId, activityId);
  }

  async offWork(profile: Omit<UserProfile, "createdAt" | "updatedAt">) {
    return this.settle(profile, "offwork");
  }

  async recordManagedGroup(
    chatId: number,
    title: string,
    username?: string,
  ): Promise<void> {
    if (chatId >= 0) return;
    await this.store.update((state) => {
      state.managedGroups = state.managedGroups || {};
      const key = String(chatId);
      const existing = state.managedGroups[key];
      const now = new Date().toISOString();
      state.managedGroups[key] = {
        chatId,
        title,
        ...(username ? { username } : {}),
        addedAt: existing?.addedAt || now,
        updatedAt: now,
      };
    });
  }

  async removeManagedGroup(chatId: number): Promise<void> {
    await this.store.update((state) => {
      delete state.managedGroups?.[String(chatId)];
    });
  }

  async beginConnect(chatId: number, userId: number): Promise<void> {
    await this.store.update((state) => {
      state.pendingConnects = state.pendingConnects || {};
      state.pendingConnects[`${chatId}:${userId}`] = {
        sourceChatId: chatId,
        userId,
        requestedAt: new Date().toISOString(),
      };
    });
  }

  async getPendingConnect(chatId: number, userId: number) {
    const state = await this.store.load();
    return state.pendingConnects?.[`${chatId}:${userId}`];
  }

  async clearPendingConnect(chatId: number, userId: number): Promise<void> {
    await this.store.update((state) => {
      delete state.pendingConnects?.[`${chatId}:${userId}`];
    });
  }

  async setConnectedGroup(
    sourceChatId: number,
    sourceGroupName: string | undefined,
    sourceUsername: string | undefined,
    targetChatId: number,
    targetGroupName: string,
    targetUsername?: string,
  ): Promise<void> {
    await this.store.update((state) => {
      state.connectedGroups = state.connectedGroups || {};
      state.connectedGroups[String(sourceChatId)] = {
        sourceChatId,
        ...(sourceGroupName ? { sourceGroupName } : {}),
        ...(sourceUsername ? { sourceUsername } : {}),
        targetChatId,
        targetGroupName,
        ...(targetUsername ? { targetUsername } : {}),
        connectedAt: new Date().toISOString(),
      };
    });
  }

  async getConnectedGroup(sourceChatId: number) {
    const state = await this.store.load();
    return state.connectedGroups?.[String(sourceChatId)];
  }

  async getActivityCountLimits(
    chatId?: number,
  ): Promise<Partial<ActivityCountLimits>> {
    const state = await this.store.load();
    if (chatId !== undefined) {
      return {
        ...(state.activityCountLimits || {}),
        ...(state.groupActivityCountLimits?.[String(chatId)] || {}),
      };
    }
    return { ...state.activityCountLimits };
  }

  async setActivityCountLimit(
    kind: ActivityKind,
    count: number,
    chatId?: number,
  ): Promise<Partial<ActivityCountLimits>> {
    let limits: Partial<ActivityCountLimits> = {};
    await this.store.update((state) => {
      if (chatId !== undefined) {
        state.groupActivityCountLimits = state.groupActivityCountLimits || {};
        const key = String(chatId);
        limits = {
          ...(state.activityCountLimits || {}),
          ...(state.groupActivityCountLimits[key] || {}),
          [kind]: count,
        };
        state.groupActivityCountLimits[key] = {
          ...(state.groupActivityCountLimits[key] || {}),
          [kind]: count,
        };
        return;
      }
      limits = { ...(state.activityCountLimits || {}), [kind]: count };
      state.activityCountLimits = limits;
    });
    return limits;
  }

  async getActivityLimits(chatId?: number): Promise<ActivityLimits> {
    const state = await this.store.load();
    return {
      ...this.config.activityLimits,
      ...state.activityLimits,
      ...(chatId !== undefined
        ? state.groupActivityLimits?.[String(chatId)] || {}
        : {}),
    };
  }

  async isActivityReminderEnabled(): Promise<boolean> {
    const state = await this.store.load();
    return state.reminderEnabled !== false;
  }

  async setActivityReminderEnabled(enabled: boolean): Promise<boolean> {
    await this.store.update((state) => {
      state.reminderEnabled = enabled;
    });
    return enabled;
  }

  async setActivityLimit(
    kind: ActivityKind,
    minutes: number,
    chatId?: number,
  ): Promise<ActivityLimits> {
    let limits: ActivityLimits = { ...this.config.activityLimits };
    await this.store.update((state) => {
      if (chatId !== undefined) {
        state.groupActivityLimits = state.groupActivityLimits || {};
        const key = String(chatId);
        state.groupActivityLimits[key] = {
          ...(state.groupActivityLimits[key] || {}),
          [kind]: minutes,
        };
        limits = {
          ...this.config.activityLimits,
          ...state.activityLimits,
          ...state.groupActivityLimits[key],
        };
        return;
      }
      limits = {
        ...this.config.activityLimits,
        ...state.activityLimits,
        [kind]: minutes,
      };
      state.activityLimits = limits;
    });
    return limits;
  }

  async getGroupWarnings(chatId: number, limit = 30) {
    const state = await this.store.load();
    return (state.groupWarnings?.[String(chatId)] || [])
      .slice(-Math.max(1, Math.min(limit, 100)))
      .reverse();
  }

  async dueActivityReminders(now = new Date()): Promise<ActiveActivity[]> {
    if (!(await this.isActivityReminderEnabled())) return [];
    return this.store.listDueActiveActivities(now, REMINDER_GRACE_MS);
  }

  async claimActivityReminder(
    candidate: Pick<ActiveActivity, "chatId" | "userId" | "startedAt">,
    now = new Date(),
  ): Promise<ActivityReminderClaim | undefined> {
    const claim = await this.store.claimActiveActivityReminder(
      candidate,
      now,
      REMINDER_GRACE_MS,
      REMINDER_CLAIM_LEASE_MS,
    );
    if (!claim) return undefined;

    const state = await this.store.load();
    const key = userKey(candidate.chatId, candidate.userId);
    return {
      activity: claim.activity,
      locale: state.users[key]?.locale || "zh",
      claimedAt: claim.claimedAt,
    };
  }

  async markActivityReminderSent(
    claim: ActivityReminderClaim,
    sentAt = new Date(),
  ): Promise<void> {
    await this.store.markActiveActivityReminderSent(claim, sentAt);
  }

  async releaseActivityReminderClaim(
    claim: ActivityReminderClaim,
  ): Promise<void> {
    await this.store.releaseActiveActivityReminderClaim(claim);
  }

  async getBotStats() {
    const state = await this.store.load();
    const privateUserIds = new Set<number>();
    const groupIds = new Set<number>();

    for (const profile of Object.values(state.users)) {
      if (profile.chatId > 0) privateUserIds.add(profile.userId);
      if (profile.chatId < 0) groupIds.add(profile.chatId);
    }

    const activeActivities = (await this.store.listActiveActivities()).length;

    return {
      privateUsers: privateUserIds.size,
      groups: groupIds.size,
      activeActivities,
    };
  }

  async active(
    chatId: number,
    userId: number,
  ): Promise<ActiveActivity | undefined> {
    return this.store.getActiveActivity(chatId, userId);
  }

  async snapshot(): Promise<BotState> {
    const state = structuredClone(await this.store.load());
    const activities = await this.store.listActiveActivities();
    state.activeActivities = Object.fromEntries(
      activities.map((activity) => [
        userKey(activity.chatId, activity.userId),
        activity,
      ]),
    );
    return state;
  }
}

export { formatDuration, formatDateTime, localDateKey, trackedActivities };
