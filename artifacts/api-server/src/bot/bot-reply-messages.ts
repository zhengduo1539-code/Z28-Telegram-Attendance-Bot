import type { Locale } from "./types";

export const BOT_REPLY_CATEGORIES = ["general", "attendance", "admin", "connect"] as const;
export type BotReplyCategory = (typeof BOT_REPLY_CATEGORIES)[number];

export const BOT_REPLY_KEYS = [
  "startWelcome",
  "help",
  "languageChanged",
  "languagePicker",
  "languageUsage",
  "unknownLanguage",
  "unknownCommand",
  "idInfo",
  "botStats",
  "botStatsPrivate",
  "workCheckIn",
  "noActive",
  "alreadyActive",
  "started",
  "settled",
  "dailyCountLimitReached",
  "timeoutReminder",
  "groupTimeoutNotification",
  "shiftStarted",
  "shiftEnded",
  "adminOnly",
  "adminPrivate",
  "adminPanelPrompt",
  "adminMiniAppUnavailable",
  "limitPrivate",
  "limitUsage",
  "unknownActivity",
  "invalidLimit",
  "limits",
  "limitUpdated",
  "countLimitPrivate",
  "countLimitUsage",
  "invalidCountLimit",
  "countLimits",
  "countLimitUpdated",
  "reminderPrivate",
  "reminderUsage",
  "reminderStatus",
  "reminderUpdated",
  "connectPrompt",
  "connectUsage",
  "connectAdminOnly",
  "connectSuccess",
  "connectSelf",
  "connectInvalid",
] as const;

export type BotReplyMessageKey = (typeof BOT_REPLY_KEYS)[number];
export type BotReplyMessages = Partial<Record<Locale, Partial<Record<BotReplyMessageKey, string>>>>;

export const BOT_REPLY_KEYS_BY_CATEGORY: Record<BotReplyCategory, readonly BotReplyMessageKey[]> = {
  general: [
    "startWelcome", "help", "languageChanged", "languagePicker", "languageUsage",
    "unknownLanguage", "unknownCommand", "idInfo", "botStats", "botStatsPrivate",
  ],
  attendance: [
    "workCheckIn", "noActive", "alreadyActive", "started", "settled",
    "dailyCountLimitReached", "timeoutReminder", "groupTimeoutNotification",
    "shiftStarted", "shiftEnded",
  ],
  admin: [
    "adminOnly", "adminPrivate", "adminPanelPrompt", "adminMiniAppUnavailable",
    "limitPrivate", "limitUsage", "unknownActivity", "invalidLimit", "limits",
    "limitUpdated", "countLimitPrivate", "countLimitUsage", "invalidCountLimit",
    "countLimits", "countLimitUpdated", "reminderPrivate", "reminderUsage",
    "reminderStatus", "reminderUpdated",
  ],
  connect: [
    "connectPrompt", "connectUsage", "connectAdminOnly", "connectSuccess",
    "connectSelf", "connectInvalid",
  ],
};

export const BOT_REPLY_LABELS: Record<BotReplyMessageKey, string> = {
  startWelcome: "Welcome message",
  help: "Help message",
  languageChanged: "Language changed",
  languagePicker: "Language picker prompt",
  languageUsage: "Language command help",
  unknownLanguage: "Unknown language",
  unknownCommand: "Unknown command",
  idInfo: "Chat / user ID",
  botStats: "Bot statistics",
  botStatsPrivate: "Statistics private-chat notice",
  workCheckIn: "Work check-in",
  noActive: "No active activity",
  alreadyActive: "Activity already running",
  started: "Activity started",
  settled: "Activity completed / Back",
  dailyCountLimitReached: "Daily activity limit reached",
  timeoutReminder: "Activity timeout reminder",
  groupTimeoutNotification: "Group timeout notification",
  shiftStarted: "Shift started",
  shiftEnded: "Shift ended",
  adminOnly: "Admin-only notice",
  adminPrivate: "Admin panel private-chat notice",
  adminPanelPrompt: "Admin panel prompt",
  adminMiniAppUnavailable: "Admin panel unavailable",
  limitPrivate: "Limit command private-chat notice",
  limitUsage: "Activity limit usage",
  unknownActivity: "Unknown activity",
  invalidLimit: "Invalid activity limit",
  limits: "Activity limits",
  limitUpdated: "Activity limit updated",
  countLimitPrivate: "Count limit private-chat notice",
  countLimitUsage: "Count limit command usage",
  invalidCountLimit: "Invalid count limit",
  countLimits: "Daily count limits",
  countLimitUpdated: "Daily count limit updated",
  reminderPrivate: "Reminder private-chat notice",
  reminderUsage: "Reminder command usage",
  reminderStatus: "Reminder status",
  reminderUpdated: "Reminder setting updated",
  connectPrompt: "Connect group prompt",
  connectUsage: "Connect command usage",
  connectAdminOnly: "Connect admin-only notice",
  connectSuccess: "Connect success",
  connectSelf: "Connect to same group error",
  connectInvalid: "Connect target invalid",
};

