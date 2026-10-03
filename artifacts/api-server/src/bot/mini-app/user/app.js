(function () {
  "use strict";

  var tg = window.Telegram && window.Telegram.WebApp;
  var els = {};
  var initData = tg && tg.initData ? tg.initData : "";
  var telegramUserId =
    tg && tg.initDataUnsafe && tg.initDataUnsafe.user
      ? Number(tg.initDataUnsafe.user.id)
      : 0;

  var state = {
    language: "en",
    verifiedUserId: null,
    selectedGroupId: null,
    dashboard: null,
    requestId: 0,
    settingsSaving: false,
    groupPickerOpen: false,
    aboutOpen: false,
    supportOpen: false,
    autoRefreshEnabled: false,
    autoRefreshTimer: null,
    refreshInProgress: false
  };

  var STORAGE_KEYS = {
    verifiedUser: "z28_verified_user_id",
    language: "z28_user_language",
    dashboard: "z28_user_dashboard_state",
    autoRefresh: "z28_user_auto_refresh"
  };

  var DEFAULTS = {
    duration: { eat: 30, wc: 7, smoke: 7, wcd: 15 },
    count: { eat: Infinity, wc: 7, smoke: 7, wcd: 2 }
  };

  var TEXT = {
    en: {
      title: "User Dashboard",
      dashboardEyebrow: "LIVE GROUP DASHBOARD",
      hello: "Hello",
      secureAccess: "SECURE ACCESS",
      verifyTitle: "Verify Your Telegram ID",
      verifySubtitle: "User Access",
      verifyLead: "Enter your Telegram user ID to open your group dashboard.",
      idLabel: "Telegram User ID",
      idPlaceholder: "Enter your Telegram ID",
      idHint: "Your ID must match the Telegram account currently opening this Mini App.",
      confirm: "Confirm",
      confirmed: "Confirmed",
      yourGroups: "YOUR GROUPS",
      groupOptions: "Group Options",
      groupOptionsSub: "Select a group to open its dashboard.",
      groupMembers: "Group members",
      memberActive: "Member active",
      groupConfiguration: "GROUP CONFIGURATION",
      settingsTitle: "Activity settings",
      settingsSub: "Manage limits for this group.",
      activityLimits: "Activity Limits",
      durationControl: "Duration Control",
      dailyCountLimits: "Daily Count Limits",
      dailyUsageControl: "Daily Usage Control",
      eat: "Eat",
      wc: "WC",
      smoke: "Smoke",
      wcd: "WCD",
      minutes: "minutes",
      uses: "uses",
      unlimited: "unlimited",
      edit: "Edit",
      cancel: "Cancel",
      save: "Save",
      saveLimits: "Save Limits",
      saveCountLimits: "Save Count Limits",
      saving: "Saving",
      saved: "Saved",
      unsavedChanges: "Unsaved changes",
      changesToSave: "Changes to save",
      invalidSettingValue: "Enter a positive whole number.",
      saveFailed: "Nothing was saved. Your changes are still here; please try again.",
      savePartialFailure: "Some changes were saved, but one or more settings could not be saved. Review the remaining values and try again.",
      switch: "Switch",
      refresh: "Refresh",
      refreshing: "Refreshing",
      refreshSuccess: "Dashboard updated successfully.",
      autoRefreshOn: "Auto • 30s",
      autoRefreshOff: "Auto • Off",
      autoRefreshOnHint: "Automatically refreshes the dashboard every 30 seconds.",
      autoRefreshOffHint: "Automatic dashboard refresh is turned off.",
      autoRefreshEnabled: "Auto refresh enabled. Updates every 30 seconds.",
      autoRefreshDisabled: "Auto refresh disabled.",
      dashboard: "Dashboard",
      about: "About",
      aboutSub: "App information and credits",
      bot: "Bot",
      botVersion: "Bot Version",
      miniAppVersion: "Mini App Version",
      terms: "Terms of Use",
      termsCopy: "Use this Mini App only for the attendance and group-management functions provided by the bot. Keep your Telegram account secure and use the service according to your group rules.",
      privacy: "Privacy",
      privacyCopy: "The Mini App uses Telegram WebApp account information to verify access and show the groups available to you. Information shown in this dashboard is used only for the bot features provided to your account and groups.",
      credits: "Credits",
      creator: "Creator",
      noGroup: "No eligible group found",
      noGroupCopy: "Add this bot to a group, then make sure your Telegram account is a group owner or administrator. Groups where the bot is no longer available are not shown.",
      dashboardError: "Unable to load your dashboard right now.",
      dashboardErrorCopy: "Something went wrong while loading your dashboard. Your saved settings were not changed.",
      tryAgain: "Try Again",
      loadingTitle: "Loading your dashboard",
      loadingSub: "Checking groups and current activity…",
      startup: "Checking your Telegram account…",
      openTelegram: "Open this page inside Telegram.",
      identifyError: "Unable to identify your Telegram account.",
      invalidResponse: "Dashboard API returned an invalid response.",
      apiPrefix: "Dashboard API failed",
      renderPrefix: "Dashboard render failed",
      mismatch: "The entered ID does not match your Telegram account.",
      selected: "Selected",
      helpSupport: "Help & Support",
      helpSupportSub: "Get help or report a problem",
      reportProblem: "Report a Problem",
      reportProblemLead: "Tell us what went wrong. Your report will be sent to the bot administrators.",
      reportCategory: "Category",
      reportCategoryBug: "Bug / Unexpected behavior",
      reportCategoryAccess: "Access / Verification",
      reportCategoryGroup: "Group / Permissions",
      reportCategorySettings: "Settings",
      reportCategoryOther: "Other",
      reportMessage: "Describe the problem",
      reportPlaceholder: "Please describe what happened…",
      reportHint: "Please do not include passwords or other sensitive information.",
      reportCount: "0 / 1200",
      reportContext: "Selected group",
      reportSend: "Send Report",
      reportSending: "Sending",
      reportSent: "Report sent successfully. Thank you.",
      reportMinLength: "Please enter at least 10 characters.",
      reportFailed: "Unable to send the report. Please try again."
    },
    my: {
      title: "User Dashboard",
      dashboardEyebrow: "LIVE GROUP DASHBOARD",
      hello: "မင်္ဂလာပါ",
      secureAccess: "လုံခြုံစွာ ဝင်ရောက်ရန်",
      verifyTitle: "Telegram ID အတည်ပြုရန်",
      verifySubtitle: "User Access",
      verifyLead: "Group Dashboard ကိုဖွင့်ရန် Telegram User ID ကိုထည့်ပါ။",
      idLabel: "Telegram User ID",
      idPlaceholder: "Telegram ID ထည့်ပါ",
      idHint: "ထည့်ထားသော ID သည် ယခု Mini App ဖွင့်ထားသော Telegram account နှင့် ကိုက်ညီရမည်။",
      confirm: "အတည်ပြုမည်",
      confirmed: "အတည်ပြုပြီး",
      yourGroups: "သင့် Group များ",
      groupOptions: "Group ရွေးရန်",
      groupOptionsSub: "Dashboard ဖွင့်ရန် Group တစ်ခုကိုရွေးပါ။",
      groupMembers: "Group member များ",
      memberActive: "လက်ရှိ Active member",
      groupConfiguration: "GROUP CONFIGURATION",
      settingsTitle: "Activity settings",
      settingsSub: "ဤ Group အတွက် limit များကို စီမံပါ။",
      activityLimits: "Activity Limits",
      durationControl: "ကြာချိန် ထိန်းချုပ်မှု",
      dailyCountLimits: "Daily Count Limits",
      dailyUsageControl: "နေ့စဉ် အသုံးပြုမှု ထိန်းချုပ်မှု",
      eat: "ထမင်းစား",
      wc: "အိမ်သာ",
      smoke: "ဆေးလိပ်",
      wcd: "WCD",
      minutes: "မိနစ်",
      uses: "ကြိမ်",
      unlimited: "အကန့်အသတ်မရှိ",
      edit: "ပြင်မည်",
      cancel: "မလုပ်တော့ပါ",
      save: "သိမ်းမည်",
      saveLimits: "Limits သိမ်းမည်",
      saveCountLimits: "Count Limits သိမ်းမည်",
      saving: "သိမ်းနေသည်",
      saved: "သိမ်းပြီးပါပြီ",
      unsavedChanges: "မသိမ်းရသေးသော ပြင်ဆင်ချက်များ",
      changesToSave: "သိမ်းဆည်းမည့် ပြင်ဆင်ချက်များ",
      invalidSettingValue: "အပေါင်းကိန်းပြည့်တစ်ခု ထည့်ပါ။",
      saveFailed: "ဘာ setting မှ မသိမ်းရသေးပါ။ ပြင်ဆင်ချက်များကို ထိန်းသိမ်းထားပြီး ထပ်ကြိုးစားပါ။",
      savePartialFailure: "ပြင်ဆင်ချက်အချို့ သိမ်းပြီးဖြစ်သော်လည်း setting တစ်ခု သို့မဟုတ် တစ်ခုထက်ပို၍ မသိမ်းနိုင်ပါ။ ကျန်တန်ဖိုးများကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
      switch: "ပြောင်းမည်",
      refresh: "Refresh",
      refreshing: "Refresh လုပ်နေသည်",
      refreshSuccess: "Dashboard ကို နောက်ဆုံးအချက်အလက်များဖြင့် update လုပ်ပြီးပါပြီ။",
      autoRefreshOn: "Auto • 30s",
      autoRefreshOff: "Auto • ပိတ်ထားသည်",
      autoRefreshOnHint: "Dashboard ကို 30 စက္ကန့်တစ်ကြိမ် အလိုအလျောက် update လုပ်မည်။",
      autoRefreshOffHint: "Dashboard အလိုအလျောက် update ကို ပိတ်ထားသည်။",
      autoRefreshEnabled: "Auto Refresh ဖွင့်ပြီးပါပြီ။ 30 စက္ကန့်တစ်ကြိမ် update လုပ်မည်။",
      autoRefreshDisabled: "Auto Refresh ပိတ်ပြီးပါပြီ။",
      dashboard: "Dashboard",
      about: "About",
      aboutSub: "App အချက်အလက်နှင့် Credits",
      bot: "Bot",
      botVersion: "Bot Version",
      miniAppVersion: "Mini App Version",
      terms: "အသုံးပြုမှု စည်းမျဉ်း",
      termsCopy: "ဤ Mini App ကို Bot မှပေးထားသော attendance နှင့် group-management လုပ်ဆောင်ချက်များအတွက်သာ အသုံးပြုပါ။ Telegram account ကို လုံခြုံစွာ ထိန်းသိမ်းပြီး Group စည်းမျဉ်းများအတိုင်း အသုံးပြုပါ။",
      privacy: "Privacy",
      privacyCopy: "Mini App သည် access အတည်ပြုရန်နှင့် သင့်အတွက် အသုံးပြုနိုင်သော Group များကို ပြသရန် Telegram WebApp account information ကို အသုံးပြုပါသည်။",
      credits: "Credits",
      creator: "ဖန်တီးသူ",
      noGroup: "အသုံးပြုနိုင်သော Group မတွေ့ပါ",
      noGroupCopy: "Bot ကို Group တစ်ခုထဲသို့ ထည့်ပြီး သင့် Telegram account ကို Group owner သို့မဟုတ် administrator ဖြစ်ကြောင်း သေချာပါစေ။ Bot မရှိတော့သော Group များကို မပြပါ။",
      dashboardError: "Dashboard ကို ယခုဖွင့်၍ မရသေးပါ။",
      dashboardErrorCopy: "Dashboard ကိုဖွင့်နေစဉ် ပြဿနာတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။ သိမ်းထားပြီးသော setting များကို မပြောင်းလဲထားပါ။",
      tryAgain: "ထပ်ကြိုးစားမည်",
      loadingTitle: "Dashboard ဖွင့်နေသည်",
      loadingSub: "Group နှင့် လက်ရှိ activity များကို စစ်ဆေးနေသည်…",
      startup: "Telegram account ကို စစ်ဆေးနေသည်…",
      openTelegram: "ဤစာမျက်နှာကို Telegram အတွင်းမှ ဖွင့်ပါ။",
      identifyError: "Telegram account ကို မသိရှိနိုင်ပါ။",
      invalidResponse: "Dashboard API မှ မမှန်ကန်သော response ရရှိပါသည်။",
      apiPrefix: "Dashboard API မအောင်မြင်ပါ",
      renderPrefix: "Dashboard render မအောင်မြင်ပါ",
      mismatch: "ထည့်ထားသော ID သည် သင့် Telegram account နှင့် မကိုက်ညီပါ။",
      selected: "ရွေးထားသည်",
      helpSupport: "Help & Support",
      helpSupportSub: "အကူအညီရယူရန် သို့မဟုတ် ပြဿနာတင်ပြရန်",
      reportProblem: "ပြဿနာတင်ပြရန်",
      reportProblemLead: "ဖြစ်ပေါ်နေသော ပြဿနာကို ရေးပေးပါ။ သင့်တင်ပြချက်ကို Bot administrator များထံ ပို့ပေးပါမည်။",
      reportCategory: "အမျိုးအစား",
      reportCategoryBug: "Bug / မမျှော်လင့်ထားသော လုပ်ဆောင်ချက်",
      reportCategoryAccess: "Access / အတည်ပြုခြင်း",
      reportCategoryGroup: "Group / Permission",
      reportCategorySettings: "Settings",
      reportCategoryOther: "အခြား",
      reportMessage: "ပြဿနာကို ရှင်းပြပါ",
      reportPlaceholder: "ဘာဖြစ်ခဲ့သည်ကို အသေးစိတ်ရေးပေးပါ…",
      reportHint: "Password သို့မဟုတ် အခြား sensitive information များကို မထည့်ပါနှင့်။",
      reportCount: "0 / 1200",
      reportContext: "ရွေးထားသော Group",
      reportSend: "Report ပို့မည်",
      reportSending: "ပို့နေသည်",
      reportSent: "Report ကို အောင်မြင်စွာ ပို့ပြီးပါပြီ။ ကျေးဇူးတင်ပါသည်။",
      reportMinLength: "အနည်းဆုံး စာလုံး ၁၀ လုံး ရေးပေးပါ။",
      reportFailed: "Report ပို့၍ မရပါ။ ထပ်မံကြိုးစားပါ။"
    },
    zh: {
      title: "用户仪表板",
      dashboardEyebrow: "实时群组仪表板",
      hello: "你好",
      secureAccess: "安全访问",
      verifyTitle: "验证您的 Telegram ID",
      verifySubtitle: "用户访问",
      verifyLead: "输入您的 Telegram 用户 ID 以打开群组仪表板。",
      idLabel: "Telegram 用户 ID",
      idPlaceholder: "请输入 Telegram ID",
      idHint: "输入的 ID 必须与当前打开此 Mini App 的 Telegram 账号一致。",
      confirm: "确认",
      confirmed: "已确认",
      yourGroups: "您的群组",
      groupOptions: "群组选择",
      groupOptionsSub: "选择一个群组以打开其仪表板。",
      groupMembers: "群组成员",
      memberActive: "活跃成员",
      groupConfiguration: "群组配置",
      settingsTitle: "活动设置",
      settingsSub: "管理此群组的限制。",
      activityLimits: "活动时间限制",
      durationControl: "时长控制",
      dailyCountLimits: "每日次数限制",
      dailyUsageControl: "每日使用控制",
      eat: "吃饭",
      wc: "上厕所",
      smoke: "抽烟",
      wcd: "大号",
      minutes: "分钟",
      uses: "次",
      unlimited: "无限制",
      edit: "编辑",
      cancel: "取消",
      save: "保存",
      saveLimits: "保存限制",
      saveCountLimits: "保存次数限制",
      saving: "保存中",
      saved: "已保存",
      unsavedChanges: "未保存的更改",
      changesToSave: "待保存的更改",
      invalidSettingValue: "请输入正整数。",
      saveFailed: "没有任何设置被保存。您的更改仍然保留，请重试。",
      savePartialFailure: "部分更改已保存，但一个或多个设置无法保存。请检查剩余数值后重试。",
      switch: "切换",
      refresh: "刷新",
      refreshing: "刷新中",
      refreshSuccess: "仪表板已更新为最新数据。",
      autoRefreshOn: "自动 • 30秒",
      autoRefreshOff: "自动 • 关闭",
      autoRefreshOnHint: "每30秒自动更新仪表板。",
      autoRefreshOffHint: "自动更新仪表板已关闭。",
      autoRefreshEnabled: "自动刷新已开启，每30秒更新一次。",
      autoRefreshDisabled: "自动刷新已关闭。",
      dashboard: "仪表板",
      about: "关于",
      aboutSub: "应用信息与创作者",
      bot: "机器人",
      botVersion: "机器人版本",
      miniAppVersion: "Mini App 版本",
      terms: "使用条款",
      termsCopy: "此 Mini App 仅用于机器人提供的考勤和群组管理功能。请妥善保护您的 Telegram 账号，并遵守所在群组的使用规则。",
      privacy: "隐私",
      privacyCopy: "Mini App 使用 Telegram WebApp 账号信息验证访问权限，并显示您可以使用的群组。Dashboard 中的信息仅用于机器人为您的账号和群组提供的功能。",
      credits: "鸣谢",
      creator: "创作者",
      noGroup: "没有找到可用的群组",
      noGroupCopy: "请将 Bot 添加到群组，并确保您的 Telegram 账号是群主或管理员。Bot 已不在的群组不会显示。",
      dashboardError: "暂时无法加载您的控制面板。",
      dashboardErrorCopy: "加载控制面板时出现问题。您已保存的设置没有被更改。",
      tryAgain: "再试一次",
      loadingTitle: "正在加载控制面板",
      loadingSub: "正在检查群组和当前活动…",
      startup: "正在检查您的 Telegram 账号…",
      openTelegram: "请在 Telegram 内打开此页面。",
      identifyError: "无法识别您的 Telegram 账号。",
      invalidResponse: "Dashboard API 返回了无效响应。",
      apiPrefix: "Dashboard API 加载失败",
      renderPrefix: "Dashboard 渲染失败",
      mismatch: "输入的 ID 与您的 Telegram 账号不匹配。",
      selected: "已选择",
      helpSupport: "帮助与支持",
      helpSupportSub: "获取帮助或报告问题",
      reportProblem: "报告问题",
      reportProblemLead: "请描述发生的问题。您的报告将发送给机器人管理员。",
      reportCategory: "问题类型",
      reportCategoryBug: "Bug / 异常行为",
      reportCategoryAccess: "访问 / 验证",
      reportCategoryGroup: "群组 / 权限",
      reportCategorySettings: "设置",
      reportCategoryOther: "其他",
      reportMessage: "描述问题",
      reportPlaceholder: "请描述发生了什么…",
      reportHint: "请不要填写密码或其他敏感信息。",
      reportCount: "0 / 1200",
      reportContext: "当前群组",
      reportSend: "发送报告",
      reportSending: "发送中",
      reportSent: "报告已成功发送，谢谢。",
      reportMinLength: "请至少输入 10 个字符。",
      reportFailed: "报告发送失败，请重试。"
    }
  };

  function cacheElements() {
    [
      "app","splash","splash-title","user-loading","loading-title","loading-subtitle",
      "title","identity","notice","user-language-button","user-language-menu",
      "user-verify-card","user-verify-title","user-verify-subtitle","user-verify-lead",
      "user-id-label","user-id-input","user-id-hint","user-confirm",
      "user-no-group-screen","user-no-group-title","user-no-group-message",
      "user-dashboard-error-screen","user-dashboard-error-title","user-dashboard-error-lead",
      "user-dashboard-error-retry","user-dashboard","user-group-options",
      "group-options-title","group-options-subtitle","user-group-options-list",
      "user-selected-dashboard","selected-group-eyebrow","user-selected-group-title",
      "user-dashboard-sub","refresh","auto-refresh-toggle","auto-refresh-label",
      "switch-group","switch-group-label",
      "user-member-count","user-active-count","user-group-member-label",
      "user-member-active-label","settings-title","settings-subtitle",
      "user-settings-limits-card","user-settings-counts-card",
      "user-about-page","user-about-title","user-about-sub","user-about-bot-name-label",
      "user-about-bot-version-label","user-about-mini-version-label",
      "user-about-terms-label","user-about-terms-copy","user-about-privacy-label",
      "user-about-privacy-copy","user-about-credits-label","user-about-creator-label",
      "user-support-page","user-support-title","user-support-sub","user-report-title",
      "user-report-lead","user-report-category-label","user-report-category",
      "user-report-category-bug","user-report-category-access","user-report-category-group",
      "user-report-category-settings","user-report-category-other","user-report-message-label","user-report-message",
      "user-report-hint","user-report-count","user-report-context-label","user-report-context-value",
      "user-report-submit","user-tabbar","user-dashboard-tab-label","user-about-tab-label",
      "user-support-tab-label","user-report-form"
    ].forEach(function (id) { els[id] = document.getElementById(id); });
  }

  function text(key) {
    return (TEXT[state.language] && TEXT[state.language][key]) || TEXT.en[key] || key;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function displayName() {
    var user = tg && tg.initDataUnsafe && tg.initDataUnsafe.user
      ? tg.initDataUnsafe.user
      : null;
    if (!user) return "there";
    var parts = [user.first_name, user.last_name].filter(function (part) {
      return typeof part === "string" && part.trim();
    });
    if (parts.length) return parts.join(" ");
    return user.username ? "@" + user.username : "there";
  }

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function removeStorage(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  function readDashboardState() {
    var raw = readStorage(STORAGE_KEYS.dashboard);
    if (!raw) return { groupId: null, tab: "dashboard" };
    try {
      var parsed = JSON.parse(raw);
      var groupId = Number(parsed && parsed.groupId);
      return {
        groupId: Number.isSafeInteger(groupId) && groupId < 0 ? groupId : null,
        tab: parsed && parsed.tab === "about" ? "about" : "dashboard"
      };
    } catch (_) {
      return { groupId: null, tab: "dashboard" };
    }
  }

  function saveDashboardState(patch) {
    var current = readDashboardState();
    var next = {
      groupId: patch && patch.groupId !== undefined ? patch.groupId : current.groupId,
      tab: patch && patch.tab ? patch.tab : current.tab
    };
    if (next.groupId !== null && (!Number.isSafeInteger(Number(next.groupId)) || Number(next.groupId) >= 0)) {
      next.groupId = null;
    }
    writeStorage(STORAGE_KEYS.dashboard, JSON.stringify(next));
  }

  function getVerifiedUserId() {
    var value = readStorage(STORAGE_KEYS.verifiedUser);
    return value && /^\d+$/.test(value) ? value : null;
  }

  function setVerifiedUserId(value) {
    state.verifiedUserId = String(value);
    writeStorage(STORAGE_KEYS.verifiedUser, String(value));
  }

  function showNotice(message, kind) {
    if (!els.notice) return;
    els.notice.textContent = message;
    els.notice.className = "notice show " + (kind || "error");
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(function () {
      els.notice.className = "notice";
    }, 3200);
  }

  function setLoading(show, title) {
    if (!els["user-loading"]) return;
    els["user-loading"].hidden = !show;
    if (show) {
      els["loading-title"].textContent = title || text("loadingTitle");
      els["loading-subtitle"].textContent = text("loadingSub");
    }
  }

  function setButton(button, mode, label) {
    if (!button) return;
    var content = button.querySelector(".button-label");
    if (mode === "loading") {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.classList.add("is-loading");
      if (content) {
        content.innerHTML = '<span class="button-spinner" aria-hidden="true"></span>' + escapeHtml(label || text("saving"));
      }
      return;
    }
    button.disabled = false;
    button.setAttribute("aria-busy", "false");
    button.classList.remove("is-loading");
    if (content) content.textContent = label || text("save");
  }

  function updateAutoRefreshControl() {
    var button = els["auto-refresh-toggle"];
    var label = els["auto-refresh-label"];
    if (!button || !label) return;
    var enabled = state.autoRefreshEnabled;
    var hint = enabled ? text("autoRefreshOnHint") : text("autoRefreshOffHint");
    button.classList.toggle("is-enabled", enabled);
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", hint);
    button.setAttribute("title", hint);
    label.textContent = enabled ? text("autoRefreshOn") : text("autoRefreshOff");
  }

  function hasOpenSettingsEditor() {
    var editors = document.querySelectorAll(".setting-editor");
    for (var index = 0; index < editors.length; index += 1) {
      if (!editors[index].hidden) return true;
    }
    return false;
  }

  function stopAutoRefresh() {
    if (state.autoRefreshTimer !== null) {
      window.clearTimeout(state.autoRefreshTimer);
      state.autoRefreshTimer = null;
    }
  }

  function canAutoRefresh() {
    return (
      state.autoRefreshEnabled &&
      !state.aboutOpen &&
      !state.groupPickerOpen &&
      !state.settingsSaving &&
      !state.refreshInProgress &&
      !hasOpenSettingsEditor() &&
      !document.hidden &&
      Boolean(state.dashboard && state.dashboard.selectedGroup) &&
      Boolean(els["user-selected-dashboard"] && !els["user-selected-dashboard"].hidden)
    );
  }

  function scheduleAutoRefresh() {
    stopAutoRefresh();
    if (!canAutoRefresh()) return;
    state.autoRefreshTimer = window.setTimeout(function () {
      state.autoRefreshTimer = null;
      runAutoRefresh();
    }, 30000);
  }

  async function runAutoRefresh() {
    if (!state.autoRefreshEnabled) return;
    if (!canAutoRefresh()) {
      scheduleAutoRefresh();
      return;
    }

    state.refreshInProgress = true;
    els.refresh.classList.add("is-auto-syncing");
    els["auto-refresh-toggle"].classList.add("is-syncing");
    try {
      await loadUserDashboard(false, state.selectedGroupId, true);
    } catch (_) {
      // Background refresh failures must not replace a working dashboard.
    } finally {
      state.refreshInProgress = false;
      els.refresh.classList.remove("is-auto-syncing");
      els["auto-refresh-toggle"].classList.remove("is-syncing");
      scheduleAutoRefresh();
    }
  }

  function hideAllPrimaryScreens() {
    els["user-verify-card"].hidden = true;
    els["user-no-group-screen"].hidden = true;
    els["user-dashboard-error-screen"].hidden = true;
    els["user-dashboard"].hidden = true;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
  }

  function applyLanguage() {
    document.documentElement.lang = state.language === "my" ? "my" : state.language;
    els.title.textContent = text("title");
    els.identity.textContent = state.verifiedUserId ? "ID " + state.verifiedUserId : text("startup");

    els["user-verify-title"].textContent = text("verifyTitle");
    els["user-verify-subtitle"].textContent = text("verifySubtitle");
    els["user-verify-lead"].textContent = text("verifyLead");
    els["user-id-label"].textContent = text("idLabel");
    els["user-id-input"].placeholder = text("idPlaceholder");
    els["user-id-hint"].textContent = text("idHint");
    if (!els["user-confirm"].classList.contains("confirmed")) {
      var confirmLabel = els["user-confirm"].querySelector(".button-label");
      if (confirmLabel) confirmLabel.textContent = text("confirm");
    }

    els["group-options-title"].textContent = text("groupOptions");
    els["group-options-subtitle"].textContent = text("groupOptionsSub");
    els["user-group-member-label"].textContent = text("groupMembers");
    els["user-member-active-label"].textContent = text("memberActive");
    els["selected-group-eyebrow"].textContent = text("dashboardEyebrow");
    els["settings-title"].textContent = text("settingsTitle");
    els["settings-subtitle"].textContent = text("settingsSub");
    els["switch-group-label"].textContent = text("switch");
    els["user-dashboard-tab-label"].textContent = text("dashboard");
    els["user-about-tab-label"].textContent = text("about");
    els["user-support-tab-label"].textContent = text("helpSupport");
    els["user-about-title"].textContent = text("about");
    els["user-about-sub"].textContent = text("aboutSub");
    els["user-about-bot-name-label"].textContent = text("bot");
    els["user-about-bot-version-label"].textContent = text("botVersion");
    els["user-about-mini-version-label"].textContent = text("miniAppVersion");
    els["user-about-terms-label"].textContent = text("terms");
    els["user-about-terms-copy"].textContent = text("termsCopy");
    els["user-about-privacy-label"].textContent = text("privacy");
    els["user-about-privacy-copy"].textContent = text("privacyCopy");
    els["user-about-credits-label"].textContent = text("credits");
    els["user-about-creator-label"].textContent = text("creator");
    els["user-support-title"].textContent = text("helpSupport");
    els["user-support-sub"].textContent = text("helpSupportSub");
    els["user-report-title"].textContent = text("reportProblem");
    els["user-report-lead"].textContent = text("reportProblemLead");
    els["user-report-category-label"].textContent = text("reportCategory");
    els["user-report-category-bug"].textContent = text("reportCategoryBug");
    els["user-report-category-access"].textContent = text("reportCategoryAccess");
    els["user-report-category-group"].textContent = text("reportCategoryGroup");
    els["user-report-category-settings"].textContent = text("reportCategorySettings");
    els["user-report-category-other"].textContent = text("reportCategoryOther");
    els["user-report-message-label"].textContent = text("reportMessage");
    els["user-report-message"].placeholder = text("reportPlaceholder");
    els["user-report-hint"].textContent = text("reportHint");
    els["user-report-context-label"].textContent = text("reportContext");
    if (!els["user-report-submit"].classList.contains("is-loading")) {
      var reportLabel = els["user-report-submit"].querySelector(".button-label");
      if (reportLabel) reportLabel.textContent = text("reportSend");
    }
    updateReportCharacterCount();

    els["user-no-group-title"].textContent = text("noGroup");
    els["user-no-group-message"].textContent = text("noGroupCopy");
    els["user-dashboard-error-title"].textContent = text("dashboardError");
    if (!els["user-dashboard-error-retry"].disabled) {
      var retryLabel = els["user-dashboard-error-retry"].querySelector(".button-label");
      if (retryLabel) retryLabel.textContent = text("tryAgain");
    }

    document.querySelectorAll(".language-option").forEach(function (option) {
      option.classList.toggle("active", option.getAttribute("data-user-lang") === state.language);
    });

    updateAutoRefreshControl();

    if (state.dashboard && state.dashboard.selectedGroup) {
      if (state.supportOpen) updateReportContext();
      else renderSelectedDashboard(state.dashboard, true);
    }
  }

  function openLanguageMenu() {
    var open = els["user-language-menu"].hidden;
    els["user-language-menu"].hidden = !open;
    els["user-language-button"].setAttribute("aria-expanded", String(open));
  }

  function closeLanguageMenu() {
    els["user-language-menu"].hidden = true;
    els["user-language-button"].setAttribute("aria-expanded", "false");
  }

  function showVerification() {
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    state.dashboard = null;
    state.selectedGroupId = null;
    hideAllPrimaryScreens();
    els["user-verify-card"].hidden = false;
    els["user-id-input"].value = "";
    els["user-confirm"].disabled = true;
    els["user-confirm"].classList.remove("confirmed");
    var confirmLabel = els["user-confirm"].querySelector(".button-label");
    if (confirmLabel) confirmLabel.textContent = text("confirm");
    els.title.textContent = text("verifySubtitle");
    els.identity.textContent = text("startup");
    els["user-tabbar"].hidden = true;
    setDashboardControls(false);
    updateBackButton();
  }

  function showNoGroup() {
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    hideAllPrimaryScreens();
    els["user-no-group-screen"].hidden = false;
    els.title.textContent = text("noGroup");
    els.identity.textContent = state.verifiedUserId ? "ID " + state.verifiedUserId : text("startup");
    els["user-tabbar"].hidden = true;
    setDashboardControls(false);
    updateBackButton();

    window.clearTimeout(showNoGroup.timer);
    showNoGroup.timer = window.setTimeout(function () {
      if (els["user-no-group-screen"].hidden) return;
      state.verifiedUserId = null;
      state.selectedGroupId = null;
      removeStorage(STORAGE_KEYS.verifiedUser);
      showVerification();
    }, 2850);
  }

  function showDashboardError(error, groupId) {
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    hideAllPrimaryScreens();
    els["user-dashboard-error-screen"].hidden = false;
    els.title.textContent = text("dashboardError");
    els.identity.textContent = state.verifiedUserId ? "ID " + state.verifiedUserId : text("startup");
    els["user-dashboard-error-lead"].textContent =
      error && error.message ? error.message : text("dashboardErrorCopy");
    var retryLabel = els["user-dashboard-error-retry"].querySelector(".button-label");
    if (retryLabel) retryLabel.textContent = text("tryAgain");
    els["user-dashboard-error-retry"].disabled = false;
    state.errorGroupId = groupId === undefined ? state.selectedGroupId : groupId;
    els["user-tabbar"].hidden = true;
    setDashboardControls(false);
    updateBackButton();
  }

  function setDashboardControls(visible) {
    els.refresh.hidden = !visible;
    els["auto-refresh-toggle"].hidden = !visible;
    els["switch-group"].hidden = !visible;
    if (!visible) {
      stopAutoRefresh();
    } else {
      updateAutoRefreshControl();
      scheduleAutoRefresh();
    }
  }

  function userGreeting() {
    return text("hello") + ", " + displayName();
  }

  function updateReportContext() {
    if (!els["user-report-context-value"]) return;
    var group = state.dashboard && state.dashboard.selectedGroup;
    els["user-report-context-value"].textContent =
      group && group.title ? group.title : text("reportContext");
  }

  function updateReportCharacterCount() {
    if (!els["user-report-message"] || !els["user-report-count"]) return;
    var length = els["user-report-message"].value.length;
    els["user-report-count"].textContent = length + " / 1200";
    els["user-report-count"].classList.toggle("is-near-limit", length >= 1050);
  }

  async function submitProblemReport(event) {
    event.preventDefault();
    if (!state.dashboard || !state.dashboard.selectedGroup || !els["user-report-submit"] || els["user-report-submit"].disabled) return;

    var message = els["user-report-message"].value.trim();
    if (message.length < 10) {
      showNotice(text("reportMinLength"), "error");
      els["user-report-message"].focus();
      return;
    }

    var category = els["user-report-category"].value;
    setButton(els["user-report-submit"], "loading", text("reportSending") + "…");
    try {
      await apiUserReport(category, message, state.selectedGroupId);
      els["user-report-message"].value = "";
      updateReportCharacterCount();
      showNotice(text("reportSent"), "ok");
    } catch (error) {
      showNotice(error && error.message ? error.message : text("reportFailed"), "error");
    } finally {
      setButton(els["user-report-submit"], "idle", text("reportSend"));
    }
  }

  function formatSettingValue(type, value) {
    var numeric = Number(value);
    if (type === "count" && !Number.isFinite(numeric)) return text("unlimited");
    return String(Number.isFinite(numeric) ? numeric : 0) + (type === "duration" ? " " + text("minutes") : " " + text("uses"));
  }

  function settingRows(type, values) {
    if (type === "count") {
      return [
        ["wc", text("wc"), Number.isFinite(Number(values.wc)) ? Number(values.wc) : DEFAULTS.count.wc],
        ["smoke", text("smoke"), Number.isFinite(Number(values.smoke)) ? Number(values.smoke) : DEFAULTS.count.smoke],
        ["wcd", text("wcd"), Number.isFinite(Number(values.wcd)) ? Number(values.wcd) : DEFAULTS.count.wcd]
      ];
    }
    return [
      ["eat", text("eat"), Number.isFinite(Number(values.eat)) ? Number(values.eat) : DEFAULTS.duration.eat],
      ["wc", text("wc"), Number.isFinite(Number(values.wc)) ? Number(values.wc) : DEFAULTS.duration.wc],
      ["smoke", text("smoke"), Number.isFinite(Number(values.smoke)) ? Number(values.smoke) : DEFAULTS.duration.smoke],
      ["wcd", text("wcd"), Number.isFinite(Number(values.wcd)) ? Number(values.wcd) : DEFAULTS.duration.wcd]
    ];
  }

  function settingIcon(type) {
    if (type === "count") {
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"></path><path d="M6 17V9"></path><path d="M11 17V6"></path><path d="M16 17V3"></path><path d="M20 17V11"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5"></circle><path d="M12 5.5V4"></path><path d="M9 3h6"></path><path d="M12 13l3-2"></path></svg>';
  }

  function renderSettingCard(type, values, groupId) {
    var rows = settingRows(type, values || {});
    var title = type === "count" ? text("dailyCountLimits") : text("activityLimits");
    var subtitle = type === "count" ? text("dailyUsageControl") : text("durationControl");

    var preview = rows.map(function (row) {
      return '<div class="setting-value"><span class="setting-value-label">' +
        escapeHtml(row[1]) + '</span><strong class="setting-value-number">' +
        escapeHtml(formatSettingValue(type, row[2])) + '</strong></div>';
    }).join("");

    var editors = rows.map(function (row) {
      return '<div class="editor-row">' +
        '<div><span class="editor-label">' + escapeHtml(row[1]) + '</span><span class="editor-hint">' +
        (type === "duration" ? escapeHtml(text("minutes")) : escapeHtml(text("uses"))) +
        '</span></div>' +
        '<input class="editor-input" data-kind="' + row[0] + '" type="number" min="1" step="1" inputmode="numeric" value="' +
        escapeHtml(String(row[2])) + '" data-original-value="' + escapeHtml(String(row[2])) + '">' +
        '</div>';
    }).join("");

    return '<div class="setting-head"><span class="setting-icon">' + settingIcon(type) +
      '</span><div><div class="setting-title">' + escapeHtml(title) +
      '</div><div class="setting-sub">' + escapeHtml(subtitle) + '</div></div></div>' +
      '<div class="setting-view"><div class="setting-grid' + (type === "count" ? " counts" : "") + '">' +
      preview + '</div><button type="button" class="setting-edit" data-setting-edit="' + type + '">' +
      escapeHtml(text("edit")) + '</button></div>' +
      '<div class="setting-editor" data-setting-editor="' + type + '" hidden>' +
      '<div class="editor-grid">' + editors + '</div>' +
      '<div class="editor-footer">' +
      '<div class="editor-status" hidden><span class="editor-status-dot"></span><span>' +
      escapeHtml(text("unsavedChanges")) + '</span></div>' +
      '<div class="change-summary" hidden aria-live="polite"></div>' +
      '<div class="editor-error" hidden role="alert">' + escapeHtml(text("invalidSettingValue")) + '</div>' +
      '<div class="editor-actions"><button type="button" class="setting-cancel">' + escapeHtml(text("cancel")) +
      '</button><button type="button" class="setting-save" data-setting-type="' + type +
      '" data-group-id="' + escapeHtml(String(groupId)) + '"><span class="button-label">' +
      escapeHtml(type === "count" ? text("saveCountLimits") : text("saveLimits")) + '</span></button></div>' +
      '</div></div>';
  }

  function updateChangeSummary(editor, errorMessage) {
    var summary = editor.querySelector(".change-summary");
    if (!summary) return;

    var labels = { eat: text("eat"), wc: text("wc"), smoke: text("smoke"), wcd: text("wcd") };
    var changes = [];
    editor.querySelectorAll(".editor-input").forEach(function (input) {
      if (input.value === input.getAttribute("data-original-value")) return;
      var kind = input.getAttribute("data-kind");
      changes.push(
        "<strong>" + escapeHtml(labels[kind] || kind.toUpperCase()) + "</strong> " +
        escapeHtml(input.getAttribute("data-original-value")) + " → " + escapeHtml(input.value)
      );
    });

    if (!changes.length && !errorMessage) {
      summary.hidden = true;
      summary.classList.remove("is-error");
      summary.textContent = "";
      return;
    }
    summary.hidden = false;
    summary.classList.toggle("is-error", Boolean(errorMessage));
    summary.innerHTML = errorMessage
      ? escapeHtml(errorMessage)
      : "<span>" + escapeHtml(text("changesToSave")) + ":</span> " + changes.join(", ");
  }

  function validateEditor(editor, revealError) {
    var invalid = false;
    var dirty = false;
    editor.querySelectorAll(".editor-input").forEach(function (input) {
      var value = Number(input.value);
      var fieldInvalid = !Number.isSafeInteger(value) || value <= 0;
      input.classList.toggle("is-invalid", fieldInvalid);
      input.setAttribute("aria-invalid", String(fieldInvalid));
      if (fieldInvalid) invalid = true;
      if (input.value !== input.getAttribute("data-original-value")) dirty = true;
    });

    var status = editor.querySelector(".editor-status");
    if (status) status.hidden = !dirty;
    var error = editor.querySelector(".editor-error");
    if (error) error.hidden = !(revealError && invalid);
    var saveButton = editor.querySelector(".setting-save");
    if (saveButton && !state.settingsSaving) saveButton.disabled = invalid || !dirty;
    updateChangeSummary(editor);
    return !invalid;
  }

  function bindSettingEditors() {
    document.querySelectorAll(".setting-edit").forEach(function (button) {
      button.onclick = function () {
        var card = button.closest(".settings-card");
        var view = card && card.querySelector(".setting-view");
        var editor = card && card.querySelector(".setting-editor");
        if (!view || !editor) return;
        view.hidden = true;
        editor.hidden = false;
        validateEditor(editor, false);
        var input = editor.querySelector(".editor-input");
        if (input) input.focus();
      };
    });

    document.querySelectorAll(".editor-input").forEach(function (input) {
      input.oninput = function () {
        var editor = input.closest(".setting-editor");
        if (!editor || state.settingsSaving) return;
        validateEditor(editor, true);
      };
      input.onkeydown = function (event) {
        var editor = input.closest(".setting-editor");
        if (!editor) return;
        if (event.key === "Escape") {
          event.preventDefault();
          var cancel = editor.querySelector(".setting-cancel");
          if (cancel) cancel.click();
        } else if (event.key === "Enter") {
          event.preventDefault();
          var save = editor.querySelector(".setting-save");
          if (save && !save.disabled) save.click();
        }
      };
    });

    document.querySelectorAll(".setting-cancel").forEach(function (button) {
      button.onclick = function () {
        var editor = button.closest(".setting-editor");
        var card = button.closest(".settings-card");
        if (!editor || !card) return;
        editor.querySelectorAll(".editor-input").forEach(function (input) {
          input.value = input.getAttribute("data-original-value");
          input.classList.remove("is-invalid");
          input.setAttribute("aria-invalid", "false");
        });
        var error = editor.querySelector(".editor-error");
        if (error) error.hidden = true;
        var summary = editor.querySelector(".change-summary");
        if (summary) summary.hidden = true;
        var status = editor.querySelector(".editor-status");
        if (status) status.hidden = true;
        editor.hidden = true;
        card.querySelector(".setting-view").hidden = false;
        scheduleAutoRefresh();
      };
    });

    document.querySelectorAll(".setting-save").forEach(function (button) {
      button.onclick = function () {
        saveSettings(button);
      };
    });
  }

  async function saveSettings(button) {
    if (state.settingsSaving) return;
    var editor = button.closest(".setting-editor");
    if (!editor) return;
    var type = button.getAttribute("data-setting-type");
    var groupId = Number(button.getAttribute("data-group-id"));
    if (!Number.isSafeInteger(groupId) || groupId >= 0) {
      showNotice("Invalid group.", "error");
      return;
    }
    if (!validateEditor(editor, true)) {
      showNotice(text("invalidSettingValue"), "error");
      return;
    }

    var inputs = Array.prototype.slice.call(editor.querySelectorAll(".editor-input"));
    var changed = inputs.filter(function (input) {
      return input.value !== input.getAttribute("data-original-value");
    });
    if (!changed.length) return;

    state.settingsSaving = true;
    button.disabled = true;
    button.classList.add("is-saving");
    setButton(button, "loading", text("saving") + "…");

    var succeeded = [];
    try {
      for (var index = 0; index < changed.length; index += 1) {
        var input = changed[index];
        var value = Number(input.value);
        var kind = input.getAttribute("data-kind");
        await apiUserSettings(groupId, type, kind, value);
        input.setAttribute("data-original-value", input.value);
        succeeded.push(input);
      }

      showNotice(text("saved"), "ok");
      editor.hidden = true;
      editor.closest(".settings-card").querySelector(".setting-view").hidden = false;
      await loadUserDashboard(false, groupId);
    } catch (error) {
      var message = error && error.message ? error.message : text("saveFailed");
      var remainingDirty = inputs.some(function (input) {
        return input.value !== input.getAttribute("data-original-value");
      });
      var recovery = succeeded.length && remainingDirty ? text("savePartialFailure") : message;
      validateEditor(editor, true);
      updateChangeSummary(editor, recovery);
      showNotice(recovery, "error");
      button.disabled = false;
      button.classList.remove("is-saving");
      setButton(button, "idle", type === "count" ? text("saveCountLimits") : text("saveLimits"));
    } finally {
      state.settingsSaving = false;
      if (!editor.hidden) validateEditor(editor, true);
      else button.classList.remove("is-saving");
    }
  }

  async function fetchJson(url, options, label) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout = controller
      ? window.setTimeout(function () { controller.abort(); }, 15000)
      : null;

    try {
      var requestOptions = Object.assign({}, options || {});
      if (controller) requestOptions.signal = controller.signal;
      var response = await fetch(url, requestOptions);
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : label + " request failed (" + response.status + ")."
        );
      }
      return data;
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error(label + " request timed out. Please try again.");
      }
      throw error;
    } finally {
      if (timeout !== null) window.clearTimeout(timeout);
    }
  }

  async function apiUserDashboard(userId, groupId) {
    if (!initData) throw new Error("Telegram session data is missing.");
    var body = { userId: Number(userId) };
    if (groupId !== undefined && groupId !== null) body.groupId = Number(groupId);
    return fetchJson(
      "/api/user/dashboard",
      {
        method: "POST",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      },
      "Dashboard API"
    );
  }

  async function apiUserReport(category, message, groupId) {
    if (!initData) throw new Error("Telegram session data is missing.");
    return fetchJson(
      "/api/user/report",
      {
        method: "POST",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category: category,
          message: message,
          groupId: Number(groupId)
        })
      },
      "Report"
    );
  }

  async function apiUserSettings(groupId, type, kind, value) {
    if (!initData) throw new Error("Telegram session data is missing.");
    return fetchJson(
      "/api/user/settings",
      {
        method: "PUT",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          groupId: Number(groupId),
          type: type,
          kind: kind,
          value: Number(value)
        })
      },
      "Settings"
    );
  }

  function updateMetrics(group) {
    var memberValue = String(Number(group.memberCount) || 0);
    var activeValue = String(Number(group.activeCount) || 0);
    if (els["user-member-count"].textContent !== memberValue) {
      els["user-member-count"].textContent = memberValue;
      els["user-member-count"].classList.remove("metric-updated");
      void els["user-member-count"].offsetWidth;
      els["user-member-count"].classList.add("metric-updated");
    }
    if (els["user-active-count"].textContent !== activeValue) {
      els["user-active-count"].textContent = activeValue;
      els["user-active-count"].classList.remove("metric-updated");
      void els["user-active-count"].offsetWidth;
      els["user-active-count"].classList.add("metric-updated");
    }
  }

  function renderGroupOptions(groups) {
    els["user-group-options-list"].innerHTML = (groups || []).map(function (group) {
      return '<button type="button" class="group-option" data-group-id="' +
        escapeHtml(String(group.id)) + '">' +
        '<span class="group-option-name">' + escapeHtml(group.title || String(group.id)) + '</span>' +
        '<span class="group-option-arrow" aria-hidden="true">›</span>' +
        '</button>';
    }).join("");

    els["user-group-options-list"].querySelectorAll(".group-option").forEach(function (button) {
      button.onclick = function () {
        selectUserGroup(Number(button.getAttribute("data-group-id")));
      };
    });
  }

  function renderSelectedDashboard(data, languageOnly) {
    var group = data && data.selectedGroup;
    if (!group) return;

    state.dashboard = data;
    state.selectedGroupId = Number(group.id);
    saveDashboardState({ groupId: state.selectedGroupId });

    if (languageOnly && (state.aboutOpen || state.supportOpen)) return;

    els["user-group-options"].hidden = true;
    els["user-selected-dashboard"].hidden = false;
    els["user-dashboard"].hidden = false;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
    els["user-tabbar"].hidden = false;

    els.title.textContent = text("title");
    els.identity.textContent = userGreeting();
    els["user-dashboard-sub"].textContent = text("dashboardEyebrow");
    els["user-selected-group-title"].textContent = (group.title || String(group.id)) + " " + text("title");
    updateMetrics(group);

    els["user-settings-limits-card"].innerHTML =
      renderSettingCard("duration", data.activityLimits || DEFAULTS.duration, group.id);
    els["user-settings-counts-card"].innerHTML =
      renderSettingCard("count", data.countLimits || DEFAULTS.count, group.id);

    bindSettingEditors();

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === "dashboard";
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    setDashboardControls(true);
    updateAutoRefreshControl();
    scheduleAutoRefresh();
    updateBackButton();

    if (languageOnly) return;
  }

  function renderDashboard(data) {
    if (!data || typeof data !== "object") {
      throw new Error(text("invalidResponse"));
    }
    if (!data.hasGroups) {
      showNoGroup();
      return false;
    }

    state.dashboard = data;

    if (data.selectionRequired) {
      var saved = readDashboardState();
      var savedGroup = saved.groupId;
      var matching = savedGroup !== null
        ? (data.groups || []).find(function (group) { return Number(group.id) === savedGroup; })
        : null;

      if (matching) {
        state.groupPickerOpen = false;
        selectUserGroup(savedGroup);
        return false;
      }

      state.groupPickerOpen = true;
      els["user-dashboard"].hidden = false;
      els["user-group-options"].hidden = false;
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-tabbar"].hidden = true;
      els.title.textContent = text("groupOptions");
      els.identity.textContent = userGreeting();
      renderGroupOptions(data.groups || []);
      setDashboardControls(false);
      updateBackButton();
      return true;
    }

    renderSelectedDashboard(data, false);
    return true;
  }

  async function loadUserDashboard(showLoading, groupId, silent) {
    if (!telegramUserId) throw new Error(text("identifyError"));
    if (state.aboutOpen || state.supportOpen) return true;

    var requestId = ++state.requestId;
    var shouldShowLoading = showLoading !== false;
    if (shouldShowLoading) setLoading(true);

    try {
      var data;
      try {
        data = await apiUserDashboard(telegramUserId, groupId);
      } catch (error) {
        var apiMessage = error && error.message ? error.message : String(error);
        throw new Error(text("apiPrefix") + ": " + apiMessage);
      }

      if (requestId !== state.requestId || state.aboutOpen || state.supportOpen) return false;
      if (state.groupPickerOpen && groupId === undefined) return false;

      var opened;
      try {
        opened = renderDashboard(data);
      } catch (error) {
        var renderMessage = error && error.message ? error.message : String(error);
        throw new Error(text("renderPrefix") + ": " + renderMessage);
      }

      if (opened || (data && data.hasGroups === false)) {
        setLoading(false);
      }
      return opened;
    } catch (error) {
      if (requestId === state.requestId && !state.aboutOpen && !silent) {
        showDashboardError(error, groupId);
      }
      throw error;
    } finally {
      if (shouldShowLoading) setLoading(false);
    }
  }

  async function selectUserGroup(groupId) {
    if (!Number.isSafeInteger(groupId) || groupId >= 0) return;
    state.groupPickerOpen = false;
    try {
      await loadUserDashboard(true, groupId);
    } catch (error) {
      state.groupPickerOpen = true;
      if (!els["user-dashboard-error-screen"].hidden) return;
      showNotice(error && error.message ? error.message : "Unable to open the selected group.", "error");
    }
  }

  function setDashboardTab(tab) {
    if (!state.dashboard || !els["user-tabbar"] || els["user-tabbar"].hidden) return;
    if (state.groupPickerOpen) return;

    tab = tab === "about" || tab === "support" ? tab : "dashboard";
    state.aboutOpen = tab === "about";
    state.supportOpen = tab === "support";
    saveDashboardState({ tab: tab });

    ++state.requestId;

    if (state.aboutOpen) {
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = false;
      els["user-support-page"].hidden = true;
      els.title.textContent = text("about");
      els.identity.textContent = userGreeting();
      setDashboardControls(false);
    } else if (state.supportOpen) {
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = false;
      els.title.textContent = text("helpSupport");
      els.identity.textContent = userGreeting();
      updateReportContext();
      setDashboardControls(false);
    } else {
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-selected-dashboard"].hidden = false;
      els.title.textContent = text("title");
      els.identity.textContent = userGreeting();
      setDashboardControls(true);
      if (state.dashboard) renderSelectedDashboard(state.dashboard, true);
    }

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });

    updateBackButton();
  }

  async function openGroupPicker() {
    if (!state.dashboard || state.aboutOpen || state.supportOpen || state.groupPickerOpen || state.settingsSaving || state.refreshInProgress) return;
    var hasUnsaved = false;
    document.querySelectorAll(".editor-input[data-original-value]").forEach(function (input) {
      if (input.value !== input.getAttribute("data-original-value")) hasUnsaved = true;
    });
    if (hasUnsaved) {
      showNotice(
        state.language === "my"
          ? "Group မပြောင်းမီ မသိမ်းရသေးသော ပြင်ဆင်ချက်များကို Save သို့မဟုတ် Cancel လုပ်ပါ။"
          : state.language === "zh"
            ? "切换群组前，请先保存或取消未保存的更改。"
            : "Save or cancel your unsaved changes before switching groups.",
        "error"
      );
      return;
    }

    state.groupPickerOpen = true;
    state.aboutOpen = false;
    state.supportOpen = false;
    ++state.requestId;
    els["user-group-options"].hidden = false;
    els["user-selected-dashboard"].hidden = true;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
    els["user-tabbar"].hidden = true;
    els.title.textContent = text("groupOptions");
    els.identity.textContent = userGreeting();
    setDashboardControls(false);
    updateBackButton();

    try {
      setLoading(true);
      var data = await apiUserDashboard(telegramUserId);
      if (!data || typeof data !== "object" || !Array.isArray(data.groups)) {
        throw new Error(text("invalidResponse"));
      }
      state.dashboard = Object.assign({}, state.dashboard, data);
      renderGroupOptions(data.groups);
    } catch (error) {
      state.groupPickerOpen = false;
      if (state.dashboard && state.dashboard.selectedGroup) {
        renderSelectedDashboard(state.dashboard, true);
      }
      showNotice(error && error.message ? error.message : "Unable to load groups.", "error");
    } finally {
      setLoading(false);
      updateBackButton();
    }
  }

  function updateBackButton() {
    if (!tg || !tg.BackButton) return;
    var shouldShow =
      Boolean(state.dashboard) &&
      (state.groupPickerOpen || state.aboutOpen || state.supportOpen);
    if (shouldShow) tg.BackButton.show();
    else tg.BackButton.hide();
  }

  function handleBackButton() {
    if (state.groupPickerOpen && state.dashboard && state.dashboard.selectedGroup) {
      state.groupPickerOpen = false;
      renderSelectedDashboard(state.dashboard, true);
      if (readDashboardState().tab === "about") {
        setDashboardTab("about");
      }
      return;
    }
    if (state.aboutOpen || state.supportOpen) setDashboardTab("dashboard");
  }

  function bindStaticEvents() {
    els["user-language-button"].onclick = openLanguageMenu;
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".language-button") && !event.target.closest(".language-menu")) {
        closeLanguageMenu();
      }
    });

    document.querySelectorAll(".language-option").forEach(function (option) {
      option.onclick = function () {
        var selected = option.getAttribute("data-user-lang");
        if (!TEXT[selected]) return;
        state.language = selected;
        writeStorage(STORAGE_KEYS.language, selected);
        closeLanguageMenu();
        applyLanguage();
      };
    });

    els["user-id-input"].oninput = function () {
      var value = els["user-id-input"].value.replace(/\D/g, "");
      els["user-id-input"].value = value;
      els["user-confirm"].disabled = value.length === 0;
    };

    els["user-id-input"].onkeydown = function (event) {
      if (event.key === "Enter" && !els["user-confirm"].disabled) {
        event.preventDefault();
        verifyUser();
      }
    };

    els["user-confirm"].onclick = verifyUser;

    els.refresh.onclick = function () {
      if (state.aboutOpen || state.groupPickerOpen || state.settingsSaving || state.refreshInProgress) return;
      state.refreshInProgress = true;
      stopAutoRefresh();
      setButton(els.refresh, "loading", text("refreshing") + "…");
      loadUserDashboard(false, state.selectedGroupId)
        .then(function () {
          showNotice(text("refreshSuccess"), "ok");
        })
        .catch(function (error) {
          showNotice(error && error.message ? error.message : "Refresh failed.", "error");
        })
        .finally(function () {
          state.refreshInProgress = false;
          setButton(els.refresh, "idle", text("refresh"));
          scheduleAutoRefresh();
        });
    };

    els["user-report-message"].oninput = updateReportCharacterCount;
    els["user-report-form"].onsubmit = submitProblemReport;

    els["auto-refresh-toggle"].onclick = function () {
      if (state.aboutOpen || state.groupPickerOpen || !state.dashboard || !state.dashboard.selectedGroup) return;
      state.autoRefreshEnabled = !state.autoRefreshEnabled;
      writeStorage(
        STORAGE_KEYS.autoRefresh,
        state.autoRefreshEnabled ? "1" : "0"
      );
      updateAutoRefreshControl();
      if (state.autoRefreshEnabled) {
        showNotice(text("autoRefreshEnabled"), "ok");
        scheduleAutoRefresh();
      } else {
        stopAutoRefresh();
        showNotice(text("autoRefreshDisabled"), "ok");
      }
    };

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAutoRefresh();
      else scheduleAutoRefresh();
    });

    els["switch-group"].onclick = openGroupPicker;
    els["user-dashboard-error-retry"].onclick = function () {
      if (els["user-dashboard-error-retry"].disabled) return;
      var groupId = state.errorGroupId;
      els["user-dashboard-error-retry"].disabled = true;
      setButton(els["user-dashboard-error-retry"], "loading", text("refreshing") + "…");
      loadUserDashboard(true, groupId)
        .then(function (opened) {
          if (opened) {
            els["user-dashboard-error-screen"].hidden = true;
            els["user-dashboard-error-retry"].disabled = false;
          }
        })
        .catch(function () {})
        .finally(function () {
          if (!els["user-dashboard-error-screen"].hidden) {
            els["user-dashboard-error-retry"].disabled = false;
            setButton(els["user-dashboard-error-retry"], "idle", text("tryAgain"));
          }
        });
    };

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      button.onclick = function () {
        setDashboardTab(button.getAttribute("data-user-tab"));
      };
    });

    if (tg && tg.BackButton && typeof tg.BackButton.onClick === "function") {
      tg.BackButton.onClick(handleBackButton);
      tg.BackButton.hide();
    }
  }

  async function verifyUser() {
    var entered = els["user-id-input"].value.trim();
    if (!entered || !telegramUserId) return;

    if (Number(entered) !== telegramUserId) {
      showNotice(text("mismatch"), "error");
      return;
    }

    els["user-confirm"].disabled = true;
    var label = els["user-confirm"].querySelector(".button-label");
    if (label) label.textContent = text("saving") + "…";

    try {
      setVerifiedUserId(telegramUserId);
      state.selectedGroupId = readDashboardState().groupId;
      var opened = await loadUserDashboard(true, state.selectedGroupId || undefined);
      if (opened) {
        els["user-confirm"].classList.add("confirmed");
        if (label) label.textContent = text("confirmed");
      }
    } catch (error) {
      els["user-confirm"].disabled = false;
      els["user-confirm"].classList.remove("confirmed");
      if (label) label.textContent = text("confirm");
      showNotice(error && error.message ? error.message : "Verification failed.", "error");
    }
  }

  function hydrateInitialState() {
    var storedLanguage = readStorage(STORAGE_KEYS.language);
    if (storedLanguage && TEXT[storedLanguage]) state.language = storedLanguage;

    state.verifiedUserId = getVerifiedUserId();

    var savedDashboard = readDashboardState();
    state.selectedGroupId = savedDashboard.groupId;

    var savedAutoRefresh = readStorage(STORAGE_KEYS.autoRefresh);
    state.autoRefreshEnabled = savedAutoRefresh === "1";
  }

  function hideSplash() {
    if (!els.splash || hideSplash.hidden) return;
    var elapsed = Date.now() - hideSplash.startedAt;
    var remaining = Math.max(0, 3000 - elapsed);
    window.clearTimeout(hideSplash.timer);
    hideSplash.timer = window.setTimeout(function () {
      hideSplash.hidden = true;
      els.splash.classList.add("hide");
    }, remaining);
  }
  hideSplash.startedAt = Date.now();
  hideSplash.hidden = false;

  function handleStartupFailure(error) {
    var message = error && error.message ? error.message : "Unable to start the Mini App.";
    els.identity.textContent = message;
    showNotice(message, "error");
    hideSplash();
  }

  async function initialize() {
    cacheElements();

    if (!tg || !initData) {
      els.identity.textContent = text("openTelegram");
      els["user-verify-card"].hidden = false;
      els["user-confirm"].disabled = true;
      hideSplash();
      return;
    }

    tg.ready();
    if (typeof tg.expand === "function") tg.expand();

    hydrateInitialState();
    applyLanguage();
    bindStaticEvents();

    var currentUserId = String(telegramUserId || "");
    if (!currentUserId) {
      throw new Error(text("identifyError"));
    }

    if (state.verifiedUserId === currentUserId) {
      try {
        await loadUserDashboard(true, state.selectedGroupId || undefined);
      } catch (_) {
        // The dashboard error screen already contains the actionable state.
      }
    } else {
      showVerification();
    }

    hideSplash();
  }

  window.addEventListener("error", function (event) {
    if (!els.identity) return;
    var error = event && event.error ? event.error : new Error("Mini App startup error.");
    handleStartupFailure(error);
  });

  window.addEventListener("unhandledrejection", function (event) {
    if (!els.identity) return;
    var reason = event && event.reason ? event.reason : new Error("Mini App startup error.");
    handleStartupFailure(reason);
  });

  initialize().catch(handleStartupFailure);

  window.setTimeout(function () {
    if (!hideSplash.hidden) {
      hideSplash.hidden = true;
      els.splash.classList.add("hide");
    }
  }, 5500);
})();
