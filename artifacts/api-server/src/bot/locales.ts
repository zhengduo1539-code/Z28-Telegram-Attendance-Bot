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
  startWelcome: string;
  help: string;
  idInfo: (chatId: number, userId: number) => string;
  botStats: (privateUsers: number, groups: number) => string;
  botStatsPrivate: string;
  adminPanelPrompt: string;
  adminPrivate: string;
  adminMiniAppUnavailable: string;
  telegramUi: {
    userMenuButton: string;
    adminMenuButton: string;
    addBotToGroupButton: string;
    openGroupAdminPanelButton: string;
    groupAdminPanelPrompt: string;
    addBotToGroupPrompt: string;
    inputFieldPlaceholder: string;
  };
  commandMenu: {
    user: Array<{ command: string; description: string }>;
    admin: Array<{ command: string; description: string }>;
  };
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
  connectSelf: string;
  connectInvalid: string;
  groupTimeoutNotification: (
    groupName: string,
    groupId: number,
    username: string | undefined,
    displayName: string,
    userId: number,
    activity: string,
    timeoutSeconds: number,
    warningTime?: string,
  ) => string;
  shiftStarted: (time: string) => string;
  workCheckIn: (displayName: string, userId: number, checkedAt: string) => string;
  shiftEnded: (time: string) => string;
  languageChanged: string;
  languageUsage: string;
  languagePicker: string;
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

