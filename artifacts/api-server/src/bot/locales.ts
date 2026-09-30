import type {
  ActivityKind,
  ActiveActivity,
  ActivityRecord,
  ActivityLimits,
  Locale,
  UserProfile,
} from "./types";

type LocaleText = {
  title: string;
  help: string;
  noActive: (displayName: string, userId: number) => string;
  alreadyActive: (
    displayName: string,
    userId: number,
    activity: string,
  ) => string;
  started: (
    displayName: string,
    userId: number,
    activity: string,
    time: string,
    occurrence: number,
    limitMinutes: number,
  ) => string;
  settled: (
    displayName: string,
    userId: number,
    activity: string,
    startTime: string,
    durationSeconds: number,
    limitMinutes: number,
    todayActivitySeconds: number,
    todayTotalSeconds: number,
    todayCounts: Record<ActivityKind, number>,
  ) => string;
  timeoutReminder: (
    displayName: string,
    userId: number,
    activity: string,
  ) => string;
  connectPrompt: string;
  connectUsage: string;
  connectAdminOnly: string;
  connectSuccess: (groupName: string, groupId: number) => string;
  connectInvalid: string;
  groupTimeoutNotification: (
    groupName: string,
    groupId: number,
    username: string | undefined,
    displayName: string,
    userId: number,
    activity: string,
    timeoutSeconds: number,
  ) => string;
  shiftStarted: (time: string) => string;
  shiftEnded: (time: string) => string;
  languageChanged: string;
  languageUsage: string;
  unknownLanguage: string;
  unknownCommand: string;
  buttons: {
    wc: string;
    smoke: string;
    wcd: string;
    back: string;
  };
  adminOnly: string;
  limitPrivate: string;
  limitUsage: string;
  unknownActivity: string;
  invalidLimit: string;
  limits: (limits: ActivityLimits) => string;
  limitUpdated: (activity: string, minutes: number) => string;
  dailyCountLimitReached: (displayName: string, userId: number, activity: string, countLimit: number) => string;
  countLimitPrivate: string;
  countLimitUsage: string;
  invalidCountLimit: string;
  countLimits: (limits: Partial<Record<ActivityKind, number>>) => string;
  countLimitUpdated: (activity: string, count: number) => string;
  reminderPrivate: string;
  reminderUsage: string;
  reminderStatus: (enabled: boolean) => string;
  reminderUpdated: (enabled: boolean) => string;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const userLink = (text: string, userId: number): string =>
  `<a href="tg://user?id=${userId}">${escapeHtml(text)}</a>`;

const inlineCode = (value: string | number): string =>
  `<code>${escapeHtml(String(value))}</code>`;

const divider = inlineCode("--------------------");

const userIdentity = (displayName: string, userId: number) => ({
  name: userLink(displayName, userId),
  id: inlineCode(userId),
});

const formatChineseDuration = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${pad(hours)} 小时 ${pad(minutes)} 分钟 ${pad(seconds)} 秒`
    : `${pad(minutes)} 分钟 ${pad(seconds)} 秒`;
};

const formatEnglishDuration = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const getTimeoutSeconds = (durationSeconds: number, limitMinutes: number) =>
  Math.max(0, Math.floor(durationSeconds - limitMinutes * 60));

const zh: LocaleText = {
  title: "打卡机器人 M58",
  help: [
    "可用命令：",
    `${inlineCode("/work")} — 上班`,
    `${inlineCode("/back")} — 回座并结算当前活动`,
    `${inlineCode("/eat")} — 吃饭`,
    `${inlineCode("/wc")} — 上厕所`,
    `${inlineCode("/smoke")} — 抽烟`,
    `${inlineCode("/wcd")} — WCD`,
    `${inlineCode("/offwork")} — 下班`,
    `${inlineCode("/lang en")} — 切换英文`,
    `${inlineCode("/lang zh")} — 切换中文`,
    "",
    `活动开始后请在回座时使用 ${inlineCode("/back")}。`,
  ].join("\n"),
  noActive: (displayName, userId) => [
    "用户：" + userLink(displayName, userId),
    "用户标识：" + inlineCode(userId),
    "状态：" + inlineCode("❌ 回座打卡失败！"),
    "原因：" + inlineCode("您没有进行中的活动"),
    "您可以————",
    inlineCode("上厕所"),
    inlineCode("抽烟"),
    inlineCode("WCD"),
  ].join("\n"),
  alreadyActive: (displayName, userId, activity) => {
    const identity = userIdentity(displayName, userId);
    return [
      `用户：${identity.name}`,
      `用户标识：${identity.id}`,
      divider,
      `状态：❌ ${inlineCode("打卡失败！")}`,
      `原因：你正在进行的活动，${inlineCode(activity)}`,
      divider,
      `提示：${inlineCode("进行其他活动前，请先回座")}`,
      divider,
      `回座：${inlineCode("/back")}`,
    ].join("\n");
  },
  started: (displayName, userId, activity, time, occurrence, limitMinutes) => {
    const identity = userIdentity(displayName, userId);
    return [
      `用户：${identity.name}`,
      `用户标识：${identity.id}`,
      `✅ 打卡成功：${inlineCode(activity)} - ${inlineCode(time)}`,
      `注意：这是第 ${inlineCode(occurrence)} 次${inlineCode(activity)}`,
      `本次活动时间限制：${inlineCode(`${limitMinutes} 分钟`)}`,
      `提示：${inlineCode("活动完成后请及时打卡回座")}`,
      `回座：${inlineCode("/back")}`,
    ].join("\n");
  },
  settled: (
    displayName,
    userId,
    activity,
    startTime,
    durationSeconds,
    limitMinutes,
    todayActivitySeconds,
    todayTotalSeconds,
    todayCounts,
  ) => {
    const identity = userIdentity(displayName, userId);
    const timeoutSeconds = getTimeoutSeconds(durationSeconds, limitMinutes);
    return [
      `用户：${identity.name}`,
      `用户标识：${identity.id}`,
      `✅ ${inlineCode(startTime)} 回座打卡成功：${inlineCode(activity)}`,
      "提示：本次活动时间已结算。",
      `本次活动耗时：${inlineCode(formatChineseDuration(durationSeconds))}`,
      `今日累计${inlineCode(activity)}时间：${inlineCode(formatChineseDuration(todayActivitySeconds))}`,
      `今日累计活动总时间：${inlineCode(formatChineseDuration(todayTotalSeconds))}`,
      ...(timeoutSeconds > 0
        ? [
            "⚠️ 警告：本次活动已超时！",
            `超时时间：${inlineCode(formatChineseDuration(timeoutSeconds))}`,
          ]
        : []),
      divider,
      ...(["wc", "smoke", "wcd", "eat"] as ActivityKind[])
        .filter((kind) => todayCounts[kind] > 0)
        .map(
          (kind) =>
            `本日${activityLabel(kind, "zh")}：${inlineCode(`${todayCounts[kind]} 次`)}`,
        ),
    ].join("\n");
  },
  dailyCountLimitReached: (displayName, userId, activity, countLimit) => [
    "用户：" + inlineCode(displayName),
    "用户标识：" + inlineCode(userId),
    "⚠️ 警告：" + inlineCode("您今天使用 " + activity + " 的次数已达到 " + countLimit + " 次的上限"),
    "您可以————",
    "上厕所：" + inlineCode("/wc"),
    "抽烟：" + inlineCode("/smoke"),
    "WCD：" + inlineCode("/wcd"),
  ].join("\n"),
  timeoutReminder: (displayName, userId, activity) => {
    const identity = userIdentity(displayName, userId);
    return [
      `用户：${identity.name}`,
      `用户标识：${identity.id}`,
      `⚠️ 警告：您本次${inlineCode(activity)}已超时，请尽快回座！`,
      `回座：${inlineCode("/back")}`,
    ].join("\n");
  },
  connectPrompt: "请输入要连接的群组 ID 或群组链接。",
  connectUsage: "用法：在群组中发送 /connect，然后发送目标群组 ID 或公开群组链接。",
  connectAdminOnly: "只有本群组的群主或管理员可以使用 /connect。",
  connectSuccess: (groupName, groupId) => [
    "✅ 连接成功",
    `群组：${inlineCode(groupName)}`,
    `群组标识：${inlineCode(groupId)}`,
  ].join("\n"),
  connectInvalid: "无法识别或访问该群组。请确认 Bot 已加入目标群组，并输入正确的群组 ID；公开群组也可以使用 t.me 链接。",
  groupTimeoutNotification: (groupName, groupId, username, displayName, userId, activity, timeoutSeconds) => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    const openGroup = username
      ? `<a href="https://t.me/${encodeURIComponent(username)}">打开群</a>`
      : "打开群";
    return [
      `群组名称：${inlineCode(groupName)}`,
      `群组：${openGroup}【${inlineCode(activity)}】`,
      `群组标识：${inlineCode(groupId)}`,
      `用户：${userLink(displayName, userId)}`,
      `用户标识：${inlineCode(userId)}`,
      `打卡活动：${inlineCode(activity)}`,
      `状态：${inlineCode("单次活动超过时间限制")}`,
      `超时时长：${inlineCode(pad(minutes) + "分钟 " + pad(seconds) + "秒")}`,
    ].join("\n");
  },
  shiftStarted: (time) => `✅ 上班打卡成功：${inlineCode(time)}`,
  shiftEnded: (time) => `✅ 下班打卡成功：${inlineCode(time)}`,
  languageChanged: "语言已切换为中文。",
  languageUsage: "用法：/lang zh 或 /lang en（/lang eng 也可以）",
  unknownLanguage: "支持的语言：zh（中文）、en/eng（English）。",
  unknownCommand: "未知命令。请使用 /help 查看可用命令。",
  buttons: { wc: "上厕所", smoke: "抽烟", wcd: "WCD", back: "回座" },
  adminOnly: "此命令仅限 Bot owner/admin 使用。",
  limitPrivate: "请在 Bot 私聊中使用此命令。",
  limitUsage: "用法：/limit <eat|wc|smoke|wcd> <分钟数>，例如：/limit wc 10",
  unknownActivity: "支持的 activity：eat、wc、smoke、wcd。",
  invalidLimit: "分钟数必须是大于 0 的整数。",
  limits: (limits) =>
    [
      "当前活动时间限制：",
      `吃饭 / eat：${inlineCode(`${limits.eat} 分钟`)}`,
      `上厕所 / wc：${inlineCode(`${limits.wc} 分钟`)}`,
      `抽烟 / smoke：${inlineCode(`${limits.smoke} 分钟`)}`,
      `WCD / wcd：${inlineCode(`${limits.wcd} 分钟`)}`,
    ].join("\n"),
  limitUpdated: (activity, minutes) =>
    `✅ 已将 ${inlineCode(activity)} 的活动时间限制设置为 ${inlineCode(`${minutes} 分钟`)}。`,
  countLimitPrivate: "请在 Bot 私聊中使用此命令。",
  countLimitUsage: "用法：/countlimit <eat|wc|smoke|wcd> <次数>，例如：/countlimit wcd 2",
  invalidCountLimit: "次数必须是大于 0 的整数。",
  countLimits: (limits) => [
    "当前每日使用次数限制：",
    `吃饭 / eat：${inlineCode(limits.eat ?? "未设置")}`,
    `上厕所 / wc：${inlineCode(limits.wc ?? "未设置")}`,
    `抽烟 / smoke：${inlineCode(limits.smoke ?? "未设置")}`,
    `WCD / wcd：${inlineCode(limits.wcd ?? "未设置")}`,
  ].join("\n"),
  countLimitUpdated: (activity, count) =>
    `✅ 已将 ${inlineCode(activity)} 的每日使用次数上限设置为 ${inlineCode(`${count} 次`)}。`,
  reminderPrivate: "请在 Bot 私聊中使用此命令。",
  reminderUsage: "用法：/reminder on 或 /reminder off",
  reminderStatus: (enabled) =>
    `超时提醒当前：${inlineCode(enabled ? "开启" : "关闭")}（45 秒宽限）`,
  reminderUpdated: (enabled) =>
    `✅ 超时提醒已${enabled ? "开启" : "关闭"}（45 秒宽限）。`,
};

const en: LocaleText = {
  title: "Attendance Bot M58",
  help: [
    "Available commands:",
    `${inlineCode("/work")} — Start work`,
    `${inlineCode("/back")} — Return to seat and settle activity`,
    `${inlineCode("/eat")} — Meal break`,
    `${inlineCode("/wc")} — Toilet`,
    `${inlineCode("/smoke")} — Smoke break`,
    `${inlineCode("/wcd")} — WCD`,
    `${inlineCode("/offwork")} — End work`,
    `${inlineCode("/lang en")} — Switch to English`,
    `${inlineCode("/lang zh")} — Switch to Chinese`,
    "",
    `Use ${inlineCode("/back")} when you return.`,
  ].join("\n"),
  noActive: (displayName, userId) => [
    "User: " + userLink(displayName, userId),
    "User ID: " + inlineCode(userId),
    "Status: " + inlineCode("❌ Back to Seat Check-In Failed!"),
    "Reason: " + inlineCode("You do not have an active activity"),
    "You can use:",
    inlineCode("Toilet"),
    inlineCode("Smoke"),
    inlineCode("WCD"),
  ].join("\n"),
  alreadyActive: (displayName, userId, activity) => {
    const identity = userIdentity(displayName, userId);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      divider,
      `Status: ❌ ${inlineCode("Check-In Failed!")}`,
      `Reason: You have an ongoing activity, ${inlineCode(activity)}`,
      divider,
      `Hint: ${inlineCode("Please Back to Seat before engaging in other activities.")}`,
      divider,
      `Back to Seat: ${inlineCode("/back")}`,
    ].join("\n");
  },
  started: (displayName, userId, activity, time, occurrence, limitMinutes) => {
    const identity = userIdentity(displayName, userId);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      divider,
      `✅ Check-In Succeeded: ${inlineCode(activity)} - ${inlineCode(time)}`,
      `Attention: This is your ${inlineCode(`${occurrence} time ${activity}`)}.`,
      divider,
      `Time Limit for This Activity: ${inlineCode(`${limitMinutes} minute`)}`,
      divider,
      "Tip: Please check in Back to seat after completing the activity.",
      divider,
      `Back to Seat: ${inlineCode("/back")}`,
    ].join("\n");
  },
  settled: (
    displayName,
    userId,
    activity,
    startTime,
    durationSeconds,
    limitMinutes,
    todayActivitySeconds,
    todayTotalSeconds,
    todayCounts,
  ) => {
    const identity = userIdentity(displayName, userId);
    const timeoutSeconds = getTimeoutSeconds(durationSeconds, limitMinutes);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      divider,
      `✅ ${inlineCode(startTime)} Back to Seat Check-In Succeeded: ${inlineCode(activity)}`,
      divider,
      "Hint: This activity's time has been settled.",
      divider,
      `Time Used for This Activity: ${inlineCode(formatEnglishDuration(durationSeconds))}`,
      divider,
      `Total ${inlineCode(activity)} time today: ${inlineCode(formatEnglishDuration(todayActivitySeconds))}`,
      `Total time for all activities today: ${inlineCode(formatEnglishDuration(todayTotalSeconds))}`,
      ...(timeoutSeconds > 0
        ? [
            "⚠️ Warning: You have exceeded the time limit for this activity!",
            `Timeout duration for Activity: ${inlineCode(formatEnglishDuration(timeoutSeconds))}`,
          ]
        : []),
      divider,
      ...(["wc", "smoke", "wcd", "eat"] as ActivityKind[])
        .filter((kind) => todayCounts[kind] > 0)
        .map(
          (kind) =>
            `Today's ${activityLabel(kind, "en")}: ${inlineCode(`${todayCounts[kind]} times`)}`,
        ),
    ].join("\n");
  },
  dailyCountLimitReached: (displayName, userId, activity, countLimit) => [
    "User: " + inlineCode(displayName),
    "User ID: " + inlineCode(userId),
    "⚠️ Warning: " + inlineCode("Your daily " + activity + " usage has reached the limit of " + countLimit + " times."),
    "You can use:",
    "Toilet: " + inlineCode("/wc"),
    "Smoke: " + inlineCode("/smoke"),
    "WCD: " + inlineCode("/wcd"),
  ].join("\n"),
  timeoutReminder: (displayName, userId, activity) => {
    const identity = userIdentity(displayName, userId);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      `⚠️ Warning: Your ${inlineCode(activity)} activity is overdue. Please return to your seat.`,
      `Back to Seat: ${inlineCode("/back")}`,
    ].join("\n");
  },
  connectPrompt: "Please send the target group ID or group link.",
  connectUsage: "Use /connect in a group, then send the target group ID or public group link.",
  connectAdminOnly: "Only the group owner or an administrator of this group can use /connect.",
  connectSuccess: (groupName, groupId) => [
    "✅ Connection successful",
    `Group: ${inlineCode(groupName)}`,
    `Group ID: ${inlineCode(groupId)}`,
  ].join("\n"),
  connectInvalid: "I could not identify or access that group. Make sure the bot is in the target group and send a valid group ID; public groups can also use a t.me link.",
  groupTimeoutNotification: (groupName, groupId, username, displayName, userId, activity, timeoutSeconds) => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    const openGroup = username
      ? `<a href="https://t.me/${encodeURIComponent(username)}">Open Group</a>`
      : "Open Group";
    return [
      `Group Name: ${inlineCode(groupName)}`,
      `Group: ${openGroup}【${inlineCode(activity)}】`,
      `Group ID: ${inlineCode(groupId)}`,
      `User: ${userLink(displayName, userId)}`,
      `User ID: ${inlineCode(userId)}`,
      `Activity: ${inlineCode(activity)}`,
      `Status: ${inlineCode("Single activity exceeded time limit")}`,
      `Overtime: ${inlineCode(pad(minutes) + "m " + pad(seconds) + "s")}`,
    ].join("\n");
  },
  shiftStarted: (time) => `✅ Work check-in succeeded: ${inlineCode(time)}`,
  shiftEnded: (time) => `✅ Work check-out succeeded: ${inlineCode(time)}`,
  languageChanged: "Language switched to English.",
  languageUsage: "Usage: /lang zh or /lang en (/lang eng also works)",
  unknownLanguage: "Supported languages: zh (中文), en/eng (English).",
  unknownCommand: "Unknown command. Use /help to see available commands.",
  buttons: { wc: "Toilet", smoke: "Smoke", wcd: "WCD", back: "Back" },
  adminOnly: "This command is only available to the bot owner/admins.",
  limitPrivate: "Please use this command in the bot private chat.",
  limitUsage:
    "Usage: /limit <eat|wc|smoke|wcd> <minutes>, for example: /limit wc 10",
  unknownActivity: "Supported activities: eat, wc, smoke, wcd.",
  invalidLimit: "Minutes must be a positive integer.",
  limits: (limits) =>
    [
      "Current activity limits:",
      `Meal / eat: ${inlineCode(`${limits.eat} minutes`)}`,
      `Toilet / wc: ${inlineCode(`${limits.wc} minutes`)}`,
      `Smoke / smoke: ${inlineCode(`${limits.smoke} minutes`)}`,
      `WCD / wcd: ${inlineCode(`${limits.wcd} minutes`)}`,
    ].join("\n"),
  limitUpdated: (activity, minutes) =>
    `✅ ${inlineCode(activity)} activity limit set to ${inlineCode(`${minutes} minutes`)}.`,
  countLimitPrivate: "Please use this command in the bot private chat.",
  countLimitUsage: "Usage: /countlimit <eat|wc|smoke|wcd> <count>, for example: /countlimit wcd 2",
  invalidCountLimit: "Count must be a positive integer.",
  countLimits: (limits) => [
    "Current daily usage limits:",
    `Meal / eat: ${inlineCode(limits.eat ?? "Not set")}`,
    `Toilet / wc: ${inlineCode(limits.wc ?? "Not set")}`,
    `Smoke / smoke: ${inlineCode(limits.smoke ?? "Not set")}`,
    `WCD / wcd: ${inlineCode(limits.wcd ?? "Not set")}`,
  ].join("\n"),
  countLimitUpdated: (activity, count) =>
    `✅ Daily ${inlineCode(activity)} usage limit set to ${inlineCode(`${count} times`)}.`,
  reminderPrivate: "Please use this command in the bot private chat.",
  reminderUsage: "Usage: /reminder on or /reminder off",
  reminderStatus: (enabled) =>
    `Overdue reminder is currently ${inlineCode(enabled ? "ON" : "OFF")} (45-second grace).`,
  reminderUpdated: (enabled) =>
    `✅ Overdue reminder has been turned ${enabled ? "ON" : "OFF"} (45-second grace).`,
};

