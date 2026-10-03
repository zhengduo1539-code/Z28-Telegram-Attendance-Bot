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
    toolsOpen: false,
    connectEditMode: false,
    connectEditSnapshot: null,
    connectLoading: false,
    connectSaving: false,
    appearanceOpen: false,
    appearanceTheme: "dark",
    wallpaper: "default",
    animationsEnabled: true,
    compactMode: false,
    autoRefreshEnabled: false,
    autoRefreshTimer: null,
    refreshInProgress: false
  };

  var STORAGE_KEYS = {
    verifiedUser: "z28_verified_user_id",
    language: "z28_user_language",
    dashboard: "z28_user_dashboard_state",
    connectSourceGroup: "z28_connect_source_group",
    connectTargetGroup: "z28_connect_target_group",
    autoRefresh: "z28_user_auto_refresh",
    appearanceTheme: "z28_appearance_theme",
    wallpaper: "z28_appearance_wallpaper",
    animations: "z28_appearance_animations",
    compactMode: "z28_appearance_compact"
  };

  var DEFAULTS = {
    duration: { eat: 30, wc: 7, smoke: 7, wcd: 15 },
    count: { eat: Infinity, wc: 7, smoke: 7, wcd: 2 }
  };

  var TEXT = {
    en: {

      faqTitle: "FAQ / Help Center",
      faqSub: "Quick answers to common questions about the Z28 Attendance Bot.",
      faqQ1: "What is the Z28 Attendance Bot?",
      faqA1: "Z28 helps groups manage attendance activities and monitor current activity from the Telegram Mini App.",
      faqQ2: "Who can access the group dashboard?",
      faqA2: "Your Telegram account must be a group owner or administrator, and the bot must still be available in that group.",
      faqQ3: "How do I change activity limits?",
      faqA3: "Open the group dashboard, choose Edit on the relevant settings card, update the values, then press Save. You need the required group permissions.",
      faqQ4: "What does Auto Refresh do?",
      faqA4: "When enabled, the dashboard checks for updated group activity every 30 seconds. It is off by default and can be turned on from the dashboard header.",
      faqQ5: "Why can’t I see a group?",
      faqA5: "Make sure the bot is still in the group and that your Telegram account is a group owner or administrator. Groups that are no longer available to the bot are not shown.",
      faqQ6: "How do I report a problem?",
      faqA6: "Open Help & Support, choose a category, describe the problem, and send the report. Do not include passwords or other sensitive information.",
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
      wallpaperTitle: "Background Wallpaper",
      wallpaperSub: "Choose a lightweight background style.",
      wallpaperDefault: "Default",
      wallpaperAurora: "Aurora",
      wallpaperGrid: "Neon Grid",
      wallpaperNebula: "Nebula",
      wallpaperOcean: "Ocean Glow",
      wallpaperViolet: "Violet Glass",
      tools: "Tools",
      toolsSub: "Connect bot-installed groups with a secure, guided flow.",
      connectTitle: "Group Connection",
      connectSub: "Connect one bot-installed group to another for timeout notifications.",
      connectSource: "Source Group",
      connectSourceSub: "The group where activity timeouts are detected.",
      connectTarget: "Target Group",
      connectTargetSub: "The bot will send timeout notifications to this group.",
      connectSelect: "Select a group",
      connectNoGroups: "No installed groups available.",
      connectInstalledOnly: "Only groups where Z28 is currently installed are shown.",
      connectButton: "Connect Group",
      connectChange: "Edit Connection",
      connectConnecting: "Connecting",
      connectConnected: "Connected",
      connectStatus: "Current Connection",
      connectNone: "No connection is configured for this source group.",
      connectSourceAdmin: "You must be a group owner or administrator of the source group.",
      connectSame: "Choose two different groups.",
      connectLoadFailed: "Unable to load installed groups. Please try again.",
      connectSuccess: "Group connection saved successfully.",
      connectFailed: "Unable to connect these groups. Please try again.",
      connectReady: "Ready to connect",
      appearance: "Appearance",
      appearanceSub: "Personalize the Mini App interface.",
      appearanceKicker: "INTERFACE SETTINGS",
      appearanceTheme: "Theme",
      appearanceThemeSub: "Choose the interface style for this device.",
      themeDark: "Dark",
      themeDarkSub: "Balanced dark interface",
      themeMidnight: "Midnight",
      themeMidnightSub: "Cooler navy and violet finish",
      themeAmoled: "AMOLED",
      themeAmoledSub: "Pure black for OLED displays",
      animations: "Animations",
      animationsSub: "Keep interface motion and transitions enabled.",
      compactMode: "Compact Mode",
      compactModeSub: "Reduce spacing for a denser layout.",
      appearanceOn: "ON",
      appearanceOff: "OFF",
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
      noGroupEyebrow: "GROUP ACCESS",
      noGroup: "No eligible groups yet",
      noGroupCopy: "This Mini App could not find a group that your Telegram account can manage.",
      noGroupHelpTitle: "Getting started",
      noGroupHelpCaption: "Complete these checks, then reopen the Mini App.",
      noGroupStep1Title: "Add the bot to your group",
      noGroupStep1Copy: "Make sure Z28 is still a member of the group you want to manage.",
      noGroupStep2Title: "Check your group role",
      noGroupStep2Copy: "Your Telegram account must be the group owner or an administrator.",
      noGroupStep3Title: "Reopen the Mini App",
      noGroupStep3Copy: "Open the Mini App again after the access changes are complete.",
      noGroupNote: "Groups that are no longer available to the bot are not shown in your dashboard.",
      noGroupBack: "Back to verification",
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

      faqTitle: "FAQ / Help Center",
      faqSub: "Z28 Attendance Bot အကြောင်း မေးလေ့ရှိသော မေးခွန်းများကို အမြန်ကြည့်နိုင်ပါသည်။",
      faqQ1: "Z28 Attendance Bot က ဘာလုပ်ပေးတာလဲ?",
      faqA1: "Z28 သည် Group များအတွက် attendance activity များကို စီမံရန်နှင့် Telegram Mini App မှ လက်ရှိ activity များကို ကြည့်ရှုရန် ကူညီပေးပါသည်။",
      faqQ2: "Group Dashboard ကို ဘယ်သူတွေ ဝင်ကြည့်နိုင်သလဲ?",
      faqA2: "သင့် Telegram account သည် Group owner သို့မဟုတ် administrator ဖြစ်ရမည်။ ထို့အပြင် Bot သည်လည်း ထို Group တွင် ရှိနေဆဲဖြစ်ရပါမည်။",
      faqQ3: "Activity limit တွေကို ဘယ်လိုပြောင်းရမလဲ?",
      faqA3: "Group Dashboard ကိုဖွင့်ပြီး သက်ဆိုင်ရာ settings card မှ Edit ကိုနှိပ်ပါ။ တန်ဖိုးများပြောင်းပြီး Save ကိုနှိပ်ပါ။ လိုအပ်သော Group permission ရှိရပါမည်။",
      faqQ4: "Auto Refresh က ဘာလုပ်ပေးတာလဲ?",
      faqA4: "ဖွင့်ထားပါက Dashboard က Group activity အချက်အလက်အသစ်များကို စက္ကန့် ၃၀ တစ်ကြိမ် စစ်ဆေးပေးပါသည်။ ပုံမှန်အားဖြင့် ပိတ်ထားပြီး Dashboard header မှ ဖွင့်နိုင်ပါသည်။",
      faqQ5: "Group တစ်ခုကို ဘာကြောင့် မမြင်ရတာလဲ?",
      faqA5: "Bot သည် ထို Group ထဲတွင် ရှိနေဆဲဖြစ်ကြောင်းနှင့် သင့် Telegram account သည် Group owner သို့မဟုတ် administrator ဖြစ်ကြောင်း စစ်ဆေးပါ။ Bot အသုံးမပြုနိုင်တော့သော Group များကို မပြပါ။",
      faqQ6: "ပြဿနာတစ်ခုကို ဘယ်လိုတင်ပြရမလဲ?",
      faqA6: "Help & Support ကိုဖွင့်ပြီး အမျိုးအစားရွေးပါ။ ပြဿနာကို ရေးပြီး Report ပို့ပါ။ Password သို့မဟုတ် sensitive information များကို မထည့်ပါနှင့်။",
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
      wallpaperTitle: "Background Wallpaper",
      wallpaperSub: "ပေါ့ပါးပြီး လှပသော background ပုံစံကို ရွေးချယ်ပါ။",
      wallpaperDefault: "Default",
      wallpaperAurora: "Aurora",
      wallpaperGrid: "Neon Grid",
      wallpaperNebula: "Nebula",
      wallpaperOcean: "Ocean Glow",
      wallpaperViolet: "Violet Glass",
      tools: "Tools",
      toolsSub: "Group tools and connection controls.",
      connectTitle: "Group Connection",
      connectSub: "Bot ထည့်သွင်းထားသော Group များကို လုံခြုံစွာ ချိတ်ဆက်နိုင်ပါသည်။",
      connectSource: "Source Group",
      connectSourceSub: "Activity timeout ဖြစ်ပေါ်မည့် Group။",
      connectTarget: "Target Group",
      connectTargetSub: "Timeout notification များကို ဤ Group သို့ ပို့ပါမည်။",
      connectSelect: "Group ရွေးပါ",
      connectNoGroups: "Bot ထည့်ထားသော Group မရှိသေးပါ။",
      connectInstalledOnly: "Z28 Bot ထည့်သွင်းထားသော Group များကိုသာ ပြသပါသည်။",
      connectButton: "Group ချိတ်ဆက်မည်",
      connectChange: "ချိတ်ဆက်မှု ပြင်မည်",
      connectConnecting: "ချိတ်ဆက်နေသည်",
      connectConnected: "ချိတ်ဆက်ပြီး",
      connectStatus: "လက်ရှိ ချိတ်ဆက်မှု",
      connectNone: "ဤ Source Group အတွက် ချိတ်ဆက်ထားမှု မရှိသေးပါ။",
      connectSourceAdmin: "Source Group တွင် owner သို့မဟုတ် administrator ဖြစ်ရပါမည်။",
      connectSame: "မတူညီသော Group နှစ်ခုကို ရွေးပါ။",
      connectLoadFailed: "Bot ထည့်ထားသော Group များကို မဖတ်နိုင်ပါ။ ထပ်စမ်းကြည့်ပါ။",
      connectSuccess: "Group ချိတ်ဆက်မှုကို အောင်မြင်စွာ သိမ်းပြီးပါပြီ။",
      connectFailed: "Group ချိတ်ဆက်၍ မရပါ။ ထပ်စမ်းကြည့်ပါ။",
      connectReady: "ချိတ်ဆက်ရန် အဆင်သင့်ဖြစ်ပါပြီ",
      appearance: "Appearance",
      appearanceSub: "Mini App ရဲ့ အပြင်အဆင်ကို စိတ်ကြိုက်ပြင်ဆင်ပါ။",
      appearanceKicker: "INTERFACE SETTINGS",
      appearanceTheme: "Theme",
      appearanceThemeSub: "ဤ device အတွက် အသုံးပြုမည့် interface ပုံစံကို ရွေးပါ။",
      themeDark: "Dark",
      themeDarkSub: "မူလ dark interface ပုံစံ",
      themeMidnight: "Midnight",
      themeMidnightSub: "Navy နှင့် violet အရောင်ပိုင်း ပိုမိုနက်ရှိုင်းသောပုံစံ",
      themeAmoled: "AMOLED",
      themeAmoledSub: "OLED display များအတွက် pure black ပုံစံ",
      animations: "Animations",
      animationsSub: "Interface ရဲ့ motion နဲ့ transition များကို ဖွင့်ထားမည်။",
      compactMode: "Compact Mode",
      compactModeSub: "Screen space သက်သာစေရန် spacing ကို လျှော့မည်။",
      appearanceOn: "ON",
      appearanceOff: "OFF",
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
      noGroupEyebrow: "GROUP ACCESS",
      noGroup: "အသုံးပြုနိုင်သော Group မတွေ့သေးပါ",
      noGroupCopy: "ဤ Mini App မှ သင့် Telegram account အနေဖြင့် စီမံနိုင်သော Group ကို မတွေ့ပါ။",
      noGroupHelpTitle: "စတင်ရန် စစ်ဆေးရန်များ",
      noGroupHelpCaption: "အောက်ပါအချက်များကို စစ်ဆေးပြီး Mini App ကို ပြန်ဖွင့်ပါ။",
      noGroupStep1Title: "Bot ကို Group ထဲသို့ ထည့်ထားပါ",
      noGroupStep1Copy: "စီမံလိုသော Group ထဲတွင် Z28 Bot ရှိနေဆဲဖြစ်ကြောင်း သေချာပါစေ။",
      noGroupStep2Title: "သင့် Group role ကို စစ်ဆေးပါ",
      noGroupStep2Copy: "သင့် Telegram account သည် Group owner သို့မဟုတ် administrator ဖြစ်ရပါမည်။",
      noGroupStep3Title: "Mini App ကို ပြန်ဖွင့်ပါ",
      noGroupStep3Copy: "Access ပြောင်းလဲမှုများ ပြီးစီးပြီးနောက် Mini App ကို ပြန်ဖွင့်ပါ။",
      noGroupNote: "Bot မှ အသုံးပြုခွင့်မရှိတော့သော Group များကို Dashboard တွင် မပြပါ။",
      noGroupBack: "ID အတည်ပြုရန် ပြန်သွားမည်",
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

      faqTitle: "常见问题 / 帮助中心",
      faqSub: "快速查看关于 Z28 考勤机器人的常见问题解答。",
      faqQ1: "Z28 考勤机器人是做什么的？",
      faqA1: "Z28 帮助群组管理考勤活动，并通过 Telegram Mini App 查看当前活动状态。",
      faqQ2: "谁可以访问群组仪表板？",
      faqA2: "您的 Telegram 账号必须是群主或管理员，并且机器人仍然在该群组中。",
      faqQ3: "如何修改活动限制？",
      faqA3: "打开群组仪表板，在相应设置卡片中选择编辑，修改数值后点击保存。您需要具备相应的群组权限。",
      faqQ4: "自动刷新有什么作用？",
      faqA4: "开启后，仪表板每 30 秒检查一次最新的群组活动数据。默认关闭，可在仪表板顶部开启。",
      faqQ5: "为什么看不到某个群组？",
      faqA5: "请确认机器人仍在该群组中，并确认您的 Telegram 账号是群主或管理员。机器人无法使用的群组不会显示。",
      faqQ6: "如何报告问题？",
      faqA6: "打开帮助与支持，选择问题类型，描述问题并发送报告。请不要填写密码或其他敏感信息。",
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
      wallpaperTitle: "背景壁纸",
      wallpaperSub: "选择轻量且具有动画效果的背景样式。",
      wallpaperDefault: "默认",
      wallpaperAurora: "极光",
      wallpaperGrid: "霓虹网格",
      wallpaperNebula: "星云",
      wallpaperOcean: "海洋光",
      wallpaperViolet: "紫色玻璃",
      tools: "工具",
      toolsSub: "用于群组连接与常用管理操作。",
      connectTitle: "群组连接",
      connectSub: "安全地连接已安装 Bot 的群组，用于超时通知。",
      connectSource: "来源群组",
      connectSourceSub: "检测到活动超时的群组。",
      connectTarget: "目标群组",
      connectTargetSub: "超时通知将发送到此群组。",
      connectSelect: "选择群组",
      connectNoGroups: "暂无已安装 Bot 的群组。",
      connectInstalledOnly: "仅显示当前已安装 Z28 Bot 的群组。",
      connectButton: "连接群组",
      connectChange: "更换群组",
      connectConnecting: "连接中",
      connectConnected: "已连接",
      connectStatus: "当前连接",
      connectNone: "此来源群组尚未配置连接。",
      connectSourceAdmin: "您必须是来源群组的创建者或管理员。",
      connectSame: "请选择两个不同的群组。",
      connectLoadFailed: "无法加载已安装 Bot 的群组，请重试。",
      connectSuccess: "群组连接已成功保存。",
      connectFailed: "无法连接所选群组，请重试。",
      appearance: "外观",
      appearanceSub: "自定义 Mini App 的界面显示方式。",
      appearanceKicker: "界面设置",
      appearanceTheme: "主题",
      appearanceThemeSub: "选择此设备使用的界面风格。",
      themeDark: "深色",
      themeDarkSub: "平衡的深色界面",
      themeMidnight: "午夜",
      themeMidnightSub: "更深的海军蓝与紫色风格",
      themeAmoled: "AMOLED",
      themeAmoledSub: "适合 OLED 屏幕的纯黑风格",
      animations: "动画",
      animationsSub: "保持界面动画和过渡效果。",
      compactMode: "紧凑模式",
      compactModeSub: "减少间距，让布局更加紧凑。",
      appearanceOn: "开启",
      appearanceOff: "关闭",
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
      noGroupEyebrow: "群组访问",
      noGroup: "暂时没有找到可用群组",
      noGroupCopy: "此 Mini App 没有找到您的 Telegram 账号可以管理的群组。",
      noGroupHelpTitle: "开始前请检查",
      noGroupHelpCaption: "完成以下检查后，请重新打开 Mini App。",
      noGroupStep1Title: "将 Bot 添加到群组",
      noGroupStep1Copy: "请确认您要管理的群组中仍然有 Z28 Bot。",
      noGroupStep2Title: "检查您的群组身份",
      noGroupStep2Copy: "您的 Telegram 账号必须是群主或管理员。",
      noGroupStep3Title: "重新打开 Mini App",
      noGroupStep3Copy: "完成访问权限调整后，再次打开 Mini App。",
      noGroupNote: "Bot 已无法使用的群组不会显示在您的 Dashboard 中。",
      noGroupBack: "返回验证",
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
      "user-no-group-screen","user-no-group-eyebrow","user-no-group-title","user-no-group-message",
      "user-no-group-help-title","user-no-group-help-caption",
      "user-no-group-step1-title","user-no-group-step1-copy",
      "user-no-group-step2-title","user-no-group-step2-copy",
      "user-no-group-step3-title","user-no-group-step3-copy","user-no-group-note",
      "user-no-group-back","user-no-group-back-label",
      "user-dashboard-error-screen","user-dashboard-error-title","user-dashboard-error-lead",
      "user-dashboard-error-retry","user-dashboard","user-group-options",
      "group-options-title","group-options-subtitle","user-group-options-list",
      "user-selected-dashboard","selected-group-eyebrow","user-selected-group-title",
      "user-dashboard-sub","refresh","auto-refresh-toggle","auto-refresh-label",
      "switch-group","switch-group-label",
      "user-member-count","user-active-count","user-group-member-label",
      "user-member-active-label","settings-title","settings-subtitle",
      "user-settings-limits-card","user-settings-counts-card",
      "user-tools-page","user-tools-tab-label","user-tools-title","user-tools-sub","user-connect-title","user-connect-sub",
      "user-connect-source-label","user-connect-source-sub","user-connect-source",
      "user-connect-target-label","user-connect-target-sub","user-connect-target",
      "user-connect-note","user-connect-submit","user-connect-status-title","user-connect-status-value",
      "user-connect-status-meta","user-connect-change",
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
      "user-support-tab-label","user-appearance-tab-label","user-report-form",
      "user-appearance-page","user-appearance-title","user-appearance-sub",
      "user-appearance-theme-kicker","user-appearance-theme-title","user-appearance-theme-sub",
      "appearance-theme-dark","appearance-theme-midnight","appearance-theme-amoled",
      "user-appearance-theme-dark-title","user-appearance-theme-dark-sub",
      "user-appearance-theme-midnight-title","user-appearance-theme-midnight-sub",
      "user-appearance-theme-amoled-title","user-appearance-theme-amoled-sub",
      "user-appearance-wallpaper-title","user-appearance-wallpaper-sub",
      "appearance-wallpaper-default","appearance-wallpaper-aurora","appearance-wallpaper-grid",
      "appearance-wallpaper-nebula","appearance-wallpaper-ocean","appearance-wallpaper-violet",
      "user-appearance-wallpaper-default","user-appearance-wallpaper-aurora",
      "user-appearance-wallpaper-grid","user-appearance-wallpaper-nebula",
      "user-appearance-wallpaper-ocean","user-appearance-wallpaper-violet",
      "appearance-animations-toggle","user-appearance-animations-title","user-appearance-animations-sub",
      "user-appearance-animations-state","appearance-compact-toggle","user-appearance-compact-title",
      "user-appearance-compact-sub","user-appearance-compact-state",
      "user-faq-title","user-faq-sub",
      "user-faq-q1","user-faq-a1","user-faq-q2","user-faq-a2",
      "user-faq-q3","user-faq-a3","user-faq-q4","user-faq-a4",
      "user-faq-q5","user-faq-a5","user-faq-q6","user-faq-a6"
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

  function applyAppearancePreferences() {
    var root = document.documentElement;
    root.setAttribute("data-theme", state.appearanceTheme);
    root.setAttribute("data-wallpaper", state.wallpaper);
    root.setAttribute("data-animations", state.animationsEnabled ? "on" : "off");
    root.setAttribute("data-compact", state.compactMode ? "on" : "off");
    updateAppearanceControls();
  }

  function updateAppearanceControls() {
    if (!els["appearance-animations-toggle"]) return;

    document.querySelectorAll('input[name="appearance-theme"]').forEach(function (input) {
      var selected = input.value === state.appearanceTheme;
      input.checked = selected;
      var option = input.closest(".appearance-theme-option");
      if (option) option.classList.toggle("is-selected", selected);
    });

    document.querySelectorAll('input[name="appearance-wallpaper"]').forEach(function (input) {
      var selectedWallpaper = input.value === state.wallpaper;
      input.checked = selectedWallpaper;
      var wallpaperOption = input.closest(".appearance-wallpaper-option");
      if (wallpaperOption) wallpaperOption.classList.toggle("is-selected", selectedWallpaper);
    });

    els["appearance-animations-toggle"].setAttribute("aria-checked", String(state.animationsEnabled));
    els["appearance-animations-toggle"].classList.toggle("is-enabled", state.animationsEnabled);
    els["user-appearance-animations-state"].textContent =
      state.animationsEnabled ? text("appearanceOn") : text("appearanceOff");

    els["appearance-compact-toggle"].setAttribute("aria-checked", String(state.compactMode));
    els["appearance-compact-toggle"].classList.toggle("is-enabled", state.compactMode);
    els["user-appearance-compact-state"].textContent =
      state.compactMode ? text("appearanceOn") : text("appearanceOff");
  }

  function setAppearanceTheme(theme) {
    if (theme !== "dark" && theme !== "midnight" && theme !== "amoled") return;
    state.appearanceTheme = theme;
    writeStorage(STORAGE_KEYS.appearanceTheme, theme);
    applyAppearancePreferences();
  }

  function setWallpaper(wallpaper) {
    var allowed = ["default","aurora","grid","nebula","ocean","violet"];
    if (allowed.indexOf(wallpaper) === -1) return;
    state.wallpaper = wallpaper;
    writeStorage(STORAGE_KEYS.wallpaper, wallpaper);
    applyAppearancePreferences();
  }

  function toggleAnimations() {
    state.animationsEnabled = !state.animationsEnabled;
    writeStorage(STORAGE_KEYS.animations, state.animationsEnabled ? "1" : "0");
    applyAppearancePreferences();
  }

  function toggleCompactMode() {
    state.compactMode = !state.compactMode;
    writeStorage(STORAGE_KEYS.compactMode, state.compactMode ? "1" : "0");
    applyAppearancePreferences();
  }

  function readDashboardState() {
    var raw = readStorage(STORAGE_KEYS.dashboard);
    if (!raw) return { groupId: null, tab: "dashboard" };
    try {
      var parsed = JSON.parse(raw);
      var groupId = Number(parsed && parsed.groupId);
      return {
        groupId: Number.isSafeInteger(groupId) && groupId < 0 ? groupId : null,
        tab:
          parsed && parsed.tab === "about"
            ? "about"
            : parsed && parsed.tab === "appearance"
              ? "appearance"
              : parsed && parsed.tab === "support"
                ? "support"
                : parsed && parsed.tab === "tools"
                  ? "tools"
                  : "dashboard"
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
      !state.appearanceOpen &&
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
    els["user-tools-page"].hidden = true;
    els["user-appearance-page"].hidden = true;
  }

  function applyLanguage() {
    document.documentElement.lang = state.language === "my" ? "my" : state.language;
    els.title.textContent = text("title");
    els.identity.textContent = state.verifiedUserId ? "ID " + state.verifiedUserId : text("startup");
    if (els["user-selected-group-title"]) {
      var dashboardName = state.dashboard && state.dashboard.selectedGroup
        ? (state.dashboard.selectedGroup.title || String(state.dashboard.selectedGroup.id))
        : null;
      var dashboardNameEl = els["user-selected-group-title"].querySelector(".group-dashboard-name");
      var dashboardSuffixEl = els["user-selected-group-title"].querySelector(".group-dashboard-suffix");
      if (dashboardNameEl && dashboardName) dashboardNameEl.textContent = dashboardName;
      if (dashboardSuffixEl) dashboardSuffixEl.textContent = text("title");
    }

    els["user-verify-title"].textContent = text("verifyTitle");
    els["user-verify-subtitle"].textContent = text("verifySubtitle");
    els["user-verify-lead"].textContent = text("verifyLead");
    els["user-no-group-eyebrow"].textContent = text("noGroupEyebrow");
    els["user-no-group-title"].textContent = text("noGroup");
    els["user-no-group-message"].textContent = text("noGroupCopy");
    els["user-no-group-help-title"].textContent = text("noGroupHelpTitle");
    els["user-no-group-help-caption"].textContent = text("noGroupHelpCaption");
    els["user-no-group-step1-title"].textContent = text("noGroupStep1Title");
    els["user-no-group-step1-copy"].textContent = text("noGroupStep1Copy");
    els["user-no-group-step2-title"].textContent = text("noGroupStep2Title");
    els["user-no-group-step2-copy"].textContent = text("noGroupStep2Copy");
    els["user-no-group-step3-title"].textContent = text("noGroupStep3Title");
    els["user-no-group-step3-copy"].textContent = text("noGroupStep3Copy");
    els["user-no-group-note"].textContent = text("noGroupNote");
    els["user-no-group-back-label"].textContent = text("noGroupBack");
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
    els["user-tools-tab-label"].textContent = text("tools");
    els["user-appearance-tab-label"].textContent = text("appearance");
    els["user-tools-title"].textContent = text("tools");
    els["user-tools-sub"].textContent = text("toolsSub");
    els["user-connect-title"].textContent = text("connectTitle");
    els["user-connect-sub"].textContent = text("connectSub");
    els["user-connect-source-label"].textContent = text("connectSource");
    els["user-connect-source-sub"].textContent = text("connectSourceSub");
    els["user-connect-target-label"].textContent = text("connectTarget");
    els["user-connect-target-sub"].textContent = text("connectTargetSub");
    els["user-connect-note"].textContent = text("connectInstalledOnly");
    els["user-connect-status-title"].textContent = text("connectStatus");
    var connectChangeLabel = els["user-connect-change"] && els["user-connect-change"].querySelector(".button-label");
    if (connectChangeLabel) connectChangeLabel.textContent = state.connectEditMode ? text("cancel") : text("connectChange");
    var connectButtonLabel = els["user-connect-submit"].querySelector(".button-label");
    if (connectButtonLabel && !state.connectSaving) connectButtonLabel.textContent = text("connectButton");
    updateConnectStatus();
    els["user-appearance-title"].textContent = text("appearance");
    els["user-appearance-sub"].textContent = text("appearanceSub");
    els["user-appearance-theme-kicker"].textContent = text("appearanceKicker");
    els["user-appearance-theme-title"].textContent = text("appearanceTheme");
    els["user-appearance-theme-sub"].textContent = text("appearanceThemeSub");
    els["user-appearance-theme-dark-title"].textContent = text("themeDark");
    els["user-appearance-theme-dark-sub"].textContent = text("themeDarkSub");
    els["user-appearance-theme-midnight-title"].textContent = text("themeMidnight");
    els["user-appearance-theme-midnight-sub"].textContent = text("themeMidnightSub");
    els["user-appearance-theme-amoled-title"].textContent = text("themeAmoled");
    els["user-appearance-theme-amoled-sub"].textContent = text("themeAmoledSub");
    els["user-appearance-wallpaper-title"].textContent = text("wallpaperTitle");
    els["user-appearance-wallpaper-sub"].textContent = text("wallpaperSub");
    els["user-appearance-wallpaper-default"].textContent = text("wallpaperDefault");
    els["user-appearance-wallpaper-aurora"].textContent = text("wallpaperAurora");
    els["user-appearance-wallpaper-grid"].textContent = text("wallpaperGrid");
    els["user-appearance-wallpaper-nebula"].textContent = text("wallpaperNebula");
    els["user-appearance-wallpaper-ocean"].textContent = text("wallpaperOcean");
    els["user-appearance-wallpaper-violet"].textContent = text("wallpaperViolet");
    els["user-appearance-animations-title"].textContent = text("animations");
    els["user-appearance-animations-sub"].textContent = text("animationsSub");
    els["user-appearance-compact-title"].textContent = text("compactMode");
    els["user-appearance-compact-sub"].textContent = text("compactModeSub");
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
    els["user-faq-title"].textContent = text("faqTitle");
    els["user-faq-sub"].textContent = text("faqSub");
    els["user-faq-q1"].textContent = text("faqQ1");
    els["user-faq-a1"].textContent = text("faqA1");
    els["user-faq-q2"].textContent = text("faqQ2");
    els["user-faq-a2"].textContent = text("faqA2");
    els["user-faq-q3"].textContent = text("faqQ3");
    els["user-faq-a3"].textContent = text("faqA3");
    els["user-faq-q4"].textContent = text("faqQ4");
    els["user-faq-a4"].textContent = text("faqA4");
    els["user-faq-q5"].textContent = text("faqQ5");
    els["user-faq-a5"].textContent = text("faqA5");
    els["user-faq-q6"].textContent = text("faqQ6");
    els["user-faq-a6"].textContent = text("faqA6");
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
    updateAppearanceControls();

    if (state.dashboard && state.dashboard.selectedGroup) {
      if (state.supportOpen) updateReportContext();
      else if (!state.appearanceOpen) renderSelectedDashboard(state.dashboard, true);
    }

    if (state.appearanceOpen) {
      els.title.textContent = text("appearance");
      els.identity.textContent = userGreeting();
    }
  }

  function openLanguageMenu() {
    var open = els["user-language-menu"].hidden;
    els["user-language-menu"].hidden = !open;
    els["user-language-button"].setAttribute("aria-expanded", String(open));
  }

  function closeLanguageMenu(returnFocus) {
    els["user-language-menu"].hidden = true;
    els["user-language-button"].setAttribute("aria-expanded", "false");
    if (returnFocus) els["user-language-button"].focus({ preventScroll: true });
  }

  function focusLanguageOption(direction) {
    var options = Array.from(document.querySelectorAll(".language-option"));
    if (!options.length || els["user-language-menu"].hidden) return;

    var current = options.indexOf(document.activeElement);
    var next = direction === "first"
      ? 0
      : direction === "last"
        ? options.length - 1
        : current < 0
          ? 0
          : (current + direction + options.length) % options.length;

    options[next].focus({ preventScroll: true });
  }

  function showVerification(shouldFocus) {
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    state.appearanceOpen = false;
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

    if (shouldFocus) {
      window.requestAnimationFrame(function () {
        if (!els["user-id-input"].hidden) els["user-id-input"].focus({ preventScroll: true });
      });
    }
  }

  function showNoGroup() {
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    state.toolsOpen = false;
    state.appearanceOpen = false;
    hideAllPrimaryScreens();
    els["user-no-group-screen"].hidden = false;
    els.title.textContent = text("noGroup");
    els.identity.textContent = state.verifiedUserId ? "ID " + state.verifiedUserId : text("startup");
    els["user-tabbar"].hidden = true;
    setDashboardControls(false);
    updateBackButton();

    window.requestAnimationFrame(function () {
      if (!els["user-no-group-screen"].hidden) els["user-no-group-back"].focus({ preventScroll: true });
    });
  }

  function showDashboardError(error, groupId) {
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    state.toolsOpen = false;
    state.appearanceOpen = false;
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

    window.requestAnimationFrame(function () {
      if (!els["user-dashboard-error-screen"].hidden) els["user-dashboard-error-retry"].focus({ preventScroll: true });
    });
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
    els["user-report-form"].setAttribute("aria-busy", "true");
    setButton(els["user-report-submit"], "loading", text("reportSending") + "…");
    try {
      await apiUserReport(category, message, state.selectedGroupId);
      els["user-report-message"].value = "";
      updateReportCharacterCount();
      showNotice(text("reportSent"), "ok");
    } catch (error) {
      showNotice(error && error.message ? error.message : text("reportFailed"), "error");
    } finally {
      els["user-report-form"].setAttribute("aria-busy", "false");
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

  async function apiUserConnectGroups() {
    if (!initData) throw new Error("Telegram session data is missing.");
    return fetchJson(
      "/api/user/connect/groups",
      {
        method: "GET",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json"
        }
      },
      "Connect Groups API"
    );
  }

  async function apiUserConnect(sourceGroupId, targetGroupId) {
    if (!initData) throw new Error("Telegram session data is missing.");
    return fetchJson(
      "/api/user/connect",
      {
        method: "POST",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceGroupId: Number(sourceGroupId),
          targetGroupId: Number(targetGroupId)
        })
      },
      "Group Connect"
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

    if (languageOnly && (state.aboutOpen || state.supportOpen || state.appearanceOpen)) return;

    els["user-group-options"].hidden = true;
    els["user-selected-dashboard"].hidden = false;
    els["user-dashboard"].hidden = false;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
    els["user-tools-page"].hidden = true;
    els["user-appearance-page"].hidden = true;
    els["user-tabbar"].hidden = false;

    els.title.textContent = text("title");
    els.identity.textContent = userGreeting();
    els["user-dashboard-sub"].textContent = text("dashboardEyebrow");
    els["user-selected-group-title"].querySelector(".group-dashboard-name").textContent =
      group.title || String(group.id);
    els["user-selected-group-title"].querySelector(".group-dashboard-suffix").textContent =
      text("title");
    updateMetrics(group);

    els["user-settings-limits-card"].innerHTML =
      renderSettingCard("duration", data.activityLimits || DEFAULTS.duration, group.id);
    els["user-settings-counts-card"].innerHTML =
      renderSettingCard("count", data.countLimits || DEFAULTS.count, group.id);

    bindSettingEditors();

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === "dashboard";
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
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
      els["user-appearance-page"].hidden = true;
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
    if (state.aboutOpen || state.supportOpen || state.toolsOpen || state.appearanceOpen) return true;

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

      if (requestId !== state.requestId || state.aboutOpen || state.supportOpen || state.toolsOpen) return false;
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

  function getConnectGroupById(groupId) {
    var numericId = Number(groupId);
    return (state.connectGroups || []).find(function (group) {
      return Number(group.id) === numericId;
    }) || null;
  }

  function populateConnectSelect(select, groups, preferredId) {
    if (!select) return;
    var current = String(preferredId || "");
    var safeGroups = Array.isArray(groups) ? groups : [];
    var placeholder = safeGroups.length ? text("connectSelect") : text("connectNoGroups");
    select.innerHTML =
      '<option value="">' + escapeHtml(placeholder) + '</option>' +
      safeGroups.map(function (group) {
        return '<option value="' + escapeHtml(String(group.id)) + '">' +
          escapeHtml(group.title || String(group.id)) +
          '</option>';
      }).join("");
    var preferred = safeGroups.find(function (group) {
      return String(group.id) === current;
    });
    select.value = preferred ? current : "";
    select.disabled = safeGroups.length === 0;
  }

  function updateConnectStatus() {
    if (!els["user-connect-status-value"] || !els["user-connect-status-meta"]) return;

    var sourceValue = String(els["user-connect-source"] && els["user-connect-source"].value || "");
    var targetValue = String(els["user-connect-target"] && els["user-connect-target"].value || "");
    var sourceGroup = getConnectGroupById(sourceValue);
    var targetGroup = getConnectGroupById(targetValue);
    var connection = state.connectConnections && state.connectConnections[sourceValue];
    var sameGroup = Boolean(sourceValue && targetValue && sourceValue === targetValue);
    var statusIcon = els["user-connect-status-value"].closest(".connection-current-copy")
      ? els["user-connect-status-value"].closest(".connection-current-copy").previousElementSibling
      : null;

    els["user-connect-status-value"].classList.remove("is-connected", "is-ready", "is-invalid");
    if (statusIcon) statusIcon.classList.remove("is-connected", "is-ready", "is-invalid");

    if (state.connectEditMode) {
      if (sameGroup) {
        els["user-connect-status-value"].textContent = text("connectSame");
        els["user-connect-status-meta"].textContent = "";
        els["user-connect-status-value"].classList.add("is-invalid");
        if (statusIcon) statusIcon.classList.add("is-invalid");
        return;
      }

      if (!sourceValue || !targetValue) {
        els["user-connect-status-value"].textContent = text("connectSelect");
        els["user-connect-status-meta"].textContent = text("connectSub");
        return;
      }

      els["user-connect-status-value"].textContent = text("connectReady");
      els["user-connect-status-meta"].textContent =
        (sourceGroup ? sourceGroup.title : sourceValue) +
        " → " +
        (targetGroup ? targetGroup.title : targetValue);
      els["user-connect-status-value"].classList.add("is-ready");
      if (statusIcon) statusIcon.classList.add("is-ready");
      return;
    }

    if (!connection) {
      els["user-connect-status-value"].textContent = text("connectNone");
      els["user-connect-status-meta"].textContent = "—";
      return;
    }

    els["user-connect-status-value"].innerHTML =
      '<span class="connection-status-dot" aria-hidden="true"></span>' +
      '<strong>' + escapeHtml(text("connectConnected")) + '</strong> · ' +
      escapeHtml(connection.targetGroupName || String(connection.targetChatId));
    els["user-connect-status-value"].classList.add("is-connected");
    if (statusIcon) statusIcon.classList.add("is-connected");

    var connectedAt = connection.connectedAt ? new Date(connection.connectedAt) : null;
    els["user-connect-status-meta"].textContent =
      connectedAt && Number.isFinite(connectedAt.getTime())
        ? connectedAt.toLocaleString()
        : "—";
  }

  function updateConnectControls() {
    if (!els["user-connect-source"] || !els["user-connect-target"] || !els["user-connect-submit"] || !els["user-connect-change"]) return;

    var sourceValue = els["user-connect-source"].value;
    var targetValue = els["user-connect-target"].value;
    var connection = state.connectConnections && state.connectConnections[String(sourceValue)];
    var sameGroup = Boolean(sourceValue && targetValue && sourceValue === targetValue);

    var canSubmit = Boolean(
      state.connectEditMode &&
      sourceValue &&
      targetValue &&
      !sameGroup &&
      !state.connectLoading &&
      !state.connectSaving
    );

    var hasEditableConnection = Boolean(connection || state.connectEditSnapshot);

    els["user-connect-submit"].disabled = !canSubmit;
    els["user-connect-submit"].setAttribute("aria-disabled", String(!canSubmit));
    els["user-connect-submit"].classList.toggle("is-ready", canSubmit);
    els["user-connect-source"].setAttribute("aria-invalid", String(sameGroup));
    els["user-connect-target"].setAttribute("aria-invalid", String(sameGroup));

    var locked = Boolean(connection && !state.connectEditMode);
    els["user-connect-source"].disabled = locked || state.connectLoading || state.connectSaving;
    els["user-connect-target"].disabled = locked || state.connectLoading || state.connectSaving;

    els["user-connect-change"].hidden = !hasEditableConnection;
    els["user-connect-change"].disabled = !hasEditableConnection || state.connectLoading || state.connectSaving;

    var changeLabel = els["user-connect-change"].querySelector(".button-label");
    if (changeLabel) {
      changeLabel.textContent = state.connectEditMode ? text("cancel") : text("connectChange");
    }

    updateConnectStatus();
  }

  function applyExistingConnectionState() {
    var connection = getSourceConnection();

    if (connection && !state.connectEditMode) {
      var targetId = String(connection.targetChatId);
      var targetExists = (state.connectGroups || []).some(function (group) {
        return String(group.id) === targetId;
      });
      if (targetExists) {
        els["user-connect-target"].value = targetId;
        writeStorage(STORAGE_KEYS.connectTargetGroup, targetId);
      }
    }

    updateConnectControls();
  }

  async function loadConnectGroups() {
    if (!state.toolsOpen || state.connectLoading) return;

    state.connectLoading = true;
    state.connectEditMode = false;
    state.connectEditSnapshot = null;
    els["user-connect-submit"].disabled = true;
    els["user-connect-change"].disabled = true;
    els["user-connect-source"].setAttribute("aria-busy", "true");
    els["user-connect-target"].setAttribute("aria-busy", "true");

    try {
      var data = await apiUserConnectGroups();
      if (!state.toolsOpen) return;

      var groups = Array.isArray(data.groups) ? data.groups : [];
      state.connectGroups = groups;
      state.connectConnections =
        data.connections && typeof data.connections === "object"
          ? data.connections
          : {};

      var savedSource = readStorage(STORAGE_KEYS.connectSourceGroup);
      var savedTarget = readStorage(STORAGE_KEYS.connectTargetGroup);
      var validSavedSource = Boolean(savedSource && groups.some(function (group) {
        return String(group.id) === savedSource;
      }));
      var validSavedTarget = Boolean(savedTarget && groups.some(function (group) {
        return String(group.id) === savedTarget;
      }));

      var defaultSource =
        state.selectedGroupId &&
        groups.some(function (group) { return Number(group.id) === Number(state.selectedGroupId); })
          ? String(state.selectedGroupId)
          : validSavedSource
            ? savedSource
            : groups.length
              ? String(groups[0].id)
              : "";

      var sourceConnection = defaultSource
        ? state.connectConnections[String(defaultSource)]
        : null;
      var connectedTarget = sourceConnection ? String(sourceConnection.targetChatId) : "";
      var fallbackTarget = groups.find(function (group) {
        return String(group.id) !== String(defaultSource);
      });

      var defaultTarget =
        connectedTarget && groups.some(function (group) { return String(group.id) === connectedTarget; })
          ? connectedTarget
          : validSavedTarget && savedTarget !== defaultSource
            ? savedTarget
            : fallbackTarget
              ? String(fallbackTarget.id)
              : "";

      state.connectEditMode = !Boolean(sourceConnection);

      els["user-connect-source"].innerHTML =
        '<option value="">' + escapeHtml(groups.length ? text("connectSelect") : text("connectNoGroups")) + '</option>' +
        groups.map(function (group) {
          return '<option value="' + escapeHtml(String(group.id)) + '">' +
            escapeHtml(group.title || String(group.id)) +
            '</option>';
        }).join("");

      els["user-connect-target"].innerHTML =
        '<option value="">' + escapeHtml(groups.length ? text("connectSelect") : text("connectNoGroups")) + '</option>' +
        groups.map(function (group) {
          return '<option value="' + escapeHtml(String(group.id)) + '">' +
            escapeHtml(group.title || String(group.id)) +
            '</option>';
        }).join("");

      els["user-connect-source"].value = defaultSource;
      els["user-connect-target"].value = defaultTarget;

      writeStorage(STORAGE_KEYS.connectSourceGroup, defaultSource || "");
      writeStorage(STORAGE_KEYS.connectTargetGroup, defaultTarget || "");
      applyExistingConnectionState();
    } catch (error) {
      if (!state.toolsOpen) return;
      showNotice(
        error && error.message ? error.message : text("connectLoadFailed"),
        "error"
      );
    } finally {
      state.connectLoading = false;
      els["user-connect-source"].removeAttribute("aria-busy");
      els["user-connect-target"].removeAttribute("aria-busy");
      applyExistingConnectionState();
    }
  }

  function beginConnectEdit() {
    if (state.connectSaving || state.connectLoading) return;

    var connection = getSourceConnection();
    if (!connection) return;

    state.connectEditSnapshot = {
      sourceId: String(els["user-connect-source"].value || ""),
      targetId: String(els["user-connect-target"].value || "")
    };
    state.connectEditMode = true;

    els["user-connect-source"].disabled = false;
    els["user-connect-target"].disabled = false;

    updateConnectControls();
    window.requestAnimationFrame(function () {
      if (!els["user-connect-source"].disabled) {
        els["user-connect-source"].focus({ preventScroll: true });
      }
    });
  }

  function cancelConnectEdit() {
    if (state.connectSaving || state.connectLoading || !state.connectEditSnapshot) return;

    var snapshot = state.connectEditSnapshot;
    state.connectEditSnapshot = null;
    state.connectEditMode = false;

    els["user-connect-source"].value = snapshot.sourceId;
    els["user-connect-target"].value = snapshot.targetId;
    writeStorage(STORAGE_KEYS.connectSourceGroup, snapshot.sourceId);
    writeStorage(STORAGE_KEYS.connectTargetGroup, snapshot.targetId);

    updateConnectControls();
    showNotice(text("connectConnected"), "ok");
  }

  async function submitGroupConnection() {
    if (state.connectSaving || state.connectLoading) return;

    var sourceId = Number(els["user-connect-source"].value);
    var targetId = Number(els["user-connect-target"].value);

    if (!Number.isSafeInteger(sourceId) || sourceId >= 0 || !Number.isSafeInteger(targetId) || targetId >= 0) return;

    if (sourceId === targetId) {
      showNotice(text("connectSame"), "error");
      return;
    }

    state.connectSaving = true;
    setButton(els["user-connect-submit"], "loading", text("connectConnecting"));
    els["user-connect-source"].disabled = true;
    els["user-connect-target"].disabled = true;
    els["user-connect-change"].disabled = true;

    try {
      var result = await apiUserConnect(sourceId, targetId);
      var connection = result && result.connection;
      if (!connection) throw new Error(text("connectFailed"));

      state.connectConnections = state.connectConnections || {};
      state.connectConnections[String(sourceId)] = connection;
      state.connectEditMode = false;
      state.connectEditSnapshot = null;

      writeStorage(STORAGE_KEYS.connectSourceGroup, String(sourceId));
      writeStorage(STORAGE_KEYS.connectTargetGroup, String(targetId));
      els["user-connect-source"].value = String(sourceId);
      els["user-connect-target"].value = String(targetId);

      showNotice(text("connectSuccess"), "ok");
    } catch (error) {
      showNotice(
        error && error.message ? error.message : text("connectFailed"),
        "error"
      );
    } finally {
      state.connectSaving = false;
      setButton(els["user-connect-submit"], "idle", text("connectButton"));
      applyExistingConnectionState();
    }
  }

  function setDashboardTab(tab) {
    if (!state.dashboard || !els["user-tabbar"] || els["user-tabbar"].hidden) return;
    if (state.groupPickerOpen) return;

    tab = tab === "about" || tab === "support" || tab === "tools" || tab === "appearance" ? tab : "dashboard";
    state.aboutOpen = tab === "about";
    state.supportOpen = tab === "support";
    state.toolsOpen = tab === "tools";
    state.appearanceOpen = tab === "appearance";
    saveDashboardState({ tab: tab });

    ++state.requestId;

    if (state.aboutOpen) {
      els["user-selected-dashboard"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-tools-page"].hidden = true;
      els["user-appearance-page"].hidden = true;
      els["user-about-page"].hidden = false;
      els.title.textContent = text("about");
      els.identity.textContent = userGreeting();
      setDashboardControls(false);
    } else if (state.supportOpen) {
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = true;
      els["user-tools-page"].hidden = true;
      els["user-appearance-page"].hidden = true;
      els["user-support-page"].hidden = false;
      els.title.textContent = text("helpSupport");
      els.identity.textContent = userGreeting();
      updateReportContext();
      setDashboardControls(false);
    } else if (state.toolsOpen) {
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-appearance-page"].hidden = true;
      els["user-tools-page"].hidden = false;
      els.title.textContent = text("tools");
      els.identity.textContent = userGreeting();
      setDashboardControls(false);
      updateConnectStatus();
      void loadConnectGroups();
    } else if (state.appearanceOpen) {
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-tools-page"].hidden = true;
      els["user-appearance-page"].hidden = false;
      els.title.textContent = text("appearance");
      els.identity.textContent = userGreeting();
      setDashboardControls(false);
      updateAppearanceControls();
    } else {
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-tools-page"].hidden = true;
      els["user-appearance-page"].hidden = true;
      els["user-selected-dashboard"].hidden = false;
      els.title.textContent = text("title");
      els.identity.textContent = userGreeting();
      setDashboardControls(true);
      if (state.dashboard) renderSelectedDashboard(state.dashboard, true);
    }

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    updateBackButton();
  }

  async function openGroupPicker() {
    if (!state.dashboard || state.aboutOpen || state.supportOpen || state.toolsOpen || state.appearanceOpen || state.groupPickerOpen || state.settingsSaving || state.refreshInProgress) return;
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
    state.toolsOpen = false;
    state.appearanceOpen = false;
    ++state.requestId;
    els["user-group-options"].hidden = false;
    els["user-selected-dashboard"].hidden = true;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
    els["user-tools-page"].hidden = true;
    els["user-appearance-page"].hidden = true;
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
      (state.groupPickerOpen || state.aboutOpen || state.supportOpen || state.toolsOpen || state.appearanceOpen);
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
    if (state.aboutOpen || state.supportOpen || state.toolsOpen || state.appearanceOpen) setDashboardTab("dashboard");
  }

  function bindStaticEvents() {
    els["user-language-button"].onclick = openLanguageMenu;
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".language-button") && !event.target.closest(".language-menu")) {
        closeLanguageMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !els["user-language-menu"].hidden) {
        event.preventDefault();
        closeLanguageMenu(true);
        return;
      }

      if (els["user-language-menu"].hidden) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusLanguageOption(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusLanguageOption(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusLanguageOption("first");
      } else if (event.key === "End") {
        event.preventDefault();
        focusLanguageOption("last");
      }
    });

    document.querySelectorAll(".language-option").forEach(function (option) {
      option.onclick = function () {
        var selected = option.getAttribute("data-user-lang");
        if (!TEXT[selected]) return;
        state.language = selected;
        writeStorage(STORAGE_KEYS.language, selected);
        closeLanguageMenu(true);
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

    if (els["user-connect-source"] && els["user-connect-target"]) {
      els["user-connect-source"].onchange = function () {
        writeStorage(STORAGE_KEYS.connectSourceGroup, els["user-connect-source"].value);

        var connection = state.connectConnections[String(els["user-connect-source"].value)];
        if (connection && state.connectEditMode) {
          var targetId = String(connection.targetChatId);
          if ((state.connectGroups || []).some(function (group) {
            return String(group.id) === targetId;
          })) {
            els["user-connect-target"].value = targetId;
            writeStorage(STORAGE_KEYS.connectTargetGroup, targetId);
          }
        }

        updateConnectStatus();
        updateConnectControls();
      };

      els["user-connect-target"].onchange = function () {
        writeStorage(STORAGE_KEYS.connectTargetGroup, els["user-connect-target"].value);
        updateConnectControls();
      };

      els["user-connect-submit"].onclick = submitGroupConnection;
      els["user-connect-change"].onclick = function () {
        if (state.connectEditMode) cancelConnectEdit();
        else beginConnectEdit();
      };
    }

    document.querySelectorAll('input[name="appearance-theme"]').forEach(function (input) {
      input.onchange = function () {
        setAppearanceTheme(input.value);
      };
    });

    document.querySelectorAll('input[name="appearance-wallpaper"]').forEach(function (input) {
      input.onchange = function () {
        setWallpaper(input.value);
      };
    });

    els["appearance-animations-toggle"].onclick = toggleAnimations;
    els["appearance-compact-toggle"].onclick = toggleCompactMode;

    els["user-no-group-back"].onclick = function () {
      state.verifiedUserId = null;
      state.selectedGroupId = null;
      removeStorage(STORAGE_KEYS.verifiedUser);
      showVerification(true);
    };

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

    var storedTheme = readStorage(STORAGE_KEYS.appearanceTheme);
    state.appearanceTheme =
      storedTheme === "midnight" || storedTheme === "amoled" ? storedTheme : "dark";

    var storedWallpaper = readStorage(STORAGE_KEYS.wallpaper);
    state.wallpaper =
      ["default","aurora","grid","nebula","ocean","violet"].indexOf(storedWallpaper) >= 0
        ? storedWallpaper
        : "default";

    var storedAnimations = readStorage(STORAGE_KEYS.animations);
    state.animationsEnabled = storedAnimations !== "0";

    var storedCompact = readStorage(STORAGE_KEYS.compactMode);
    state.compactMode = storedCompact === "1";

    applyAppearancePreferences();
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
