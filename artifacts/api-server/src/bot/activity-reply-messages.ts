import type {
  ActivityReplyKey,
  ActivityReplyLocaleMessages,
  GroupActivityReplyMessages,
  Locale,
} from "./types";

export const ACTIVITY_REPLY_KEYS = [
  "noActive",
  "alreadyActive",
  "started",
  "settled",
  "dailyCountLimitReached",
  "timeoutReminder",
  "groupTimeoutNotification",
] as const;

export const ACTIVITY_REPLY_MAX_LENGTH = 1200;

export const ACTIVITY_REPLY_VARIABLES: Record<ActivityReplyKey, readonly string[]> = {
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
    "group_name", "group_id", "user_name", "user_id", "activity",
    "timeout_duration", "warning_time",
  ],
};

const DEFAULT_ACTIVITY_REPLY_TEMPLATES: Record<Locale, Record<ActivityReplyKey, string>> = {
  en: {
    noActive: [
      "User: {user_name}",
      "User ID: {user_id}",
      "Status: ❌ Back to Seat Check-In Failed!",
      "Reason: You do not have an active activity.",
      "Tip: Start an activity first, then use /back when you return.",
    ].join("\n"),
    alreadyActive: [
      "User: {user_name}",
      "User ID: {user_id}",
      "Status: ❌ Check-In Failed!",
      "Reason: You have an ongoing activity: {activity}",
      "Hint: Please use /back before starting another activity.",
    ].join("\n"),
    started: [
      "User: {user_name}",
      "User ID: {user_id}",
      "✅ Check-In Succeeded: {activity} - {time}",
      "Attention: This is your {count} time {activity}.",
      "Time Limit for This Activity: {limit_minutes} minutes",
      "Tip: Please check in Back to Seat after completing the activity.",
      "Back to Seat: /back",
    ].join("\n"),
    settled: [
      "User: {user_name}",
      "User ID: {user_id}",
      "✅ {start_time} Back to Seat Check-In Succeeded: {activity}",
      "Time Used for This Activity: {duration}",
      "Total {activity} time today: {today_activity_time}",
      "Total time for all activities today: {today_total_time}",
      "Today's counts — Eat: {today_eat_count} | WC: {today_wc_count} | Smoke: {today_smoke_count} | WCD: {today_wcd_count}",
      "Timeout duration: {timeout_duration}",
    ].join("\n"),
    dailyCountLimitReached: [
      "User: {user_name}",
      "User ID: {user_id}",
      "⚠️ Warning: Your daily {activity} usage has reached the limit of {count_limit} times.",
    ].join("\n"),
    timeoutReminder: [
      "User: {user_name}",
      "User ID: {user_id}",
      "⚠️ Warning: Your {activity} activity is overdue. Please return to your seat.",
      "Back to Seat: /back",
    ].join("\n"),
    groupTimeoutNotification: [
      "Group: {group_name}",
      "Group ID: {group_id}",
      "User: {user_name}",
      "User ID: {user_id}",
      "Activity: {activity}",
      "Status: Single activity exceeded time limit",
      "Overtime: {timeout_duration}",
      "Warning Time: {warning_time}",
    ].join("\n"),
  },
  zh: {
    noActive: [
      "用户：{user_name}", "用户标识：{user_id}", "状态：❌ 回座打卡失败！",
      "原因：您没有进行中的活动。", "提示：请先开始活动，返回后再使用 /back。",
    ].join("\n"),
    alreadyActive: [
      "用户：{user_name}", "用户标识：{user_id}", "状态：❌ 打卡失败！",
      "原因：您正在进行的活动：{activity}", "提示：开始其他活动前，请先使用 /back。",
    ].join("\n"),
    started: [
      "用户：{user_name}", "用户标识：{user_id}", "✅ 打卡成功：{activity} - {time}",
      "注意：这是第 {count} 次{activity}。", "本次活动时间限制：{limit_minutes} 分钟",
      "提示：活动完成后请及时打卡回座。", "回座：/back",
    ].join("\n"),
    settled: [
      "用户：{user_name}", "用户标识：{user_id}", "✅ {start_time} 回座打卡成功：{activity}",
      "本次活动耗时：{duration}", "今日累计{activity}时间：{today_activity_time}",
      "今日累计活动总时间：{today_total_time}",
      "今日次数 — 吃饭：{today_eat_count} | 上厕所：{today_wc_count} | 抽烟：{today_smoke_count} | WCD：{today_wcd_count}",
      "超时时间：{timeout_duration}",
    ].join("\n"),
    dailyCountLimitReached: [
      "用户：{user_name}", "用户标识：{user_id}",
      "⚠️ 警告：您今天使用 {activity} 的次数已达到 {count_limit} 次的上限。",
    ].join("\n"),
    timeoutReminder: [
      "用户：{user_name}", "用户标识：{user_id}",
      "⚠️ 警告：您本次{activity}已超时，请尽快回座！", "回座：/back",
    ].join("\n"),
    groupTimeoutNotification: [
      "群组：{group_name}", "群组标识：{group_id}", "用户：{user_name}", "用户标识：{user_id}",
      "打卡活动：{activity}", "状态：单次活动超过时间限制",
      "超时时长：{timeout_duration}", "提醒时间：{warning_time}",
    ].join("\n"),
  },
};