export const BOT_REPLY_VARIABLES: Record<BotReplyMessageKey, readonly string[]> = {
  startWelcome: [],
  help: [],
  languageChanged: [],
  languagePicker: [],
  languageUsage: [],
  unknownLanguage: [],
  unknownCommand: [],
  idInfo: ["chat_id", "user_id"],
  botStats: ["private_users", "groups"],
  botStatsPrivate: [],
  workCheckIn: ["user_name", "user_id", "checked_at"],
  noActive: ["user_name", "user_id"],
  alreadyActive: ["user_name", "user_id", "activity"],
  started: ["user_name", "user_id", "activity", "time", "count", "limit_minutes"],
  settled: [
    "user_name", "user_id", "activity", "start_time", "duration", "limit_minutes",
    "today_activity_time", "today_total_time", "today_eat_count", "today_wc_count",
    "today_smoke_count", "today_wcd_count", "timeout_duration",
  ],
  dailyCountLimitReached: ["user_name", "user_id", "activity", "count_limit"],
  timeoutReminder: ["user_name", "user_id", "activity"],
  groupTimeoutNotification: [
    "group_name", "group_id", "username", "user_name", "user_id", "activity",
    "timeout_duration", "warning_time",
  ],
  shiftStarted: ["time"],
  shiftEnded: ["time"],
  adminOnly: [],
  adminPrivate: [],
  adminPanelPrompt: [],
  adminMiniAppUnavailable: [],
  limitPrivate: [],
  limitUsage: [],
  unknownActivity: [],
  invalidLimit: [],
  limits: ["eat_minutes", "wc_minutes", "smoke_minutes", "wcd_minutes"],
  limitUpdated: ["activity", "minutes"],
  countLimitPrivate: [],
  countLimitUsage: [],
  invalidCountLimit: [],
  countLimits: ["eat_count", "wc_count", "smoke_count", "wcd_count"],
  countLimitUpdated: ["activity", "count"],
  reminderPrivate: [],
  reminderUsage: [],
  reminderStatus: ["enabled"],
  reminderUpdated: ["enabled"],
  connectPrompt: [],
  connectUsage: [],
  connectAdminOnly: [],
  connectSuccess: ["group_name", "group_id"],
  connectSelf: [],
  connectInvalid: [],
};

export const BOT_REPLY_MAX_LENGTH = 3500;

export const validateBotReplyTemplate = (
  key: BotReplyMessageKey,
  value: unknown,
): string | undefined => {
  if (!(BOT_REPLY_KEYS as readonly string[]).includes(key)) return "Unsupported reply message.";
  if (typeof value !== "string") return "Reply message must be text.";

  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > BOT_REPLY_MAX_LENGTH) {
    return `Reply message must be at most ${BOT_REPLY_MAX_LENGTH} characters.`;
  }

  const allowed = new Set(BOT_REPLY_VARIABLES[key]);
  const placeholders = normalized.match(/\{[a-z0-9_]+\}/g) || [];
  for (const placeholder of placeholders) {
    if (!allowed.has(placeholder.slice(1, -1))) {
      return `Unsupported placeholder ${placeholder} for ${key}.`;
    }
  }
  return undefined;
};

export const normalizeBotReplyTemplate = (
  key: BotReplyMessageKey,
  value: unknown,
): string | undefined => {
  const error = validateBotReplyTemplate(key, value);
  if (error) throw new Error(error);
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

export const getBotReplyTemplate = (
  messages: BotReplyMessages | undefined,
  locale: Locale,
  key: BotReplyMessageKey,
): string | undefined => {
  const value = messages?.[locale]?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
};