export const getLocale = (locale: Locale): LocaleText =>
  locale === "en" ? en : zh;

export const activityLabel = (kind: ActivityKind, locale: Locale): string => {
  const labels = {
    zh: { eat: "吃饭", wc: "上厕所", smoke: "抽烟", wcd: "WCD" },
    en: { eat: "Meal", wc: "Toilet", smoke: "Smoke", wcd: "Big toilet" },
  };
  return labels[locale][kind];
};

export const helpText = (locale: Locale): string => getLocale(locale).help;

export const formatUserLine = (
  user: Pick<UserProfile, "displayName" | "username">,
): string =>
  user.username ? `${user.displayName} (@${user.username})` : user.displayName;

export type ActivitySummary = {
  count: number;
  seconds: number;
};

export const summarizeActivity = (
  records: ActivityRecord[],
  active: ActiveActivity | undefined,
  kind: ActivityKind,
  dayStart: string,
  now: Date,
): ActivitySummary => {
  const startMs = new Date(dayStart).getTime();
  const endMs = now.getTime();
  const completed = records.filter(
    (record) =>
      record.kind === kind &&
      new Date(record.endedAt).getTime() >= startMs &&
      new Date(record.endedAt).getTime() <= endMs,
  );
  const activeSeconds =
    active && active.kind === kind
      ? Math.max(
          0,
          Math.floor((endMs - new Date(active.startedAt).getTime()) / 1000),
        )
      : 0;
  return {
    count: completed.length + (active?.kind === kind ? 1 : 0),
    seconds:
      completed.reduce((total, record) => total + record.elapsedSeconds, 0) +
      activeSeconds,
  };
};