const escapeHtml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export const getDefaultActivityReplyTemplate = (locale: Locale, key: ActivityReplyKey): string =>
  DEFAULT_ACTIVITY_REPLY_TEMPLATES[locale][key];

export const validateActivityReplyTemplate = (
  locale: Locale,
  key: ActivityReplyKey,
  value: unknown,
): string | undefined => {
  if (locale !== "en" && locale !== "zh") return "Unsupported reply language.";
  if (!(ACTIVITY_REPLY_KEYS as readonly string[]).includes(key)) {
    return "Unsupported activity reply.";
  }
  if (typeof value !== "string") return "Reply template must be text.";

  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > ACTIVITY_REPLY_MAX_LENGTH) {
    return `Reply template must be at most ${ACTIVITY_REPLY_MAX_LENGTH} characters.`;
  }

  const allowed = new Set(ACTIVITY_REPLY_VARIABLES[key]);
  const placeholders = normalized.match(/\{[a-z0-9_]+\}/g) || [];
  for (const placeholder of placeholders) {
    if (!allowed.has(placeholder.slice(1, -1))) {
      return `Unsupported placeholder ${placeholder} for ${key}.`;
    }
  }
  return undefined;
};

export const normalizeActivityReplyTemplate = (
  locale: Locale,
  key: ActivityReplyKey,
  value: unknown,
): string | undefined => {
  const error = validateActivityReplyTemplate(locale, key, value);
  if (error) throw new Error(error);
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || normalized === DEFAULT_ACTIVITY_REPLY_TEMPLATES[locale][key]) return undefined;
  return normalized;
};

export const renderActivityReplyTemplate = (
  template: string,
  values: Record<string, string | number>,
): string => {
  const safeTemplate = escapeHtml(template);
  return safeTemplate.replace(/\{([a-z0-9_]+)\}/g, (placeholder, name) => {
    if (!Object.prototype.hasOwnProperty.call(values, name)) return placeholder;
    return escapeHtml(String(values[name]));
  });
};

export const getGroupActivityReplyTemplate = (
  messages: GroupActivityReplyMessages | undefined,
  groupId: number,
  locale: Locale,
  key: ActivityReplyKey,
): string | undefined => {
  const value = messages?.[String(groupId)]?.[locale]?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
};

export type ActivityReplyEditorItem = {
  value: string;
  defaultValue: string;
  customized: boolean;
  variables: readonly string[];
};

export type ActivityReplyEditorLocale = Record<ActivityReplyKey, ActivityReplyEditorItem>;

export const buildActivityReplyEditorLocale = (
  locale: Locale,
  messages: ActivityReplyLocaleMessages | undefined,
): ActivityReplyEditorLocale => {
  const result = {} as ActivityReplyEditorLocale;
  for (const key of ACTIVITY_REPLY_KEYS) {
    const custom = messages?.[key];
    const defaultValue = getDefaultActivityReplyTemplate(locale, key);
    const hasCustom = typeof custom === "string" && custom.trim() !== "";
    result[key] = {
      value: hasCustom ? custom : defaultValue,
      defaultValue,
      customized: hasCustom && custom !== defaultValue,
      variables: ACTIVITY_REPLY_VARIABLES[key],
    };
  }
  return result;
};