const formatBurmeseDuration = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${pad(hours)} နာရီ ${pad(minutes)} မိနစ် ${pad(seconds)} စက္ကန့်`
    : `${pad(minutes)} မိနစ် ${pad(seconds)} စက္ကန့်`;
};

const zh: LocaleText = {
  title: "打卡机器人 M58",
  startWelcome: [
    "欢迎使用打卡机器人！",
    `请使用 ${inlineCode("/help")} 查看所有可用命令及使用说明。`,
  ].join("\n"),
  help: [
    "可用命令：",
    `${inlineCode("/work")} — 上班`,
    `${inlineCode("/back")} — 回座并结算当前活动`,
    `${inlineCode("/eat")} — 吃饭`,
    `${inlineCode("/wc")} — 上厕所`,
    `${inlineCode("/smoke")} — 抽烟`,
    `${inlineCode("/wcd")} — WCD`,
    `${inlineCode("/offwork")} — 下班`,
    `${inlineCode("/lang")} — 选择语言`,
    `${inlineCode("/id")} — 查看当前群组 ID 或用户 ID（私聊中显示用户 ID）`,
    "",
    "",
    `活动开始后请在回座时使用 ${inlineCode("/back")}。`,
  ].join("\n"),
  idInfo: (chatId, userId) => `群组标识：${inlineCode(chatId)}\n用户标识：${inlineCode(userId)}`,
  botStatsPrivate: "请在私聊中使用 /stats。",
  adminPanelPrompt: "点击下面的按钮打开管理面板。",
  adminPrivate: "请在 Bot 私聊中打开管理面板。",
  adminMiniAppUnavailable: "管理面板当前不可用，请稍后再试。",
  telegramUi: {
    userMenuButton: "📊 我的面板",
    adminMenuButton: "⚙️ 管理面板",
    addBotToGroupButton: "➕ 将 Bot 添加到群组",
    openGroupAdminPanelButton: "⚙️ 打开群组管理面板",
    groupAdminPanelPrompt: "打开群组管理面板：",
    addBotToGroupPrompt: "团队需要使用活动打卡功能？请先将 Bot 添加到群组：",
    inputFieldPlaceholder: "请直接点击按钮打卡",
  },
  commandMenu: {
    user: [
      { command: "start", description: "开始使用" },
      { command: "work", description: "上班打卡" },
      { command: "back", description: "回座并结算活动" },
      { command: "eat", description: "吃饭休息" },
      { command: "wc", description: "上厕所" },
      { command: "smoke", description: "抽烟休息" },
      { command: "wcd", description: "WCD" },
      { command: "offwork", description: "下班打卡" },
      { command: "help", description: "帮助" },
      { command: "lang", description: "选择语言" },
    ],
    admin: [
      { command: "start", description: "开始使用" },
      { command: "limit", description: "设置活动时间限制" },
      { command: "limits", description: "查看活动时间限制" },
      { command: "countlimit", description: "设置每日活动次数限制" },
      { command: "countlimits", description: "查看每日活动次数限制" },
      { command: "reminder", description: "开启/关闭超时提醒" },
      { command: "reminders", description: "查看超时提醒状态" },
      { command: "stats", description: "查看 Bot 统计" },
    ],
  },
  botStats: (privateUsers, groups) => [
    "📊 Bot Statistics",
    "",
    `👤 Users (PM): ${inlineCode(privateUsers)}`,
    `👥 Groups: ${inlineCode(groups)}`,
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
  connectPrompt: [
    "请输入要连接的群组 ID 或群组链接。",
    `如果群组 ID 或链接填写错误，请使用 ${inlineCode("/id")} 查看群组 ID。`,
    `然后使用 ${inlineCode("/connect -1234567890")} 重新连接。`,
  ].join("\n"),
  connectUsage: "用法：在群组中发送 /connect，然后发送目标群组 ID 或公开群组链接。",
  connectAdminOnly: "只有本群组的群主或管理员可以使用 /connect。",
  connectSelf: [
    `❌ ${inlineCode("连接失败")}`,
    `您输入的群组 ID 是当前群组的 ID。`,
    `当前群组是 ${inlineCode("Target Group（接收超时警告）")}。`,
    `请使用活动所在群组的 ID，例如：${inlineCode("/connect -1234567890")}`,
    `这样活动群组超时后使用 ${inlineCode("/back")}，警告消息才会发送到当前群组。`,
  ].join("\n"),
  connectSuccess: (groupName, groupId) => [
    "✅ 连接成功",
    `群组：${inlineCode(groupName)}`,
    `群组标识：${inlineCode(groupId)}`,
  ].join("\n"),
  connectInvalid: [
    "无法识别或访问该群组。",
    `请使用 ${inlineCode("/id")} 查看正确的群组 ID，然后发送 ${inlineCode("/connect -1234567890")} 进行连接。`,
    "请确认 Bot 已加入目标群组；公开群组也可以使用 t.me 链接。",
  ].join("\n"),
  groupTimeoutNotification: (groupName, groupId, username, displayName, userId, activity, timeoutSeconds, warningTime) => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return [
      `群组：${inlineCode("打开群【" + groupName + "】")}`,
      `群组标识：${inlineCode(groupId)}`,
      `用户：${inlineCode(displayName)}`,
      `用户标识：${inlineCode(userId)}`,
      `打卡活动：${inlineCode(activity.toUpperCase())}`,
      `状态：${inlineCode("单次活动超过时间限制")}`,
      `超时时长：${inlineCode(pad(minutes) + "分钟 " + pad(seconds) + "秒")}`,
    ].join("\n");
  },
  workCheckIn: (displayName, userId, checkedAt) => [
    `用户：${userLink(displayName, userId)}`,
    `用户标识：${inlineCode(userId)}`,
    `上班打卡时间：${inlineCode(checkedAt)}`,
  ].join("\n"),
  shiftStarted: (time) => `✅ 上班打卡成功：${inlineCode(time)}`,
  shiftEnded: (time) => `✅ 下班打卡成功：${inlineCode(time)}`,
  languageChanged: "语言已切换为中文。",
  languageUsage: "请使用 /lang，然后点击按钮选择语言。",
  languagePicker: "请选择您要使用的语言。",
  unknownLanguage: "支持的语言：zh（简体中文）、en（English）、mm（缅甸语）。",
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

const mm: LocaleText = {
  title: "Attendance Bot",
  startWelcome: [
    "Attendance Bot မှ ကြိုဆိုပါတယ်။",
    `${inlineCode("/help")} ကိုသုံးပြီး ရရှိနိုင်သော command များနှင့် အသုံးပြုပုံကို ကြည့်နိုင်ပါတယ်။`,
  ].join("\n"),
  help: [
    "အသုံးပြုနိုင်သော command များ:",
    `${inlineCode("/work")} — အလုပ်စဝင်မည်`,
    `${inlineCode("/back")} — ထိုင်ခုံသို့ပြန်ပြီး လက်ရှိ activity ကို အပြီးသတ်မည်`,
    `${inlineCode("/eat")} — အစားအသောက်နားချိန်`,
    `${inlineCode("/wc")} — အိမ်သာ`,
    `${inlineCode("/smoke")} — ဆေးလိပ်နားချိန်`,
    `${inlineCode("/wcd")} — WCD`,
    `${inlineCode("/offwork")} — အလုပ်ဆင်းမည်`,
    `${inlineCode("/lang")} — ဘာသာစကားရွေးချယ်မည်`,
    `${inlineCode("/id")} — လက်ရှိ group ID သို့မဟုတ် user ID ကိုကြည့်မည်`,
    "",
    `Activity စတင်ပြီးနောက် ပြန်လာသောအခါ ${inlineCode("/back")} ကိုသုံးပါ။`,
  ].join("\n"),
  idInfo: (chatId, userId) => `Group ID: ${inlineCode(chatId)}\nUser ID: ${inlineCode(userId)}`,
  botStatsPrivate: "ကျေးဇူးပြု၍ /stats ကို Bot private chat ထဲတွင်အသုံးပြုပါ။",
  telegramUi: {
    userMenuButton: "📊 ကျွန်ုပ်၏ Dashboard",
    adminMenuButton: "⚙️ စီမံခန့်ခွဲမှု Panel",
    addBotToGroupButton: "➕ Bot ကို Group ထဲထည့်ရန်",
    openGroupAdminPanelButton: "⚙️ Group Admin Panel ဖွင့်ရန်",
    groupAdminPanelPrompt: "Group Admin Panel ကို ဖွင့်ရန်:",
    addBotToGroupPrompt: "Team အတွက် activity check-in အသုံးပြုမည်ဆိုပါက Bot ကို Group ထဲသို့ အရင်ထည့်ပါ:",
    inputFieldPlaceholder: "Check-in လုပ်ရန် button ကိုနှိပ်ပါ",
  },
  commandMenu: {
    user: [
      { command: "start", description: "Bot စတင်ရန်" },
      { command: "work", description: "အလုပ်စဝင်ရန်" },
      { command: "back", description: "ထိုင်ခုံသို့ပြန်ရန်" },
      { command: "eat", description: "အစားအသောက်နားချိန်" },
      { command: "wc", description: "အိမ်သာနားချိန်" },
      { command: "smoke", description: "ဆေးလိပ်နားချိန်" },
      { command: "wcd", description: "WCD" },
      { command: "offwork", description: "အလုပ်ဆင်းရန်" },
      { command: "help", description: "အကူအညီ" },
      { command: "lang", description: "ဘာသာစကား" },
    ],
    admin: [
      { command: "start", description: "Bot စတင်ရန်" },
      { command: "limit", description: "Activity အချိန်ကန့်သတ်ချက် သတ်မှတ်ရန်" },
      { command: "limits", description: "Activity အချိန်ကန့်သတ်ချက် ကြည့်ရန်" },
      { command: "countlimit", description: "နေ့စဉ် Activity အကြိမ်ရေ ကန့်သတ်ချက် သတ်မှတ်ရန်" },
      { command: "countlimits", description: "နေ့စဉ် Activity အကြိမ်ရေ ကန့်သတ်ချက် ကြည့်ရန်" },
      { command: "reminder", description: "အချိန်ကျော်သတိပေးချက် ဖွင့်/ပိတ်ရန်" },
      { command: "reminders", description: "အချိန်ကျော်သတိပေးချက် အခြေအနေကြည့်ရန်" },
      { command: "stats", description: "Bot စာရင်းအင်းများ ကြည့်ရန်" },
    ],
  },
  adminPanelPrompt: "အောက်ပါ button ကိုနှိပ်ပြီး Admin Panel ကိုဖွင့်ပါ။",
  adminPrivate: "ကျေးဇူးပြု၍ Bot private chat ထဲမှ Admin Panel ကိုဖွင့်ပါ။",
  adminMiniAppUnavailable: "Admin Panel ကို လက်ရှိအသုံးမပြုနိုင်သေးပါ။ နောက်မှထပ်ကြိုးစားပါ။",
  botStats: (privateUsers, groups) => [
    "📊 Bot Statistics",
    "",
    `👤 Users (PM): ${inlineCode(privateUsers)}`,
    `👥 Groups: ${inlineCode(groups)}`,
  ].join("\n"),
  noActive: (displayName, userId) => [
    "User: " + userLink(displayName, userId),
    "User ID: " + inlineCode(userId),
    "Status: " + inlineCode("❌ ထိုင်ခုံသို့ပြန် Check-In မအောင်မြင်ပါ။"),
    "အကြောင်းရင်း: " + inlineCode("လက်ရှိလုပ်ဆောင်နေသော activity မရှိပါ။"),
    "အသုံးပြုနိုင်သည်:",
    inlineCode("အိမ်သာ"),
    inlineCode("ဆေးလိပ်"),
    inlineCode("WCD"),
  ].join("\n"),
  alreadyActive: (displayName, userId, activity) => {
    const identity = userIdentity(displayName, userId);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      divider,
      `Status: ❌ ${inlineCode("Check-In မအောင်မြင်ပါ။")}`,
      `အကြောင်းရင်း: လက်ရှိ ${inlineCode(activity)} activity လုပ်ဆောင်နေပါသည်။`,
      divider,
      `အကြံပြုချက်: အခြား activity မစတင်မီ ${inlineCode("/back")} ကိုအရင်သုံးပါ။`,
      divider,
      `ထိုင်ခုံသို့ပြန်ရန်: ${inlineCode("/back")}`,
    ].join("\n");
  },
  started: (displayName, userId, activity, time, occurrence, limitMinutes) => {
    const identity = userIdentity(displayName, userId);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      divider,
      `✅ Check-In အောင်မြင်ပါသည်: ${inlineCode(activity)} - ${inlineCode(time)}`,
      `သတိ: ယခုသည် ${inlineCode(`${occurrence} ကြိမ်မြောက် ${activity}`)} ဖြစ်ပါသည်။`,
      divider,
      `ဤ activity အတွက် အချိန်ကန့်သတ်ချက်: ${inlineCode(`${limitMinutes} မိနစ်`)}`,
      divider,
      "အကြံပြုချက်: Activity ပြီးဆုံးပါက အချိန်မီ ထိုင်ခုံသို့ပြန်ပြီး check-in လုပ်ပါ။",
      divider,
      `ထိုင်ခုံသို့ပြန်ရန်: ${inlineCode("/back")}`,
    ].join("\n");
  },
  settled: (
    displayName, userId, activity, startTime, durationSeconds, limitMinutes,
    todayActivitySeconds, todayTotalSeconds, todayCounts,
  ) => {
    const identity = userIdentity(displayName, userId);
    const timeoutSeconds = getTimeoutSeconds(durationSeconds, limitMinutes);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      divider,
      `✅ ${inlineCode(startTime)} ထိုင်ခုံသို့ပြန် Check-In အောင်မြင်ပါသည်: ${inlineCode(activity)}`,
      divider,
      "ဤ activity ၏ အချိန်ကို အပြီးသတ်တွက်ချက်ပြီးပါပြီ။",
      divider,
      `ဤ activity အသုံးပြုချိန်: ${inlineCode(formatBurmeseDuration(durationSeconds))}`,
      divider,
      `ယနေ့ ${inlineCode(activity)} စုစုပေါင်းအချိန်: ${inlineCode(formatBurmeseDuration(todayActivitySeconds))}`,
      `ယနေ့ activity အားလုံး စုစုပေါင်းအချိန်: ${inlineCode(formatBurmeseDuration(todayTotalSeconds))}`,
      ...(timeoutSeconds > 0
        ? [
            "⚠️ သတိပေးချက်: ဤ activity ၏ အချိန်ကန့်သတ်ချက်ကို ကျော်လွန်သွားပါပြီ။",
            `ကျော်လွန်ချိန်: ${inlineCode(formatBurmeseDuration(timeoutSeconds))}`,
          ]
        : []),
      divider,
      ...(["wc", "smoke", "wcd", "eat"] as ActivityKind[])
        .filter((kind) => todayCounts[kind] > 0)
        .map((kind) =>
          `ယနေ့ ${activityLabel(kind, "mm")}: ${inlineCode(`${todayCounts[kind]} ကြိမ်`)}`,
        ),
    ].join("\n");
  },
  dailyCountLimitReached: (displayName, userId, activity, countLimit) => [
    "User: " + inlineCode(displayName),
    "User ID: " + inlineCode(userId),
    "⚠️ သတိပေးချက်: " + inlineCode(`ယနေ့ ${activity} အသုံးပြုမှုသည် ${countLimit} ကြိမ် ကန့်သတ်ချက်သို့ ရောက်ရှိပါပြီ။`),
    "အသုံးပြုနိုင်သည်:",
    "အိမ်သာ: " + inlineCode("/wc"),
    "ဆေးလိပ်: " + inlineCode("/smoke"),
    "WCD: " + inlineCode("/wcd"),
  ].join("\n"),
  timeoutReminder: (displayName, userId, activity) => {
    const identity = userIdentity(displayName, userId);
    return [
      `User: ${identity.name}`,
      `User ID: ${identity.id}`,
      `⚠️ သတိပေးချက်: သင့် ${inlineCode(activity)} activity သည် အချိန်ကျော်လွန်နေပါပြီ။ ထိုင်ခုံသို့ အမြန်ပြန်ပေးပါ။`,
      `ထိုင်ခုံသို့ပြန်ရန်: ${inlineCode("/back")}`,
    ].join("\n");
  },
  connectPrompt: [
    "ချိတ်ဆက်မည့် target group ID သို့မဟုတ် group link ကို ပို့ပါ။",
    `${inlineCode("/id")} ကိုအသုံးပြုပြီး group ID ကို ကြည့်နိုင်ပါတယ်။`,
    `ထို့နောက် ${inlineCode("/connect -1234567890")} ကဲ့သို့ ပို့ပြီး ပြန်ချိတ်ဆက်ပါ။`,
  ].join("\n"),
  connectUsage: "Group ထဲတွင် /connect ကိုသုံးပြီး target group ID သို့မဟုတ် public group link ကို ပို့ပါ။",
  connectAdminOnly: "ဤ group ၏ owner သို့မဟုတ် administrator သာ /connect ကိုအသုံးပြုနိုင်ပါသည်။",
  connectSuccess: (groupName, groupId) => [
    "✅ Group ချိတ်ဆက်မှု အောင်မြင်ပါသည်။",
    `Group: ${inlineCode(groupName)}`,
    `Group ID: ${inlineCode(groupId)}`,
  ].join("\n"),
  connectSelf: [
    `❌ ${inlineCode("ချိတ်ဆက်မှု မအောင်မြင်ပါ။")}`,
    "ထည့်သွင်းထားသော group ID သည် လက်ရှိ group ၏ ID ဖြစ်နေပါသည်။",
    `Current group သည် ${inlineCode("Target Group (timeout warning လက်ခံမည့် group)")} ဖြစ်ပါသည်။`,
    `Activity ပြုလုပ်သည့် group ၏ ID ကို ထည့်ပါ။ ဥပမာ ${inlineCode("/connect -1234567890")}`,
    `ထို့နောက် activity timeout ဖြစ်ပြီး ${inlineCode("/back")} အသုံးပြုသောအခါ warning message ကို ဤ current group သို့ ပို့ပေးပါမည်။`,
  ].join("\n"),
  connectInvalid: [
    "ဤ group ကို မသိရှိနိုင်ပါ သို့မဟုတ် ဝင်ရောက်အသုံးပြုနိုင်ခြင်းမရှိပါ။",
    `${inlineCode("/id")} ကိုအသုံးပြုပြီး မှန်ကန်သော group ID ကိုကြည့်ကာ ${inlineCode("/connect -1234567890")} ဖြင့် ပြန်ချိတ်ဆက်ပါ။`,
    "Bot သည် target group ထဲတွင် ရှိနေကြောင်း သေချာပါစေ။ Public group များအတွက် t.me link ကိုလည်း အသုံးပြုနိုင်ပါသည်။",
  ].join("\n"),
  groupTimeoutNotification: (groupName, groupId, username, displayName, userId, activity, timeoutSeconds, warningTime) => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return [
      `Group: ${inlineCode(groupName)}`,
      `Group ID: ${inlineCode(groupId)}`,
      `User: ${inlineCode(displayName)}`,
      `User ID: ${inlineCode(userId)}`,
      `Activity: ${inlineCode(activity.toUpperCase())}`,
      `အခြေအနေ: ${inlineCode("Activity တစ်ခု၏ အချိန်ကန့်သတ်ချက်ကို ကျော်လွန်သွားပါပြီ။")}`,
      `ကျော်လွန်ချိန်: ${inlineCode(`${pad(minutes)} မိနစ် ${pad(seconds)} စက္ကန့်`)}`,
      `သတိပေးချိန်: ${inlineCode(warningTime || "—")}`,
    ].join("\n");
  },
  workCheckIn: (displayName, userId, checkedAt) => [
    `User: ${userLink(displayName, userId)}`,
    `User ID: ${inlineCode(userId)}`,
    `အလုပ်စဝင် Check-In အချိန်: ${inlineCode(checkedAt)}`,
  ].join("\n"),
  shiftStarted: (time) => `✅ အလုပ်စဝင် Check-In အောင်မြင်ပါသည်: ${inlineCode(time)}`,
  shiftEnded: (time) => `✅ အလုပ်ဆင်း Check-In အောင်မြင်ပါသည်: ${inlineCode(time)}`,
  languageChanged: "ဘာသာစကားကို မြန်မာဘာသာသို့ ပြောင်းလဲပြီးပါပြီ။",
  languageUsage: "/lang ကိုသုံးပြီး ပေါ်လာသော button များထဲမှ ဘာသာစကားကို ရွေးချယ်ပါ။",
  languagePicker: "သင်အသုံးပြုလိုသော ဘာသာစကားကို ရွေးချယ်ပါ။",
  unknownLanguage: "ရရှိနိုင်သော ဘာသာစကားများ: mm (မြန်မာ), en (English), zh (简体中文)။",
  unknownCommand: "မသိသော command ဖြစ်ပါသည်။ /help ကိုအသုံးပြုပြီး အသေးစိတ်ကြည့်ပါ။",
  buttons: { wc: "အိမ်သာ", smoke: "ဆေးလိပ်", wcd: "WCD", back: "ထိုင်ခုံသို့ပြန်" },
  adminOnly: "ဤ command သည် Bot owner/admin များအတွက်သာ ဖြစ်ပါသည်။",
  limitPrivate: "ကျေးဇူးပြု၍ ဤ command ကို Bot private chat ထဲတွင် အသုံးပြုပါ။",
  limitUsage: "အသုံးပြုပုံ: /limit <eat|wc|smoke|wcd> <minutes> ဥပမာ /limit wc 10",
  unknownActivity: "ထောက်ပံ့ထားသော activity များ: eat, wc, smoke, wcd။",
  invalidLimit: "မိနစ်အရေအတွက်သည် 0 ထက်ကြီးသော ကိန်းပြည့်ဖြစ်ရပါမည်။",
  limits: (limits) => [
    "လက်ရှိ activity အချိန်ကန့်သတ်ချက်များ:",
    `အစားအသောက် / eat: ${inlineCode(`${limits.eat} မိနစ်`)}`,
    `အိမ်သာ / wc: ${inlineCode(`${limits.wc} မိနစ်`)}`,
    `ဆေးလိပ် / smoke: ${inlineCode(`${limits.smoke} မိနစ်`)}`,
    `WCD / wcd: ${inlineCode(`${limits.wcd} မိနစ်`)}`,
  ].join("\n"),
  limitUpdated: (activity, minutes) =>
    `✅ ${inlineCode(activity)} activity အချိန်ကန့်သတ်ချက်ကို ${inlineCode(`${minutes} မိနစ်`)} သို့ ပြောင်းပြီးပါပြီ။`,
  countLimitPrivate: "ကျေးဇူးပြု၍ ဤ command ကို Bot private chat ထဲတွင် အသုံးပြုပါ။",
  countLimitUsage: "အသုံးပြုပုံ: /countlimit <eat|wc|smoke|wcd> <count> ဥပမာ /countlimit wcd 2",
  invalidCountLimit: "အကြိမ်အရေအတွက်သည် 0 ထက်ကြီးသော ကိန်းပြည့်ဖြစ်ရပါမည်။",
  countLimits: (limits) => [
    "ယနေ့အသုံးပြုမှု အကြိမ်ရေကန့်သတ်ချက်များ:",
    `အစားအသောက် / eat: ${inlineCode(limits.eat ?? "မသတ်မှတ်ရသေး")}`,
    `အိမ်သာ / wc: ${inlineCode(limits.wc ?? "မသတ်မှတ်ရသေး")}`,
    `ဆေးလိပ် / smoke: ${inlineCode(limits.smoke ?? "မသတ်မှတ်ရသေး")}`,
    `WCD / wcd: ${inlineCode(limits.wcd ?? "မသတ်မှတ်ရသေး")}`,
  ].join("\n"),
  countLimitUpdated: (activity, count) =>
    `✅ ${inlineCode(activity)} အတွက် ယနေ့အသုံးပြုမှုအကြိမ်ရေ ကန့်သတ်ချက်ကို ${inlineCode(`${count} ကြိမ်`)} သို့ သတ်မှတ်ပြီးပါပြီ။`,
  reminderPrivate: "ကျေးဇူးပြု၍ ဤ command ကို Bot private chat ထဲတွင် အသုံးပြုပါ။",
  reminderUsage: "/reminder on သို့မဟုတ် /reminder off ကိုအသုံးပြုပါ။",
  reminderStatus: (enabled) =>
    `အချိန်ကျော်လွန်သတိပေးချက်: ${inlineCode(enabled ? "ဖွင့်ထားသည်" : "ပိတ်ထားသည်")} (45 စက္ကန့် grace period)`,
  reminderUpdated: (enabled) =>
    `✅ အချိန်ကျော်လွန်သတိပေးချက်ကို ${enabled ? "ဖွင့်" : "ပိတ်"}ပြီးပါပြီ (45 စက္ကန့် grace period)။`,
};
const en: LocaleText = {
  title: "Attendance Bot M58",
  startWelcome: [
    "Welcome to the Attendance Bot!",
    `Use ${inlineCode("/help")} to view all available commands and usage instructions.`,
  ].join("\n"),
  help: [
    "Available commands:",
    `${inlineCode("/work")} — Start work`,
    `${inlineCode("/back")} — Return to seat and settle activity`,
    `${inlineCode("/eat")} — Meal break`,
    `${inlineCode("/wc")} — Toilet`,
    `${inlineCode("/smoke")} — Smoke break`,
    `${inlineCode("/wcd")} — WCD`,
    `${inlineCode("/offwork")} — End work`,
    `${inlineCode("/lang")} — Choose language`,
    `${inlineCode("/id")} — View the current group ID or user ID (in private chat, shows your user ID)`,
    "",
    "",
    `Use ${inlineCode("/back")} when you return.`,
  ].join("\n"),
  idInfo: (chatId, userId) => `Chat ID: ${inlineCode(chatId)}\nUser ID: ${inlineCode(userId)}`,
  botStatsPrivate: "Please use /stats in a private chat.",
  telegramUi: {
    userMenuButton: "📊 My Dashboard",
    adminMenuButton: "⚙️ Admin Panel",
    addBotToGroupButton: "➕ Add Bot to Your Group",
    openGroupAdminPanelButton: "⚙️ Open Group Admin Panel",
    groupAdminPanelPrompt: "Open the Group Admin Panel:",
    addBotToGroupPrompt: "Add the bot to a group to use activity tracking with your team:",
    inputFieldPlaceholder: "Tap a button to check in",
  },
  commandMenu: {
    user: [
      { command: "start", description: "Start" },
      { command: "work", description: "Start work" },
      { command: "back", description: "Return to seat" },
      { command: "eat", description: "Meal break" },
      { command: "wc", description: "Toilet" },
      { command: "smoke", description: "Smoke break" },
      { command: "wcd", description: "WCD" },
      { command: "offwork", description: "End work" },
      { command: "help", description: "Help" },
      { command: "lang", description: "Language" },
    ],
    admin: [
      { command: "start", description: "Start" },
      { command: "limit", description: "Set activity time limits" },
      { command: "limits", description: "View activity time limits" },
      { command: "countlimit", description: "Set daily activity count limits" },
      { command: "countlimits", description: "View daily activity count limits" },
      { command: "reminder", description: "Turn overdue reminders on/off" },
      { command: "reminders", description: "View overdue reminder status" },
      { command: "stats", description: "View bot statistics" },
    ],
  },
  adminPanelPrompt: "Tap the button below to open the Admin Panel.",
  adminPrivate: "Please open the Admin Panel in the bot private chat.",
  adminMiniAppUnavailable: "The Admin Panel is currently unavailable. Please try again later.",
  botStats: (privateUsers, groups) => [
    "📊 Bot Statistics",
    "",
    `👤 Users (PM): ${inlineCode(privateUsers)}`,
    `👥 Groups: ${inlineCode(groups)}`,
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
  connectPrompt: [
    "Please send the target group ID or group link.",
    `If the group ID or link is incorrect, use ${inlineCode("/id")} to view the group ID.`,
    `Then send ${inlineCode("/connect -1234567890")} to connect again.`,
  ].join("\n"),
  connectUsage: "Use /connect in a group, then send the target group ID or public group link.",
  connectAdminOnly: "Only the group owner or an administrator of this group can use /connect.",
  connectSelf: [
    `❌ ${inlineCode("Connection failed")}`,
    `The group ID you entered is the ID of the current group.`,
    `The current group is the ${inlineCode("Target Group (receives timeout warnings)")}.`,
    `Please enter the ID of the group where activities are performed, for example: ${inlineCode("/connect -1234567890")}`,
    `Then, when an activity in that group exceeds its limit and the user uses ${inlineCode("/back")}, the warning will be sent to this current group.`,
  ].join("\n"),
  connectSuccess: (groupName, groupId) => [
    "✅ Connection successful",
    `Group: ${inlineCode(groupName)}`,
    `Group ID: ${inlineCode(groupId)}`,
  ].join("\n"),
  connectInvalid: [
    "I could not identify or access that group.",
    `Use ${inlineCode("/id")} to view the correct group ID, then send ${inlineCode("/connect -1234567890")} to connect again.`,
    "Make sure the bot is in the target group; public groups can also use a t.me link.",
  ].join("\n"),
  groupTimeoutNotification: (groupName, groupId, username, displayName, userId, activity, timeoutSeconds, warningTime) => {
    const minutes = Math.floor(timeoutSeconds / 60);
    const seconds = timeoutSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return [
      `Group: ${inlineCode("Open Group [" + groupName + "]")}`,
      `Group ID: ${inlineCode(groupId)}`,
      `User: ${inlineCode(displayName)}`,
      `User ID: ${inlineCode(userId)}`,
      `Activity: ${inlineCode(activity.toUpperCase())}`,
      `Status: ${inlineCode("Single activity exceeded time limit")}`,
      `Overtime: ${inlineCode(pad(minutes) + " min " + pad(seconds) + " sec")}`,
    ].join("\n");
  },
  workCheckIn: (displayName, userId, checkedAt) => [
    `User: ${userLink(displayName, userId)}`,
    `User ID: ${inlineCode(userId)}`,
    `Work Check-In Time: ${inlineCode(checkedAt)}`,
  ].join("\n"),
  shiftStarted: (time) => `✅ Work check-in succeeded: ${inlineCode(time)}`,
  shiftEnded: (time) => `✅ Work check-out succeeded: ${inlineCode(time)}`,
  languageChanged: "Language switched to English.",
  languageUsage: "Use /lang and select a language from the buttons.",
  languagePicker: "Choose the language you want to use.",
  unknownLanguage: "Supported languages: en (English), mm (Burmese), zh (Simplified Chinese).",
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

export const getLocale = (locale: Locale): LocaleText => {
  if (locale === "en") return en;
  if (locale === "mm") return mm;
  return zh;
};

export const activityLabel = (kind: ActivityKind, locale: Locale): string => {
  const labels = {
    zh: { eat: "吃饭", wc: "上厕所", smoke: "抽烟", wcd: "WCD" },
    en: { eat: "Meal", wc: "Toilet", smoke: "Smoke", wcd: "Big toilet" },
    mm: { eat: "အစားအသောက်", wc: "အိမ်သာ", smoke: "ဆေးလိပ်", wcd: "WCD" },
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
