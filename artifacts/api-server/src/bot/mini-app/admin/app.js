(function () {
      var tg = window.Telegram && window.Telegram.WebApp;
      var splash = document.getElementById("splash");
      var splashStartedAt = Date.now();
      var splashHideTimer = null;
      var splashHidden = false;
      var identity = document.getElementById("identity");
      var title = document.getElementById("title");
      var app = document.getElementById("app");
      var notice = document.getElementById("notice");

      // Keep the first-launch Welcome screen readable while allowing dashboard data
      // to load in the background. The fade-out then hands off to the dashboard or
      // the existing loading/empty/error state without blocking the app indefinitely.
      var splashMinimumDuration = 3000;

      function hideSplash() {
        if (!splash || splashHidden) return;
        var elapsed = Date.now() - splashStartedAt;
        var remaining = Math.max(0, splashMinimumDuration - elapsed);
        window.clearTimeout(splashHideTimer);
        splashHideTimer = window.setTimeout(function () {
          if (splashHidden) return;
          splashHidden = true;
          splash.classList.add("hide");
        }, remaining);
      }

      // Fail-safe: a startup exception must never leave the Welcome screen blocking
      // the Mini App forever. Normal startup still uses the 3-second readable splash.
      window.setTimeout(function () {
        if (!splash || splashHidden) return;
        splashHidden = true;
        window.clearTimeout(splashHideTimer);
        splash.classList.add("hide");
      }, 5500);

      function handleStartupFailure(error) {
        var message = error && error.message ? error.message : "Unable to start the Mini App.";
        if (identity) identity.textContent = "Startup error. Please reopen the Mini App.";
        if (title) title.textContent = "Unable to open";
        if (notice) {
          notice.textContent = message;
          notice.className = "notice error visible";
        }
        if (splash && !splashHidden) {
          splashHidden = true;
          window.clearTimeout(splashHideTimer);
          splash.classList.add("hide");
        }
      }

      window.addEventListener("error", function (event) {
        handleStartupFailure(event && event.error ? event.error : new Error("Mini App startup error."));
      });

      window.addEventListener("unhandledrejection", function (event) {
        handleStartupFailure(event && event.reason ? event.reason : new Error("Mini App startup error."));
      });

      if (!tg || !tg.initData) {
        identity.textContent = "Open this page inside Telegram.";
        hideSplash();
        return;
      }

      tg.ready();
      if (typeof tg.expand === "function") tg.expand();

      var initData = tg.initData;
      var startParam =
        (tg.initDataUnsafe && tg.initDataUnsafe.start_param) ||
        new URLSearchParams(window.location.search).get("tgWebAppStartParam") ||
        "";
      var groupMode = /^group_-\d+$/.test(startParam);
      var userPageMode = window.__z28MiniAppMode === "user" || window.location.pathname === "/user";
      var userMode = false;
      var adminMode = false;
      var adminVerificationMode = false;
      var adminSessionToken = "";
      var apiBase = groupMode ? "/api/group-admin" : "/api/admin";
      var telegramUserId =
        tg.initDataUnsafe && tg.initDataUnsafe.user
          ? tg.initDataUnsafe.user.id
          : undefined;
      var userLoading = document.getElementById("user-loading");
      var userVerifiedKey = "z28_verified_user_id";
      var adminVerifiedKey = "z28_verified_admin_id";
      var userLanguageKey = "z28_user_language";
      var userLanguage = "en";
      var userDashboardRequestId = 0;
      var userDashboardData = null;
      var userDashboardStateKey = "z28_user_dashboard_state";

      function getUserDashboardStateKey() {
        return userDashboardStateKey + "_" + String(telegramUserId || "");
      }

      function getUserDashboardState() {
        try {
          var raw = localStorage.getItem(getUserDashboardStateKey());
          if (!raw) return null;
          var state = JSON.parse(raw);
          if (!state || typeof state !== "object") return null;
          var groupId = Number(state.groupId);
          var tab = state.tab === "about" ? "about" : "dashboard";
          return Number.isSafeInteger(groupId) && groupId < 0
            ? { groupId: groupId, tab: tab }
            : { groupId: null, tab: tab };
        } catch (error) {
          return null;
        }
      }

      function saveUserDashboardState(patch) {
        if (!telegramUserId) return;
        try {
          var current = getUserDashboardState() || { groupId: null, tab: "dashboard" };
          var next = {
            groupId: patch && patch.groupId !== undefined ? patch.groupId : current.groupId,
            tab: patch && patch.tab ? patch.tab : current.tab
          };
          localStorage.setItem(getUserDashboardStateKey(), JSON.stringify(next));
        } catch (error) {}
      }
      window.__z28GroupSelectionOpen = false;
      window.__z28AboutOpen = false;

      function updateUserBackButton() {
        if (!tg || !tg.BackButton) return;
        var shouldShow =
          userMode &&
          document.body.classList.contains("user-dashboard-page") &&
          (
            window.__z28AboutOpen ||
            (window.__z28GroupSelectionOpen && userDashboardData && userDashboardData.selectedGroup)
          );
        if (shouldShow) {
          tg.BackButton.show();
        } else {
          tg.BackButton.hide();
        }
      }

      function handleUserBackButton() {
        if (!userMode || !document.body.classList.contains("user-dashboard-page")) return;
        if (window.__z28GroupSelectionOpen && userDashboardData && userDashboardData.selectedGroup) {
          window.__z28GroupSelectionOpen = false;
          window.__z28AboutOpen = false;
          renderSelectedDashboard(userDashboardData);
          return;
        }
        if (window.__z28AboutOpen) {
          setUserDashboardTab("dashboard");
        }
      }

      if (tg && tg.BackButton && typeof tg.BackButton.onClick === "function") {
        tg.BackButton.onClick(handleUserBackButton);
        tg.BackButton.hide();
      }

      var userUiText = {
        en: {
          title: "User Dashboard",
          hello: "Hello",
          verifyTitle: "Verify Your Telegram ID",
          verifySubtitle: "User Access",
          verifyLead: "Enter your Telegram user ID to open your group dashboard.",
          idLabel: "Telegram User ID",
          idPlaceholder: "Enter your Telegram ID",
          idHint: "Your ID must match the Telegram account currently opening this Mini App.",
          adminVerifyTitle: "Admin Access Verification",
          adminVerifySubtitle: "Bot Owner / Administrator",
          adminVerifyLead: "Enter your Bot Owner or admin_ids ID.",
          adminIdLabel: "Bot Owner or admin_ids ID",
          adminIdPlaceholder: "Enter your Bot Owner or admin_ids ID.",
          adminIdHint: "The entered ID must match the Telegram account currently opening this Mini App.",
          confirm: "Confirm",
          confirmed: "Confirmed",
          settings: "Admin Settings",
          groupOptions: "Group Options",
          groupOptionsSub: "Select a group to open its dashboard.",
          dashboardSub: "Live activity overview",
          groupActivities: "Group Activities",
          groupMember: "Group member",
          memberActive: "Member active",
          saveLimits: "Save Limits",
          saveCountLimits: "Save Count Limits",
          edit: "Edit",
          cancel: "Cancel",
          unsavedChanges: "Unsaved changes",
          unsavedSwitchWarning: "Save or cancel your unsaved changes before switching groups.",
          unsavedRefreshWarning: "Save or cancel your unsaved changes before refreshing.",
          unsavedLanguageWarning: "Save or cancel your unsaved changes before changing language.",
          changesToSave: "Changes to save",
          savePartialFailure: "Some changes were saved, but one or more settings could not be saved. Review the unsaved values and try again.",
          saveFailed: "Nothing was saved. Your changes are still here; please try again.",
          invalidSettingValue: "Enter a positive whole number.",
          saving: "Saving…",
          saved: "Saved",
          activityLimits: "Activity Limits",
          durationControl: "Duration Control",
          dailyCountLimits: "Daily Count Limits",
          dailyUsageControl: "Daily Usage Control",
          activityEat: "Eat",
          activityWc: "WC",
          activitySmoke: "Smoke",
          activityWcd: "WCD",
          switch: "Switch",
          dashboardTab: "Dashboard",
          about: "About",
          aboutSub: "App information and credits",
          botName: "Bot",
          botVersion: "Bot Version",
          miniAppVersion: "Mini App Version",
          terms: "Terms of Use",
          termsCopy: "Use this Mini App only for the attendance and group-management functions provided by the bot. Keep your Telegram account secure and use the service according to your group rules.",
          privacy: "Privacy",
          privacyCopy: "The Mini App uses Telegram WebApp account information to verify access and show the groups available to you. Information shown in this dashboard is used only for the bot features provided to your account and groups.",
          credits: "Credits",
          creator: "Creator",
          noGroup: "No eligible group found",
          noGroupLead: "Add this bot to a group, then make sure your Telegram account is a group owner or administrator.",
          noGroupTail: "Groups where the bot is no longer available are not shown.",
          noGroupMessage: "Add this bot to a group, then make sure your Telegram account is a group owner or administrator. Groups where the bot is no longer available are not shown.",
          idMismatch: "The entered ID does not match your Telegram account.",
          dashboardLoadError: "暂时无法加载您的控制面板。",
          dashboardLoadErrorLead: "加载控制面板时出现问题。您已保存的设置没有被更改。",
          retry: "再试一次",
          dashboardLoadError: "Unable to load your dashboard right now.",
          dashboardLoadErrorLead: "Something went wrong while loading your dashboard. Your saved settings were not changed.",
          retry: "Try Again",
        },
        my: {
          title: "User Dashboard",
          hello: "မင်္ဂလာပါ",
          verifyTitle: "Telegram ID အတည်ပြုရန်",
          verifySubtitle: "User Access",
          verifyLead: "သင့် Group Dashboard ကိုဖွင့်ရန် Telegram User ID ကိုထည့်ပါ။",
          idLabel: "Telegram User ID",
          idPlaceholder: "Telegram ID ထည့်ပါ",
          idHint: "ထည့်ထားသော ID သည် ယခု Mini App ဖွင့်ထားသော Telegram account နှင့် ကိုက်ညီရမည်။",
          adminVerifyTitle: "Admin Access Verification",
          adminVerifySubtitle: "Bot Owner / Administrator",
          adminVerifyLead: "Bot owner or admin_ids ID ထည့်ပါ",
          adminIdLabel: "Bot owner or admin_ids ID",
          adminIdPlaceholder: "Bot owner or admin_ids ID ထည့်ပါ",
          adminIdHint: "ထည့်ထားသော ID သည် ယခု Mini App ဖွင့်ထားသော Telegram account နှင့် ကိုက်ညီရမည်။",
          confirm: "အတည်ပြုမည်",
          confirmed: "အတည်ပြုပြီး",
          settings: "Admin Settings",
          groupOptions: "Group Options",
          groupOptionsSub: "Dashboard ဖွင့်ရန် Group တစ်ခုကိုရွေးပါ။",
          dashboardSub: "Live activity overview",
          groupActivities: "Group Activities",
          groupMember: "Group member",
          memberActive: "Member active",
          saveLimits: "Limits သိမ်းမည်",
          saveCountLimits: "Count Limits သိမ်းမည်",
          edit: "ပြင်မည်",
          cancel: "မလုပ်တော့ပါ",
          unsavedChanges: "မသိမ်းရသေးသော ပြင်ဆင်ချက်များ",
          unsavedSwitchWarning: "Group ပြောင်းမီ မသိမ်းရသေးသော ပြင်ဆင်ချက်များကို Save သို့မဟုတ် Cancel လုပ်ပါ။",
          unsavedRefreshWarning: "Refresh မလုပ်မီ မသိမ်းရသေးသော ပြင်ဆင်ချက်များကို Save သို့မဟုတ် Cancel လုပ်ပါ။",
          unsavedLanguageWarning: "Language ပြောင်းမီ မသိမ်းရသေးသော ပြင်ဆင်ချက်များကို Save သို့မဟုတ် Cancel လုပ်ပါ။",
          changesToSave: "သိမ်းဆည်းမည့် ပြင်ဆင်ချက်များ",
          savePartialFailure: "ပြင်ဆင်ချက်အချို့ သိမ်းပြီးဖြစ်သော်လည်း setting တစ်ခု သို့မဟုတ် တစ်ခုထက်ပို၍ မသိမ်းနိုင်ပါ။ မသိမ်းရသေးသော တန်ဖိုးများကို စစ်ပြီး ထပ်ကြိုးစားပါ။",
          saveFailed: "ဘာ setting မှ မသိမ်းရသေးပါ။ သင့်ပြင်ဆင်ချက်များကို ထိန်းသိမ်းထားပြီး ထပ်ကြိုးစားနိုင်ပါသည်။",
          invalidSettingValue: "အပေါင်းကိန်းပြည့်တစ်ခု ထည့်ပါ။",
          saving: "သိမ်းနေသည်…",
          saved: "သိမ်းပြီးပါပြီ",
          activityLimits: "Activity Limits",
          durationControl: "Duration Control",
          dailyCountLimits: "Daily Count Limits",
          dailyUsageControl: "Daily Usage Control",
          activityEat: "ထမင်းစား",
          activityWc: "အိမ်သာ",
          activitySmoke: "ဆေးလိပ်",
          activityWcd: "WCD",
          switch: "ပြောင်းမည်",
          dashboardTab: "Dashboard",
          about: "About",
          aboutSub: "App အချက်အလက်နှင့် Credits",
          botName: "Bot",
          botVersion: "Bot Version",
          miniAppVersion: "Mini App Version",
          terms: "အသုံးပြုမှုစည်းမျဉ်း",
          termsCopy: "ဤ Mini App ကို Bot မှပေးထားသော attendance နှင့် group management လုပ်ဆောင်ချက်များအတွက်သာ အသုံးပြုပါ။ သင့် Telegram account ကို လုံခြုံစွာထိန်းသိမ်းပြီး သင့် Group ၏ စည်းမျဉ်းများအတိုင်း ဝန်ဆောင်မှုကို အသုံးပြုပါ။",
          privacy: "Privacy",
          privacyCopy: "Mini App သည် access အတည်ပြုရန်နှင့် သင့်အတွက်ရရှိနိုင်သော Group များကို ပြသရန် Telegram WebApp account information ကို အသုံးပြုပါသည်။ Dashboard တွင်ပြသသောအချက်အလက်များကို သင့် account နှင့် Group များအတွက် Bot မှပေးသော feature များအတွက်သာ အသုံးပြုပါသည်။",
          credits: "Credits",
          creator: "ဖန်တီးသူ",
          noGroup: "သင့်အတွက် အသုံးပြုနိုင်သော Group မရှိပါ",
          noGroupLead: "Bot ကို Group တစ်ခုထဲသို့ ထည့်ပြီး သင့် Telegram account ကို Group owner သို့မဟုတ် administrator ဖြစ်ကြောင်း သေချာပါစေ။",
          noGroupTail: "Bot မရှိတော့သော Group များကို မပြပါ။",
          noGroupMessage: "Bot ကို Group တစ်ခုထဲသို့ ထည့်ပြီး သင့် Telegram account ကို Group owner သို့မဟုတ် administrator ဖြစ်ကြောင်း သေချာပါစေ။ Bot မရှိတော့သော Group များကို မပြပါ။",
          idMismatch: "ထည့်ထားသော ID သည် သင့် Telegram account နှင့် မကိုက်ညီပါ။",
          dashboardLoadError: "Dashboard ကို ယခုဖွင့်၍ မရသေးပါ။",
          dashboardLoadErrorLead: "Dashboard ကိုဖွင့်နေစဉ် ပြဿနာတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။ သင့်သိမ်းထားပြီးသော setting များကို မပြောင်းလဲထားပါ။",
          retry: "ထပ်ကြိုးစားမည်"
        },
        zh: {
          title: "用户仪表板",
          hello: "你好",
          verifyTitle: "验证您的 Telegram ID",
          verifySubtitle: "用户访问",
          verifyLead: "输入您的 Telegram 用户 ID 以打开群组仪表板。",
          idLabel: "Telegram 用户 ID",
          idPlaceholder: "请输入 Telegram ID",
          idHint: "输入的 ID 必须与当前打开此 Mini App 的 Telegram 账号一致。",
          adminVerifyTitle: "管理员访问验证",
          adminVerifySubtitle: "Bot Owner / Administrator",
          adminVerifyLead: "管理员 Bot owner / admin_ids ID",
          adminIdLabel: "Bot Owner / admin_ids ID",
          adminIdPlaceholder: "请输入 Bot Owner / admin_ids ID",
          adminIdHint: "输入的 ID 必须与当前打开此 Mini App 的 Telegram 账号一致。",
          confirm: "确认",
          confirmed: "已确认",
          settings: "管理设置",
          groupOptions: "群组选择",
          groupOptionsSub: "选择一个群组以打开其仪表板。",
          dashboardSub: "实时活动概览",
          groupActivities: "群组活动",
          groupMember: "群组成员",
          memberActive: "活跃成员",
          saveLimits: "保存时间限制",
          saveCountLimits: "保存次数限制",
          edit: "编辑",
          cancel: "取消",
          unsavedChanges: "未保存的更改",
          unsavedSwitchWarning: "切换群组前，请先保存或取消未保存的更改。",
          unsavedRefreshWarning: "刷新前，请先保存或取消未保存的更改。",
          unsavedLanguageWarning: "更改语言前，请先保存或取消未保存的更改。",
          changesToSave: "待保存的更改",
          savePartialFailure: "部分更改已保存，但一个或多个设置无法保存。请检查未保存的数值后重试。",
          saveFailed: "没有任何设置被保存。您的更改仍然保留，请重试。",
          invalidSettingValue: "请输入正整数。",
          saving: "保存中…",
          saved: "已保存",
          activityLimits: "活动时间限制",
          durationControl: "时长控制",
          dailyCountLimits: "每日次数限制",
          dailyUsageControl: "每日使用控制",
          activityEat: "吃饭",
          activityWc: "上厕所",
          activitySmoke: "抽烟",
          activityWcd: "大号",
          switch: "切换",
          dashboardTab: "仪表板",
          about: "关于",
          aboutSub: "应用信息与创作者",
          botName: "机器人",
          botVersion: "机器人版本",
          miniAppVersion: "Mini App 版本",
          terms: "使用条款",
          termsCopy: "此 Mini App 仅用于机器人提供的打卡和群组管理功能。请妥善保护您的 Telegram 账号，并遵守您所在群组的使用规则。",
          privacy: "隐私",
          privacyCopy: "Mini App 使用 Telegram WebApp 账号信息验证访问权限，并显示您可以使用的群组。Dashboard 中显示的信息仅用于机器人向您的账号和群组提供的功能。",
          credits: "鸣谢",
          creator: "创作者",
          noGroup: "没有找到可用的群组",
          noGroupLead: "请将 Bot 添加到群组，并确保您的 Telegram 账号是群主或管理员。",
          noGroupTail: "Bot 已不在的群组不会显示。",
          noGroupMessage: "请将 Bot 添加到群组，并确保您的 Telegram 账号是群主或管理员。Bot 已不在的群组不会显示。",
          idMismatch: "输入的 ID 与您的 Telegram 账号不匹配。"
        }
      };

      function loadUserLanguage() {
        try {
          var saved = localStorage.getItem(userLanguageKey);
          if (saved === "en" || saved === "my" || saved === "zh") userLanguage = saved;
        } catch {}
      }

      function tUser(key) {
        return userUiText[userLanguage][key] || userUiText.en[key] || key;
      }

      function getTelegramDisplayName() {
        var user = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
        if (!user) return "there";
        var parts = [user.first_name, user.last_name].filter(function (part) {
          return typeof part === "string" && part.trim();
        });
        if (parts.length) return parts.join(" ");
        return user.username ? "@" + user.username : "there";
      }

      function renderUserGreeting() {
        var greeting = document.getElementById("user-greeting");
        if (!greeting) return;
        greeting.textContent = tUser("hello") + ", " + getTelegramDisplayName();
      }

      function applyUserLanguage() {
        document.documentElement.lang = userLanguage === "my" ? "my" : userLanguage;
        document.getElementById("user-verify-title").textContent = tUser("verifyTitle");
        document.getElementById("user-verify-subtitle").textContent = tUser("verifySubtitle");
        document.getElementById("user-verify-lead").textContent = tUser("verifyLead");
        document.getElementById("user-id-label").textContent = tUser("idLabel");
        document.getElementById("user-id-input").placeholder = tUser("idPlaceholder");
        document.getElementById("user-id-hint").textContent = tUser("idHint");
        if (!document.getElementById("user-confirm").classList.contains("confirmed")) {
          document.getElementById("user-confirm").textContent = tUser("confirm");
        }
        document.getElementById("user-group-activities-title").textContent = tUser("groupActivities");
        document.getElementById("user-group-member-label").textContent = tUser("groupMember");
        document.getElementById("user-member-active-label").textContent = tUser("memberActive");
        document.querySelector("#user-group-options .user-page-title").textContent = tUser("groupOptions");
        document.querySelector("#user-group-options .user-page-sub").textContent = tUser("groupOptionsSub");
        document.getElementById("user-dashboard-sub").textContent = tUser("dashboardSub");
        document.getElementById("user-dashboard-tab-label").textContent = tUser("dashboardTab");
        document.getElementById("user-about-tab-label").textContent = tUser("about");
        document.getElementById("user-about-title").textContent = tUser("about");
        document.getElementById("user-about-sub").textContent = tUser("aboutSub");
        document.getElementById("user-about-bot-name-label").textContent = tUser("botName");
        document.getElementById("user-about-bot-version-label").textContent = tUser("botVersion");
        document.getElementById("user-about-mini-version-label").textContent = tUser("miniAppVersion");
        document.getElementById("user-about-terms-label").textContent = tUser("terms");
        document.getElementById("user-about-terms-copy").textContent = tUser("termsCopy");
        document.getElementById("user-about-privacy-label").textContent = tUser("privacy");
        document.getElementById("user-about-privacy-copy").textContent = tUser("privacyCopy");
        document.getElementById("user-about-credits-label").textContent = tUser("credits");
        document.getElementById("user-about-creator-label").textContent = tUser("creator");
        renderUserGreeting();
        document.getElementById("user-no-group-message").innerHTML =
          '<strong>' + escapeHtml(tUser("noGroup")) + '</strong>' +
          '<span>' + escapeHtml(tUser("noGroupLead")) + ' ' + escapeHtml(tUser("noGroupTail")) + '</span>';
        document.querySelectorAll(".user-language-option").forEach(function(option) {
          option.classList.toggle("active", option.getAttribute("data-user-lang") === userLanguage);
        });

        var dashboardShell = document.getElementById("user-dashboard-page-shell");
        if (
          userMode &&
          document.body.classList.contains("user-dashboard-page") &&
          dashboardShell &&
          !dashboardShell.hidden &&
          userDashboardData &&
          userDashboardData.selectedGroup
        ) {
          var cachedGroup = userDashboardData.selectedGroup;
          document.getElementById("user-selected-group-title").textContent =
            cachedGroup.title + " " + tUser("title");
          document.getElementById("user-group-activities-title").textContent = tUser("groupActivities");
          document.getElementById("user-group-member-label").textContent = tUser("groupMember");
          document.getElementById("user-member-active-label").textContent = tUser("memberActive");
          document.getElementById("switch-group-label").textContent = tUser("switch");
          document.getElementById("user-settings-limits-card").innerHTML =
            settingEditorMarkup("duration", userDashboardData.activityLimits || {}, cachedGroup.id);
          document.getElementById("user-settings-counts-card").innerHTML =
            settingEditorMarkup("count", userDashboardData.countLimits || {}, cachedGroup.id);
          bindUserSettingButtons();
        }
      }

      loadUserLanguage();

      function hasUserSettingUnsavedChanges() {
        var unsaved = false;
        document.querySelectorAll(".user-setting-editor input[data-original-value]").forEach(function(input) {
          if (input.value !== input.getAttribute("data-original-value")) unsaved = true;
        });
        return unsaved;
      }

      function isUserSettingsEditing() {
        if (hasUserSettingUnsavedChanges()) return true;
        var activeElement = document.activeElement;
        if (!activeElement || typeof activeElement.matches !== "function") return false;
        return activeElement.matches("#user-settings-limits-card input, #user-settings-counts-card input");
      }

      function setPanelVisibility(mode) {
        userMode = mode === "user";
        adminMode = mode === "admin";
        adminVerificationMode = mode === "admin-verify";
        document.body.classList.toggle("user-mode", userMode);
        document.body.classList.toggle("admin-mode", adminMode);

        document.querySelectorAll(".panel-only-group").forEach(function (element) {
          element.classList.toggle("visible", mode === "group");
        });
        document.querySelectorAll(".panel-only-private").forEach(function (element) {
          element.classList.toggle("visible", mode === "admin");
        });
        document.querySelectorAll(".panel-only-admin-verify").forEach(function (element) {
          element.classList.toggle("visible", mode === "admin-verify");
        });
        document.querySelectorAll(".panel-only-user").forEach(function (element) {
          element.classList.toggle("visible", mode === "user");
        });
      }

      // Non-group launches stay hidden until the server confirms whether this is an admin or regular-user session.
      setPanelVisibility(groupMode ? "group" : "pending");
      document.body.classList.toggle("user-verification-page", !groupMode);
      document.body.classList.remove("user-dashboard-page");
      title.textContent = groupMode ? "⚙️ Group Admin Panel" : "User Access";
      document.getElementById("limits-scope").textContent =
        groupMode ? "These settings use the same bot activity limits as the group commands." : "";

      function showNotice(message, kind) {
        notice.textContent = message;
        notice.className = "notice show " + kind;
        window.clearTimeout(showNotice.timer);
        showNotice.timer = window.setTimeout(function () {
          notice.className = "notice";
        }, 2800);
      }

      function setBusy(isBusy) {
        app.classList.toggle("loading", isBusy);
        app.querySelectorAll("button,input").forEach(function (element) {
          element.disabled = isBusy || (element.id === "count-eat");
        });
      }

      function setButtonState(button, state, label) {
        if (!button) return;
        var content = button.querySelector(".button-content");
        if (!content) return;

        button.classList.toggle("is-loading", state === "loading");
        button.disabled = state === "loading";

        if (state === "loading") {
          content.innerHTML = '<span class="button-spinner" aria-hidden="true"></span><span>' + escapeHtml(label || "Loading…") + '</span>';
        } else if (state === "success") {
          content.innerHTML = '<span>✓</span><span>' + escapeHtml(label || "Successfully") + '</span>';
        } else {
          content.innerHTML = '<span>' + escapeHtml(label || "Save") + '</span>';
        }
      }

      function showSuccessBadge(id) {
        var badge = document.getElementById(id);
        if (!badge) return;
        badge.hidden = false;
        window.clearTimeout(showSuccessBadge.timers[id]);
        showSuccessBadge.timers[id] = window.setTimeout(function () {
          badge.hidden = true;
        }, 2600);
      }
      showSuccessBadge.timers = {};

      async function runAction(button, loadingText, action, defaultText, successBadgeId) {
        setButtonState(button, "loading", loadingText);
        try {
          var result = await action();
          setButtonState(button, "success", "Successfully");
          if (successBadgeId) showSuccessBadge(successBadgeId);
          window.setTimeout(function () {
            setButtonState(button, "idle", defaultText);
          }, 1500);
          return result;
        } catch (error) {
          setButtonState(button, "idle", defaultText);
          throw error;
        }
      }

      var adminNotificationLastSeenKey = "z28_admin_notifications_last_seen";
      var adminNotificationOpen = false;

      function getAdminNotificationLastSeen() {
        try { return localStorage.getItem(adminNotificationLastSeenKey) || ""; } catch { return ""; }
      }
      function setAdminNotificationLastSeen(value) {
        if (!value) return;
        try { localStorage.setItem(adminNotificationLastSeenKey, value); } catch {}
      }
      function formatNotificationDate(value) {
        try { return new Date(value).toLocaleString(); } catch { return value || "—"; }
      }
      async function reportClientNotification(title, message, status, source) {
        try {
          var headers = new Headers();
          if (adminSessionToken) headers.set("X-Admin-Session", adminSessionToken);
          else headers.set("X-Telegram-Init-Data", initData);
          headers.set("Accept", "application/json");
          headers.set("Content-Type", "application/json");
          await fetch("/api/admin/notifications", { method:"POST", headers:headers, body:JSON.stringify({
            title:title || "Dashboard Error", message:String(message || "Request failed.").slice(0,2000),
            status:Number(status) || 0, source:source || "Admin Dashboard"
          }) });
        } catch {}
      }
      function renderAdminNotifications(data) {
        var list=document.getElementById("admin-notification-list"), badge=document.getElementById("admin-notification-badge"), button=document.getElementById("admin-notifications-button"), sub=document.getElementById("admin-notification-sub");
        if(!list||!badge||!button)return;
        var notifications=Array.isArray(data.notifications)?data.notifications:[], lastSeen=getAdminNotificationLastSeen(), latest=data.latestCreatedAt||"";
        if (!lastSeen && latest) { setAdminNotificationLastSeen(latest); lastSeen=latest; }
        var unread=lastSeen ? notifications.filter(function(item){ return String(item.createdAt||"")>lastSeen; }).length : 0;
        list.innerHTML=notifications.length ? notifications.map(function(item){
          var message=String(item.message||"");
          return '<article class="admin-notification-item"><div class="admin-notification-item-head"><div class="admin-notification-item-title">'+escapeHtml(String(item.title||"System Error"))+'</div><div class="admin-notification-time">'+escapeHtml(formatNotificationDate(item.createdAt))+'</div></div><div class="admin-notification-message">'+escapeHtml(message)+'</div><div class="admin-notification-actions"><button class="admin-notification-copy" type="button">Copy message</button></div></article>';
        }).join("") : '<div class="admin-notification-empty">No notifications yet.</div>';
        if(unread>0){ badge.textContent=unread>99?"99+":String(unread); badge.classList.add("visible"); button.classList.add("has-unread"); sub.textContent=String(unread)+(unread===1?" unread notification":" unread notifications"); }
        else { badge.classList.remove("visible"); button.classList.remove("has-unread"); sub.textContent="System and dashboard errors"; }
      }
      async function loadAdminNotifications() {
        try { var data=await api("/notifications?pageSize=30"); renderAdminNotifications(data); return data; } catch { return null; }
      }
      async function copyAdminNotification(message, button) {
        try {
          if(navigator.clipboard&&navigator.clipboard.writeText) await navigator.clipboard.writeText(message);
          else { var textarea=document.createElement("textarea"); textarea.value=message; textarea.style.position="fixed"; textarea.style.opacity="0"; document.body.appendChild(textarea); textarea.select(); document.execCommand("copy"); textarea.remove(); }
          var original=button.textContent; button.textContent="Copied ✓"; window.setTimeout(function(){button.textContent=original;},1300);
        } catch { button.textContent="Copy failed"; window.setTimeout(function(){button.textContent="Copy message";},1300); }
      }
      function openAdminNotifications() {
        var panel=document.getElementById("admin-notification-panel"), button=document.getElementById("admin-notifications-button");
        if(!panel||!button)return;
        adminNotificationOpen=true; panel.classList.add("open"); panel.setAttribute("aria-hidden","false"); button.setAttribute("aria-expanded","true");
        loadAdminNotifications().then(function(data){ if(data&&data.latestCreatedAt){setAdminNotificationLastSeen(data.latestCreatedAt);} document.getElementById("admin-notification-badge").classList.remove("visible"); button.classList.remove("has-unread"); document.getElementById("admin-notification-sub").textContent="System and dashboard errors"; });
      }
      function closeAdminNotifications() {
        var panel=document.getElementById("admin-notification-panel"), button=document.getElementById("admin-notifications-button");
        if(!panel||!button)return;
        adminNotificationOpen=false; panel.classList.remove("open"); panel.setAttribute("aria-hidden","true"); button.setAttribute("aria-expanded","false");
      }
      document.getElementById("admin-notifications-button").addEventListener("click",function(){ if(adminNotificationOpen)closeAdminNotifications(); else openAdminNotifications(); });
      document.getElementById("admin-notification-close").addEventListener("click",closeAdminNotifications);
      document.getElementById("admin-notification-list").addEventListener("click",function(event){
        var target=event.target;
        if(target&&target.classList.contains("admin-notification-copy")){
          var item=target.closest(".admin-notification-item"), message=item?item.querySelector(".admin-notification-message"):"";
          copyAdminNotification(message?message.textContent:"",target);
        }
      });
      document.addEventListener("click",function(event){
        var panel=document.getElementById("admin-notification-panel"), button=document.getElementById("admin-notifications-button");
        if(!panel||!button||!adminNotificationOpen)return;
        if(!panel.contains(event.target)&&!button.contains(event.target))closeAdminNotifications();
      });

      async function api(path, options) {
        var requestOptions = options || {};
        var headers = new Headers(requestOptions.headers || {});
        if (adminSessionToken && !groupMode) {
          headers.set("X-Admin-Session", adminSessionToken);
        } else {
          headers.set("X-Telegram-Init-Data", initData);
          if (startParam) headers.set("X-Telegram-Start-Param", startParam);
        }
        headers.set("Accept", "application/json");
        if (requestOptions.body) headers.set("Content-Type", "application/json");
        var response = await fetch(apiBase + path, Object.assign({}, requestOptions, { headers: headers }));
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          var message = typeof data.error === "string" ? data.error : "Request failed.";
          if (path.indexOf("/notifications") !== 0) {
            void reportClientNotification(
              "Dashboard Request Failed",
              message,
              response.status,
              (requestOptions.method ? String(requestOptions.method).toUpperCase() : "GET") + " " + path
            );
          }
          throw new Error(message);
        }
        return data;
      }

      function positiveInteger(id) {
        var number = Number(document.getElementById(id).value);
        return Number.isSafeInteger(number) && number > 0 ? number : undefined;
      }


      async function load() {
        var data = await api("/summary");

        if (groupMode) {
          var groupLimits = data.activityLimits || {};
          var groupCounts = data.countLimits || {};
          document.getElementById("limits-scope").textContent = "These settings apply only to the selected group.";
          document.getElementById("limit-eat").value = groupLimits.eat !== undefined ? groupLimits.eat : "";
          document.getElementById("limit-wc").value = groupLimits.wc !== undefined ? groupLimits.wc : "";
          document.getElementById("limit-smoke").value = groupLimits.smoke !== undefined ? groupLimits.smoke : "";
          document.getElementById("limit-wcd").value = groupLimits.wcd !== undefined ? groupLimits.wcd : "";
          document.getElementById("count-eat").value = "Unlimited";
          document.getElementById("count-wc").value = groupCounts.wc !== undefined ? groupCounts.wc : "";
          document.getElementById("count-smoke").value = groupCounts.smoke !== undefined ? groupCounts.smoke : "";
          document.getElementById("count-wcd").value = groupCounts.wcd !== undefined ? groupCounts.wcd : "";
          var group = data.group || {};
          document.getElementById("identity").textContent =
            (group.title || "Group") + " • " + (group.id || "—");
          document.getElementById("connection").innerHTML = data.connection
            ? "<strong>Connected target</strong>" +
              escapeHtml(String(data.connection.targetGroupName || data.connection.targetChatId || "—")) +
              " <span>(" + escapeHtml(String(data.connection.targetChatId || "—")) + ")</span>"
            : "No notification group is connected.";
          document.getElementById("target").value =
            data.connection && data.connection.targetChatId
              ? String(data.connection.targetChatId)
              : "";
          return data;
        }

        var stats = data.stats || {};
        var role = data.role === "owner" ? "Bot Owner" : "Administrator";
        var user = data.user || {};
        var displayName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "Administrator";
        var initials = displayName.split(/\s+/).map(function(part){ return part.charAt(0); }).join("").slice(0,2).toUpperCase() || "A";

        document.getElementById("users").textContent = stats.privateUsers === undefined ? "—" : String(stats.privateUsers);
        document.getElementById("groups").textContent = stats.groups === undefined ? "—" : String(stats.groups);
        document.getElementById("limit-eat").value = data.activityLimits && data.activityLimits.eat !== undefined ? data.activityLimits.eat : "";
        document.getElementById("limit-wc").value = data.activityLimits && data.activityLimits.wc !== undefined ? data.activityLimits.wc : "";
        document.getElementById("limit-smoke").value = data.activityLimits && data.activityLimits.smoke !== undefined ? data.activityLimits.smoke : "";
        document.getElementById("limit-wcd").value = data.activityLimits && data.activityLimits.wcd !== undefined ? data.activityLimits.wcd : "";
        document.getElementById("count-eat").value = "Unlimited";
        document.getElementById("count-wc").value = data.countLimits && data.countLimits.wc !== undefined ? data.countLimits.wc : "";
        document.getElementById("count-smoke").value = data.countLimits && data.countLimits.smoke !== undefined ? data.countLimits.smoke : "";
        document.getElementById("count-wcd").value = data.countLimits && data.countLimits.wcd !== undefined ? data.countLimits.wcd : "";
        document.getElementById("reminder").checked = data.reminderEnabled === true;
        document.getElementById("admin-reminder").checked = data.reminderEnabled === true;

        document.getElementById("admin-users").textContent = stats.privateUsers === undefined ? "—" : String(stats.privateUsers);
        document.getElementById("admin-groups").textContent = stats.groups === undefined ? "—" : String(stats.groups);
        document.getElementById("admin-active").textContent = stats.activeActivities === undefined ? "—" : String(stats.activeActivities);
        document.getElementById("admin-reminder-status").textContent = data.reminderEnabled ? "ON" : "OFF";
        document.getElementById("admin-reminder-note").textContent = data.reminderEnabled ? "Automatic reminders are enabled" : "Automatic reminders are disabled";
        document.getElementById("admin-reminder-detail").textContent = data.reminderEnabled ? "Reminder service is enabled." : "Reminder service is currently disabled.";
        document.getElementById("admin-session-name").textContent = displayName;
        document.getElementById("admin-session-role").textContent = role;
        document.getElementById("admin-sidebar-role").textContent = role + " access • Telegram ID " + (user.id || telegramUserId || "—");
        document.getElementById("admin-avatar").textContent = initials;
        loadAdminGroups(false).catch(function () {
          // Keep the main dashboard usable if group data is temporarily unavailable.
        });
        loadAdminUsers(false).catch(function () {
          // Keep the main dashboard usable if the user list is temporarily unavailable.
        });

        return data;
      }

      function formatHealthUptime(seconds) {
        var total = Math.max(0, Number(seconds) || 0);
        var days = Math.floor(total / 86400);
        var hours = Math.floor((total % 86400) / 3600);
        var minutes = Math.floor((total % 3600) / 60);
        return days ? days + "d " + hours + "h" : hours ? hours + "h " + minutes + "m" : minutes + "m";
      }

      function renderAdminHealth(data) {
        var services = data.services || {};
        ["api","storage","telegram"].forEach(function(key) {
          var service = services[key] || {};
          var dot = document.getElementById("health-" + key + "-dot");
          var value = document.getElementById("health-" + key + "-value");
          if (!dot || !value) return;
          var healthy = service.status === "healthy";
          dot.className = "admin-health-dot " + (healthy ? "healthy" : "error");
          value.textContent = (healthy ? "Operational" : "Unavailable") + " · " + String(service.latencyMs || 0) + " ms";
        });
        var mongoDot = document.getElementById("health-mongodb-dot");
        var mongoValue = document.getElementById("health-mongodb-value");
        var mongoMeta = document.getElementById("health-mongodb-meta");
        if (mongoDot) mongoDot.className = "admin-health-dot " + (data.mongodbStorage && data.mongodbStorage.status === "healthy" ? "healthy" : "error");
        if (mongoValue) {
          var mongo = data.mongodbStorage;
          mongoValue.textContent = mongo
            ? String(mongo.usagePercent) + "% used · " + (Number(mongo.storageBytes || 0) / 1048576).toFixed(1) + " / " + String(mongo.limitMb) + " MB"
            : "Unavailable";
        }
        if (mongoMeta) {
          var mongo = data.mongodbStorage;
          mongoMeta.textContent = mongo
            ? "Warn " + String(mongo.warnPercent) + "% · Critical " + String(mongo.criticalPercent) + "% · Emergency retention " + String(mongo.emergencyRetentionDays) + " days"
            : "MongoDB storage metrics unavailable";
        }

        var overall = document.getElementById("health-overall");
        var uptime = document.getElementById("health-uptime");
        var memory = document.getElementById("health-memory");
        var memoryMeta = document.getElementById("health-memory-meta");
        var checked = document.getElementById("health-checked-at");
        var memoryData = data.memory || {};
        var memoryStatus = memoryData.status || "healthy";
        if (overall) overall.innerHTML = '<span class="admin-health-status ' + (data.status === "healthy" ? "healthy" : "degraded") + '">' + escapeHtml(data.status === "healthy" ? "Healthy" : "Degraded") + '</span>';
        if (uptime) uptime.textContent = formatHealthUptime(data.uptimeSeconds);
        if (memory) memory.textContent = String(memoryData.heapUsedMb || 0) + " MB heap · " + String(memoryData.rssMb || 0) + " MB RSS";
        if (memoryMeta) {
          var statusLabel = memoryStatus === "critical" ? "Critical" : memoryStatus === "warning" ? "Warning" : "Healthy";
          memoryMeta.textContent =
            statusLabel + " · Heap " + String(memoryData.heapUsagePercent || 0) + "% of " + String(memoryData.heapLimitMb || 0) + " MB (Warn " +
            String(memoryData.heapWarnPercent || 0) + "% · Critical " + String(memoryData.heapCriticalPercent || 0) +
            "%) · RSS " + String(memoryData.rssUsagePercent || 0) + "% of " + String(memoryData.rssLimitMb || 0) +
            " MB (Warn " + String(memoryData.rssWarnPercent || 0) + "% · Critical " +
            String(memoryData.rssCriticalPercent || 0) + "%)";
          memoryMeta.style.color = memoryStatus === "critical" ? "#fca5a5" : memoryStatus === "warning" ? "#fcd34d" : "";
        }
        if (checked) checked.textContent = "Last checked: " + (data.checkedAt ? formatAdminDate(data.checkedAt) : "—");
      }

      async function cleanupAdminAuditLogs() {
        var select = document.getElementById("admin-retention-days");
        var button = document.getElementById("admin-retention-cleanup");
        if (!select || !button) return;
        var retentionDays = Number(select.value);
        if (!window.confirm("Delete audit logs older than " + retentionDays + " days? This cannot be undone.")) return;
        button.disabled = true;
        button.textContent = "Cleaning…";
        try {
          var headers = new Headers();
          headers.set("X-Telegram-Init-Data", initData);
          headers.set("Content-Type", "application/json");
          headers.set("Accept", "application/json");
          var response = await fetch("/api/admin/maintenance/audit-retention", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ retentionDays: retentionDays })
          });
          var data = await response.json().catch(function(){ return {}; });
          if (!response.ok) throw new Error(data.error || "Cleanup failed.");
          showNotice("Removed " + String(data.deleted || 0) + " old audit log(s).", "ok");
        } finally {
          button.disabled = false;
          button.textContent = "Clean old audit logs";
        }
      }

      async function downloadAdminBackup() {
        var button = document.getElementById("admin-backup-download");
        if (!button) return;
        button.disabled = true;
        button.textContent = "Preparing…";
        try {
          var headers = new Headers();
          headers.set("X-Telegram-Init-Data", initData);
          headers.set("Accept", "application/json");
          var response = await fetch("/api/admin/backup", { method: "GET", headers: headers });
          if (!response.ok) {
            var data = await response.json().catch(function(){ return {}; });
            throw new Error(data.error || "Backup failed.");
          }
          var blob = await response.blob();
          var url = URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.href = url;
          link.download = "z28-attendance-backup.json";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          showNotice("Backup downloaded.", "ok");
        } finally {
          button.disabled = false;
          button.textContent = "Download JSON Backup";
        }
      }

      function syncAdminBroadcastMode() {
        var modeBox = document.getElementById("admin-broadcast-mode");
        var directBox = document.getElementById("admin-broadcast-direct");
        var userIdBox = document.getElementById("admin-broadcast-user-id");
        var button = document.getElementById("admin-broadcast-send");
        var messageBox = document.getElementById("admin-broadcast-message");
        if (!modeBox || !directBox || !button || !messageBox) return;

        var mode = modeBox.value === "direct" ? "direct" : "broadcast";
        var direct = mode === "direct";
        directBox.hidden = !direct;
        button.textContent = direct ? "Send direct reply" : "Send announcement";
        messageBox.placeholder = direct ? "Write your reply…" : "Write your announcement…";

        document.querySelectorAll("[data-admin-broadcast-mode]").forEach(function (option) {
          var active = option.getAttribute("data-admin-broadcast-mode") === mode;
          option.classList.toggle("is-active", active);
          option.setAttribute("aria-pressed", String(active));
        });

        if (!direct && userIdBox) userIdBox.value = "";
        if (direct && userIdBox && document.activeElement !== userIdBox) {
          userIdBox.focus();
        }
      }

      function setAdminBroadcastMode(mode) {
        if (mode !== "broadcast" && mode !== "direct") return;
        var modeBox = document.getElementById("admin-broadcast-mode");
        if (!modeBox) return;
        if (modeBox.value === mode) {
          syncAdminBroadcastMode();
          return;
        }
        modeBox.value = mode;
        syncAdminBroadcastMode();
      }

      async function sendAdminBroadcast() {
        var messageBox = document.getElementById("admin-broadcast-message");
        var modeBox = document.getElementById("admin-broadcast-mode");
        var userIdBox = document.getElementById("admin-broadcast-user-id");
        var button = document.getElementById("admin-broadcast-send");
        var resultBox = document.getElementById("admin-broadcast-result");
        if (!messageBox || !modeBox || !button || !resultBox) return;

        var message = messageBox.value.trim();
        if (!message) throw new Error("Please enter a message.");

        var mode = modeBox.value === "direct" ? "direct" : "broadcast";
        var userId = undefined;
        if (mode === "direct") {
          var rawUserId = userIdBox ? userIdBox.value.trim() : "";
          if (!/^\d{1,20}$/.test(rawUserId)) {
            throw new Error("Enter a valid Telegram User ID.");
          }
          userId = Number(rawUserId);
          if (!Number.isSafeInteger(userId) || userId <= 0) {
            throw new Error("Enter a valid Telegram User ID.");
          }
        }

        button.disabled = true;
        button.textContent = mode === "direct" ? "Sending reply…" : "Sending…";
        resultBox.style.display = "none";
        try {
          var headers = new Headers();
          headers.set("X-Telegram-Init-Data", initData);
          headers.set("Content-Type", "application/json");
          headers.set("Accept", "application/json");
          var payload = { message: message };
          if (mode === "direct") {
            payload.mode = "direct";
            payload.userId = userId;
          }
          var response = await fetch("/api/admin/broadcast", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
          });
          var data = await response.json().catch(function(){ return {}; });
          if (!response.ok) throw new Error(data.error || (mode === "direct" ? "Direct reply failed." : "Broadcast failed."));

          if (mode === "direct") {
            var recipient = data.recipient || {};
            var recipientName = recipient.displayName || ("User " + String(userId));
            var recipientHandle = recipient.username ? " · @" + recipient.username : "";
            resultBox.textContent = "Sent to " + recipientName + recipientHandle + " (" + String(userId) + ").";
            showNotice("Direct reply sent.", "ok");
          } else {
            resultBox.textContent = "Completed: " + String(data.sent || 0) + " sent, " + String(data.failed || 0) + " failed, " + String(data.total || 0) + " total.";
            showNotice("Broadcast completed.", "ok");
          }
          resultBox.style.display = "block";
        } finally {
          button.disabled = false;
          syncAdminBroadcastMode();
        }
      }

      async function loadAdminHealth() {
        var results = await Promise.all([
          api("/health"),
          api("/storage-health").catch(function () { return undefined; })
        ]);
        var data = results[0] || {};
        data.mongodbStorage = results[1];
        renderAdminHealth(data);
        return data;
      }

      var adminAnalyticsDays = 30;

      async function exportAdminCsv() {
        var button = document.getElementById("admin-export-csv");
        if (!button) return;
        var original = button.textContent;
        button.disabled = true;
        button.textContent = "Preparing…";
        try {
          var headers = new Headers();
          headers.set("X-Telegram-Init-Data", initData);
          headers.set("Accept", "text/csv");
          var response = await fetch("/api/admin/export?days=" + encodeURIComponent(String(adminAnalyticsDays)), {
            method: "GET",
            headers: headers
          });
          if (!response.ok) {
            var errorText = await response.text();
            throw new Error(errorText || "Unable to export report.");
          }
          var blob = await response.blob();
          var url = URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.href = url;
          link.download = "z28-attendance-" + adminAnalyticsDays + "d.csv";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
          showNotice("CSV report exported.", "ok");
        } finally {
          button.disabled = false;
          button.textContent = original;
        }
      }

      function renderAdminAnalytics(data) {
        var s=data.summary||{}, kpis=document.getElementById("admin-analytics-kpis"), daily=document.getElementById("admin-analytics-daily"), kinds=document.getElementById("admin-analytics-kinds");
        if(!kpis||!daily||!kinds)return;
        kpis.innerHTML=[
          ["Activities",String(s.totalActivities||0)],
          ["Minutes",String(s.totalMinutes||0)],
          ["Active Users",String(s.uniqueUsers||0)],
          ["Groups",String(s.uniqueGroups||0)],
          ["Active Now",String(s.activeNow||0)]
        ].map(function(item){return '<div class="admin-kpi"><div class="admin-kpi-label">'+escapeHtml(item[0])+'</div><div class="admin-kpi-value">'+escapeHtml(item[1])+'</div></div>';}).join("");
        var rows=data.daily||[];
        daily.innerHTML=rows.length?rows.map(function(x){return '<div class="admin-analytics-row"><span>'+escapeHtml(x.date)+'</span><strong>'+String(x.activities)+' · '+String(x.minutes)+' min</strong></div>';}).join(""):'<div class="admin-users-empty">No activity in this period.</div>';
        var labels={eat:"Eat",wc:"WC",smoke:"Smoke",wcd:"WCD"};
        kinds.innerHTML=Object.keys(labels).map(function(key){var x=(data.kinds||{})[key]||{};return '<div class="admin-analytics-row"><span>'+labels[key]+'</span><strong>'+String(x.count||0)+' · '+String(Math.round((x.seconds||0)/60))+' min</strong></div>';}).join("");
      }

      async function loadAdminAnalytics() {
        var data=await api("/analytics?days="+String(adminAnalyticsDays)); renderAdminAnalytics(data); return data;
      }

      var adminAuditState = { search:"", action:"", page:1, pageSize:20, totalPages:1 };

      function renderAdminAudit(data) {
        var logs=data.logs||[], pagination=data||{};
        var body=document.getElementById("admin-audit-table-body"), meta=document.getElementById("admin-audit-meta"), pageMeta=document.getElementById("admin-audit-page-meta"), prev=document.getElementById("admin-audit-prev"), next=document.getElementById("admin-audit-next");
        if(!body||!meta||!pageMeta||!prev||!next)return;
        adminAuditState.page=pagination.page||1; adminAuditState.totalPages=pagination.totalPages||1;
        if(!logs.length) body.innerHTML='<tr><td colspan="5"><div class="admin-users-empty">No audit entries match the current filter.</div></td></tr>';
        else body.innerHTML=logs.map(function(log){
          var role=log.role==="owner"?"Owner":"Administrator";
          return '<tr><td class="admin-user-muted">'+escapeHtml(formatAdminDate(log.createdAt))+'</td><td><div class="admin-user-primary"><div class="admin-user-avatar">'+escapeHtml(adminInitials(log.actorName))+'</div><div><div class="admin-user-name">'+escapeHtml(log.actorName||"Administrator")+'</div><div class="admin-user-sub">'+escapeHtml(role)+" • "+escapeHtml(String(log.actorUserId))+'</div></div></div></td><td><span class="admin-user-status active">'+escapeHtml(log.action)+'</span></td><td>'+escapeHtml(log.target||"—")+'</td><td class="admin-user-muted">'+escapeHtml(log.details||"—")+'</td></tr>';
        }).join("");
        meta.textContent=String(pagination.total||0)+(Number(pagination.total||0)===1?" entry":" entries");
        pageMeta.textContent="Page "+String(adminAuditState.page)+" of "+String(adminAuditState.totalPages);
        prev.disabled=adminAuditState.page<=1; next.disabled=adminAuditState.page>=adminAuditState.totalPages;
      }

      async function loadAdminAudit(resetPage) {
        if(resetPage) adminAuditState.page=1;
        var query=new URLSearchParams(); query.set("page",String(adminAuditState.page)); query.set("pageSize",String(adminAuditState.pageSize));
        if(adminAuditState.search) query.set("search",adminAuditState.search); if(adminAuditState.action) query.set("action",adminAuditState.action);
        var data=await api("/audit-logs?"+query.toString()); renderAdminAudit(data); return data;
      }

      var adminGroupsState = { search:"", page:1, pageSize:20, totalPages:1 };

      function renderAdminGroups(data) {
        var groups=data.groups||[], pagination=data.pagination||{};
        var body=document.getElementById("admin-groups-table-body"), meta=document.getElementById("admin-groups-meta");
        var pageMeta=document.getElementById("admin-groups-page-meta"), prev=document.getElementById("admin-groups-prev"), next=document.getElementById("admin-groups-next");
        if(!body||!meta||!pageMeta||!prev||!next)return;
        adminGroupsState.page=pagination.page||1; adminGroupsState.totalPages=pagination.totalPages||1;
        if(!groups.length) body.innerHTML='<tr><td colspan="7"><div class="admin-users-empty">No managed groups match the current search.</div></td></tr>';
        else body.innerHTML=groups.map(function(group){
          var connection=group.connection ? "→ "+(group.connection.targetGroupName||String(group.connection.targetChatId)) : "Not connected";
          return '<tr><td><div class="admin-user-primary"><div class="admin-user-avatar">GR</div><div><div class="admin-user-name">'+escapeHtml(group.title||"Group")+
            '</div><div class="admin-user-sub">'+escapeHtml(group.username ? "@"+group.username : "Managed group")+'</div></div></div></td><td class="admin-user-id">'+escapeHtml(String(group.chatId))+
            '</td><td>'+escapeHtml(String(group.memberCount||0))+'</td><td><span class="admin-user-status '+(Number(group.activeCount||0)>0?"active":"inactive")+'">'+escapeHtml(String(group.activeCount||0))+
            '</span></td><td><span class="admin-user-status '+(group.connection?"active":"inactive")+'">'+escapeHtml(connection)+'</span></td><td class="admin-user-muted">'+escapeHtml(formatAdminDate(group.updatedAt))+'</td><td><button class="admin-health-button" type="button" data-group-health="'+escapeHtml(String(group.chatId))+'">Check</button></td></tr>';
        }).join("");
        var total=Number(pagination.total||0);
        meta.textContent=total+(total===1?" group":" groups");
        pageMeta.textContent="Page "+String(adminGroupsState.page)+" of "+String(adminGroupsState.totalPages);
        prev.disabled=adminGroupsState.page<=1; next.disabled=adminGroupsState.page>=adminGroupsState.totalPages;
      }

      async function checkAdminGroupHealth(chatId) {
        var result = document.getElementById("admin-group-health-result");
        if (!result) return;
        result.hidden = false;
        result.innerHTML = '<div class="admin-health-result-title">Checking group health…</div>';
        try {
          var data = await api("/group-health?chatId=" + encodeURIComponent(String(chatId)));
          var statusClass = data.healthy ? "admin-health-ok" : "admin-health-error";
          var statusText = data.healthy ? "Healthy" : "Needs attention";
          result.innerHTML = '<div class="admin-health-result-head"><div class="admin-health-result-title">' +
            escapeHtml(data.group && data.group.title ? data.group.title : String(chatId)) +
            '</div><div class="' + statusClass + '">' + statusText + '</div></div>' +
            (data.checks || []).map(function(check) {
              return '<div class="admin-health-check"><span>' + escapeHtml(check.name) + '</span><span class="' +
                (check.status === "ok" ? "admin-health-ok" : "admin-health-error") + '">' +
                escapeHtml(check.status.toUpperCase() + " · " + String(check.latencyMs) + "ms · " + check.detail) + '</span></div>';
            }).join("") +
            '<div class="admin-users-meta" style="margin-top:10px">Checked ' + escapeHtml(formatAdminDate(data.checkedAt)) +
            ' · Total ' + escapeHtml(String(data.totalLatencyMs || 0)) + 'ms</div>';
        } catch (error) {
          result.hidden = false;
          result.innerHTML = '<div class="admin-health-result-title admin-health-error">' +
            escapeHtml(error && error.message ? error.message : "Group health check failed.") + '</div>';
        }
      }

      async function loadAdminGroups(resetPage) {
        if(resetPage) adminGroupsState.page=1;
        var query=new URLSearchParams();
        query.set("page",String(adminGroupsState.page)); query.set("pageSize",String(adminGroupsState.pageSize));
        if(adminGroupsState.search) query.set("search",adminGroupsState.search);
        var data=await api("/groups?"+query.toString()); renderAdminGroups(data); return data;
      }

      var adminUsersState = { search:"", status:"all", page:1, pageSize:20, totalPages:1 };

      function formatAdminDate(value) {
        if (!value) return "—";
        try { return new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(value)); }
        catch { return "—"; }
      }

      function adminInitials(name) {
        return String(name || "User").trim().split(/\s+/).map(function(part){return part.charAt(0);}).join("").slice(0,2).toUpperCase() || "U";
      }

      function renderAdminUsers(data) {
        var users = data.users || [];
        var pagination = data.pagination || {};
        var body = document.getElementById("admin-users-table-body");
        var meta = document.getElementById("admin-users-meta");
        var pageMeta = document.getElementById("admin-users-page-meta");
        var prev = document.getElementById("admin-users-prev");
        var next = document.getElementById("admin-users-next");
        if (!body || !meta || !pageMeta || !prev || !next) return;
        adminUsersState.page = pagination.page || 1;
        adminUsersState.totalPages = pagination.totalPages || 1;
        if (!users.length) {
          body.innerHTML = '<tr><td colspan="7"><div class="admin-users-empty">No users match the current filter.</div></td></tr>';
        } else {
          body.innerHTML = users.map(function(user){
            var username = user.username ? "@" + user.username : "Telegram user";
            var activity = user.currentActivity ? String(user.currentActivity.kind || "").toUpperCase() : "—";
            var status = user.status === "active" ? "active" : "inactive";
            return '<tr><td><div class="admin-user-primary"><div class="admin-user-avatar">' +
              escapeHtml(adminInitials(user.displayName)) + '</div><div><div class="admin-user-name">' +
              escapeHtml(user.displayName || "User") + '</div><div class="admin-user-sub">' + escapeHtml(username) +
              '</div></div></div></td><td class="admin-user-id">' + escapeHtml(String(user.userId)) +
              '</td><td><span class="admin-user-status ' + status + '">' + status + '</span></td><td class="admin-user-activity">' +
              escapeHtml(activity) + '</td><td>' + escapeHtml(String(user.totalActivities || 0)) + '</td><td>' +
              escapeHtml(String(user.warningCount || 0)) + '</td><td class="admin-user-muted">' +
              escapeHtml(formatAdminDate(user.lastActive)) + '</td></tr>';
          }).join("");
        }
        var total = Number(pagination.total || 0);
        meta.textContent = total + (total === 1 ? " user" : " users");
        pageMeta.textContent = "Page " + String(adminUsersState.page) + " of " + String(adminUsersState.totalPages);
        prev.disabled = adminUsersState.page <= 1;
        next.disabled = adminUsersState.page >= adminUsersState.totalPages;
      }

      async function loadAdminUsers(resetPage) {
        if (resetPage) adminUsersState.page = 1;
        var query = new URLSearchParams();
        query.set("page",String(adminUsersState.page));
        query.set("pageSize",String(adminUsersState.pageSize));
        query.set("status",adminUsersState.status);
        if (adminUsersState.search) query.set("search",adminUsersState.search);
        var data = await api("/users?" + query.toString());
        renderAdminUsers(data);
        return data;
      }

      var adminRefreshTimer = null;
      var adminNotificationRefreshTimer = null;
      function startAdminDashboardRefresh() {
        if (adminRefreshTimer) return;
        adminRefreshTimer = window.setInterval(function () {
          if (!adminMode) return;
          load().catch(function (error) {
            void reportClientNotification("Background Refresh Failed", error && error.message ? error.message : "Dashboard refresh failed.", 0, "Background refresh");
          });
        }, 15000);
        loadAdminNotifications().catch(function () {});
        adminNotificationRefreshTimer = window.setInterval(function () {
          if (!adminMode || adminNotificationOpen) return;
          loadAdminNotifications().catch(function () {});
        }, 8000);
      }

      function showUserLoading(show) {
        userLoading.classList.toggle("visible", show);
      }

      function getVerifiedUserId() {
        try {
          return localStorage.getItem(userVerifiedKey);
        } catch {
          return null;
        }
      }

      function rememberVerifiedUserId(userId) {
        try {
          localStorage.setItem(userVerifiedKey, String(userId));
        } catch {
          // Local persistence is optional; server validation remains authoritative.
        }
      }

      function getVerifiedAdminId() {
        try {
          return localStorage.getItem(adminVerifiedKey);
        } catch {
          return null;
        }
      }

      function rememberVerifiedAdminId(userId) {
        try {
          localStorage.setItem(adminVerifiedKey, String(userId));
        } catch {
          // Local persistence is optional; server validation remains authoritative.
        }
      }

      function clearUserDashboard() {
        document.body.classList.remove("admin-verification-page");
        document.getElementById("user-verify-title").textContent = tUser("verifyTitle");
        document.getElementById("user-verify-subtitle").textContent = tUser("verifySubtitle");
        document.getElementById("user-verify-lead").textContent = tUser("verifyLead");
        document.getElementById("user-id-label").textContent = tUser("idLabel");
        document.getElementById("user-id-input").placeholder = tUser("idPlaceholder");
        document.getElementById("user-id-hint").textContent = tUser("idHint");
        document.getElementById("user-dashboard").classList.remove("visible");
        document.getElementById("user-group-options-list").innerHTML = "";
        document.getElementById("user-dashboard-sub").textContent = tUser("dashboardSub");
        document.getElementById("user-group-options").hidden = false;
        document.getElementById("user-selected-dashboard").hidden = true;
        document.getElementById("user-about-page").hidden = true;
        document.getElementById("user-dashboard-page-shell").hidden = true;
        document.getElementById("user-tabbar").hidden = true;
        document.getElementById("switch-group").hidden = true;
        window.__z28AboutOpen = false;
        document.body.classList.remove("user-dashboard-page");
      }

      function showAdminVerificationPage() {
        adminVerificationMode = true;
        document.body.classList.remove("user-verification-page", "user-dashboard-page", "user-no-group-page");
        document.body.classList.add("admin-verification-page");
        document.getElementById("user-id-input").value = "";
        document.getElementById("user-confirm").disabled = true;
        document.getElementById("user-confirm").classList.remove("ready");
        document.getElementById("user-confirm").textContent = tUser("confirm");
        document.getElementById("user-verify-title").textContent = tUser("adminVerifyTitle");
        document.getElementById("user-verify-subtitle").textContent = tUser("adminVerifySubtitle");
        document.getElementById("user-verify-lead").textContent = tUser("adminVerifyLead");
        document.getElementById("user-id-label").textContent = tUser("adminIdLabel");
        document.getElementById("user-id-input").placeholder = tUser("adminIdPlaceholder");
        document.getElementById("user-id-hint").textContent = tUser("adminIdHint");
        document.getElementById("user-verify-card").classList.add("visible");
        title.textContent = tUser("adminVerifySubtitle");
      }

      function showUserVerificationPage() {
        adminVerificationMode = false;
        document.getElementById("user-dashboard-error-screen").hidden=true;
        document.body.classList.remove("user-dashboard-error-page");
        window.clearTimeout(showUserNoGroupScreen.timer);
        document.getElementById("user-no-group-screen").classList.remove("visible");
        clearUserDashboard();
        document.body.classList.remove("user-no-group-page", "user-dashboard-page");
        document.getElementById("user-greeting").classList.remove("visible");
        document.body.classList.add("user-verification-page");
        document.getElementById("user-id-input").value = "";
        document.getElementById("user-confirm").disabled = true;
        document.getElementById("user-confirm").classList.remove("ready");
        document.getElementById("user-confirm").textContent = tUser("confirm");
        document.getElementById("user-verify-card").classList.add("visible");
        title.textContent = tUser("verifySubtitle");
      }

      function showUserDashboardError(error, groupId) {
        var screen=document.getElementById("user-dashboard-error-screen");
        if(!screen)return;
        window.__z28DashboardErrorGroupId=groupId!==undefined&&Number.isSafeInteger(Number(groupId))?Number(groupId):undefined;
        document.getElementById("user-verify-card").classList.remove("visible");
        clearUserDashboard();
        document.body.classList.remove("user-verification-page","user-dashboard-page","user-no-group-page");
        document.body.classList.add("user-dashboard-error-page");
        document.getElementById("user-dashboard-error-title").textContent=tUser("dashboardLoadError");
        document.getElementById("user-dashboard-error-lead").textContent = error && error.message ? error.message : tUser("dashboardLoadErrorLead");
        var retry=document.getElementById("user-dashboard-error-retry");
        retry.textContent=tUser("retry");retry.disabled=false;screen.hidden=false;title.textContent=tUser("dashboardLoadError");
      }

      function showUserNoGroupScreen() {
        window.clearTimeout(showUserNoGroupScreen.timer);
        document.getElementById("user-verify-card").classList.remove("visible");
        document.getElementById("user-dashboard-error-screen").hidden = true;
        clearUserDashboard();
        document.body.classList.remove("user-verification-page", "user-dashboard-page", "user-dashboard-error-page");
        document.body.classList.add("user-no-group-page");
        document.getElementById("user-no-group-screen").classList.add("visible");
        window.clearTimeout(showUserNoGroupScreen.timer);
        showUserNoGroupScreen.timer = window.setTimeout(function () {
          if (!document.body.classList.contains("user-no-group-page")) return;
          try { localStorage.removeItem(userVerifiedKey); } catch {}
          showUserVerificationPage();
        }, 2850);
      }
      showUserNoGroupScreen.timer = null;


      function settingEditorMarkup(type, values, groupId) {
        var isCount = type === "count";
        var rows = isCount ? [["wc","WC",values.wc],["smoke","Smoke",values.smoke],["wcd","WCD",values.wcd]]
          : [["eat","Eat",values.eat],["wc","WC",values.wc],["smoke","Smoke",values.smoke],["wcd","WCD",values.wcd]];
        var inputs = rows.map(function(item) {
          return '<div class="editor-row"><label>' + item[1] + '</label><input data-kind="' + item[0] +
            '" type="number" min="1" step="1" value="' + escapeHtml(String(item[2])) + '" data-original-value="' + escapeHtml(String(item[2])) + '"></div>';
        }).join("");
        var values = rows.map(function(item) {
          var displayValue = isCount ? String(item[2]) : String(item[2]) + " min";
          return '<div class="user-setting-value"><span class="user-setting-value-label">' + item[1] +
            '</span><strong class="user-setting-value-number">' + escapeHtml(displayValue) + '</strong></div>';
        }).join("");
        var titleText = isCount ? tUser("dailyCountLimits") : tUser("activityLimits");
        var subText = isCount ? tUser("dailyUsageControl") : tUser("durationControl");
        var icon = isCount
          ? '<svg viewBox="0 0 24 24"><path d="M4 21h16"></path><rect class="count-bar count-bar-1" x="5" y="13" width="3" height="5" rx="1.5" fill="currentColor" stroke="none"></rect><rect class="count-bar count-bar-2" x="10.5" y="9" width="3" height="9" rx="1.5" fill="currentColor" stroke="none"></rect><rect class="count-bar count-bar-3" x="16" y="5" width="3" height="13" rx="1.5" fill="currentColor" stroke="none"></rect></svg>'
          : '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"></circle><path d="M9 3h6"></path><path d="M12 5.5v2"></path><g class="clock-hand"><path d="M12 13l3-2"></path></g></svg>';
        return '<div class="user-setting-head"><span class="user-setting-icon">' + icon + '</span><div><div class="user-setting-title">' +
          titleText + '</div><div class="user-setting-sub">' + subText + '</div></div></div>' +
          '<div class="user-setting-view"><div class="user-setting-grid">' + values + '</div><button class="user-setting-edit" data-setting-edit="' + type +
          '" type="button">' + escapeHtml(tUser("edit")) + '</button></div>' +
          '<div class="user-setting-editor" data-setting-editor="' + type + '" hidden>' + inputs +
          '<div class="user-setting-editor-status" hidden>' +
          '<span class="user-setting-unsaved-dot" aria-hidden="true"></span><span class="user-setting-unsaved">' + escapeHtml(tUser("unsavedChanges")) + '</span></div>' +
          '<div class="user-setting-change-summary" hidden aria-live="polite"></div>' +
          '<div class="user-setting-editor-error" hidden role="alert">' + escapeHtml(tUser("invalidSettingValue")) + '</div>' +
          '<div class="user-setting-editor-actions"><button class="user-setting-cancel" data-setting-cancel="' + type +
          '" type="button">' + escapeHtml(tUser("cancel")) + '</button><button class="user-setting-save" data-setting-type="' + type +
          '" data-group-id="' + groupId + '" type="button">' + (isCount ? escapeHtml(tUser("saveCountLimits")) : escapeHtml(tUser("saveLimits"))) + '</button></div></div>';
      }

      function renderGroupOptions(groups) {
        var list = document.getElementById("user-group-options-list");
        list.innerHTML = (groups || []).map(function(group) {
          return '<button class="user-group-option" type="button" data-group-id="' + group.id + '"><span>' +
            escapeHtml(group.title) + '</span><span>›</span></button>';
        }).join("");
        list.querySelectorAll(".user-group-option").forEach(function(button) {
          button.addEventListener("click", function() { selectUserGroup(Number(button.getAttribute("data-group-id"))); });
        });
      }


      function renderSelectedDashboard(data) {
        if (window.__z28AboutOpen) return;
        var group = data.selectedGroup;
        if (!group) return;
        window.__z28SelectedGroupId = group.id;
        userDashboardData = data;
        saveUserDashboardState({ groupId: group.id });
        window.__z28GroupSelectionOpen = false;
        window.__z28AboutOpen = false;
        document.getElementById("user-group-options").hidden = true;
        document.getElementById("user-selected-dashboard").hidden = false;
        title.textContent = tUser("title");
        document.getElementById("user-greeting").classList.add("visible");
        renderUserGreeting();
        window.__z28AboutOpen = false;
        document.getElementById("user-about-page").hidden = true;
        document.getElementById("user-dashboard-page-shell").hidden = false;
        document.getElementById("user-selected-dashboard").hidden = false;
        document.getElementById("user-tabbar").hidden = false;
        document.getElementById("refresh").hidden = false;
        document.getElementById("switch-group").hidden = false;
        document.querySelectorAll("[data-user-tab]").forEach(function(button) {
          var active = button.getAttribute("data-user-tab") === "dashboard";
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
        });
        document.getElementById("switch-group-label").textContent = tUser("switch");
        document.getElementById("user-selected-group-title").textContent = group.title + " " + tUser("title");
        document.getElementById("user-group-name").textContent = group.title;
        function updateLiveMetric(id, value) {
          var element = document.getElementById(id);
          if (!element) return;
          var next = String(value);
          var changed = element.textContent !== next;
          element.textContent = next;
          if (changed) {
            element.classList.remove("metric-updated");
            void element.offsetWidth;
            element.classList.add("metric-updated");
          }
        }
        updateLiveMetric("user-member-count", group.memberCount);
        updateLiveMetric("user-active-count", group.activeCount);

        var activityLimits = data.activityLimits || {};
        var countLimits = data.countLimits || {};
        document.getElementById("user-settings-limits-card").innerHTML =
          settingEditorMarkup("duration", activityLimits, group.id);
        document.getElementById("user-settings-counts-card").innerHTML =
          settingEditorMarkup("count", countLimits, group.id);

        bindUserSettingButtons();
        updateUserBackButton();

        var savedState = getUserDashboardState();
        if (savedState && savedState.tab === "about") {
          setUserDashboardTab("about");
        }
      }

      function renderUserDashboard(data) {
        var dashboard = document.getElementById("user-dashboard");
        dashboard.classList.add("visible");
        if (!data.groups || !data.groups.length) return;
        if (data.selectionRequired) {
          var savedState = getUserDashboardState();
          var savedGroup = savedState && Number.isSafeInteger(savedState.groupId) ? savedState.groupId : null;
          var savedGroupExists = savedGroup !== null && data.groups.some(function(group) {
            return Number(group.id) === savedGroup;
          });
          if (savedGroupExists) {
            selectUserGroup(savedGroup);
            return;
          }
          document.getElementById("user-group-options").hidden = false;
          document.getElementById("user-dashboard-page-shell").hidden = true;
          document.getElementById("user-selected-dashboard").hidden = true;
          document.getElementById("switch-group").hidden = true;
          document.getElementById("user-about-page").hidden = true;
          document.getElementById("user-tabbar").hidden = true;
          window.__z28AboutOpen = false;
          document.getElementById("user-greeting").classList.remove("visible");
          title.textContent = tUser("groupOptions");
          renderGroupOptions(data.groups);
          updateUserBackButton();
          return;
        }
        renderSelectedDashboard(data);
      }

      async function selectUserGroup(groupId) {
        if (!Number.isSafeInteger(groupId) || groupId >= 0) return;
        ++userDashboardRequestId;
        window.__z28AboutOpen = false;
        try {
          var loaded = await loadUserDashboard(true, groupId);
          if (loaded) {
            window.__z28GroupSelectionOpen = false;
          }
        } catch (error) {
          if (document.body.classList.contains("user-dashboard-error-page")) return;
          // Keep Group Options visible until a valid group is selected successfully.
          window.__z28GroupSelectionOpen = true;
          document.getElementById("user-group-options").hidden = false;
          document.getElementById("user-dashboard-page-shell").hidden = true;
          document.getElementById("user-selected-dashboard").hidden = true;
          document.getElementById("switch-group").hidden = true;
          document.getElementById("user-greeting").classList.remove("visible");
          title.textContent = tUser("groupOptions");
          showNotice(error && error.message ? error.message : "Unable to open the selected group.","error");
        }
      }

      function validateUserSettingEditor(editor, showError) {
        if (!editor) return false;
        var invalid = false;
        var hasUnsavedChanges = false;
        editor.querySelectorAll("input[data-original-value]").forEach(function(input) {
          var value = Number(input.value);
          var originalValue = input.getAttribute("data-original-value");
          var fieldInvalid = !Number.isSafeInteger(value) || value <= 0;
          input.classList.toggle("is-invalid", fieldInvalid);
          input.setAttribute("aria-invalid", fieldInvalid ? "true" : "false");
          if (fieldInvalid) invalid = true;
          if (input.value !== originalValue) hasUnsavedChanges = true;
        });
        var error = editor.querySelector(".user-setting-editor-error");
        if (error) error.hidden = !(showError && invalid);
        var status = editor.querySelector(".user-setting-editor-status");
        if (status) status.hidden = !hasUnsavedChanges;
        updateUserSettingChangeSummary(editor);
        var saveButton = editor.querySelector(".user-setting-save");
        if (saveButton && !saveButton.dataset.saving) {
          var disabled = invalid || !hasUnsavedChanges;
          saveButton.disabled = disabled;
          saveButton.setAttribute("aria-disabled", disabled ? "true" : "false");
        }
        return !invalid;
      }

      function updateUserSettingChangeSummary(editor, errorMessage) {
        if (!editor) return;
        var summary = editor.querySelector(".user-setting-change-summary");
        if (!summary) return;
        var changes = [];
        var labels = { eat: tUser("activityEat"), wc: tUser("activityWc"), smoke: tUser("activitySmoke"), wcd: tUser("activityWcd") };
        editor.querySelectorAll("input[data-original-value]").forEach(function(input) {
          if (input.value === input.getAttribute("data-original-value")) return;
          var kind = input.getAttribute("data-kind") || "";
          changes.push("<strong>" + escapeHtml(labels[kind] || kind.toUpperCase()) + "</strong> " + escapeHtml(input.getAttribute("data-original-value")) + " → " + escapeHtml(input.value));
        });
        if (!changes.length && !errorMessage) { summary.hidden = true; summary.classList.remove("is-error"); summary.textContent = ""; return; }
        summary.hidden = false;
        summary.classList.toggle("is-error", Boolean(errorMessage));
        summary.innerHTML = errorMessage ? escapeHtml(errorMessage) : "<span>" + escapeHtml(tUser("changesToSave")) + ":</span> " + changes.join(", ");
      }

      function bindUserSettingButtons() {
        document.querySelectorAll(".user-setting-edit").forEach(function(button) {
          button.onclick = function() {
            var card = button.closest(".user-setting-card");
            if (!card) return;
            var view = card.querySelector(".user-setting-view");
            var editor = card.querySelector(".user-setting-editor");
            if (!view || !editor) return;
            view.hidden = true;
            editor.hidden = false;
            validateUserSettingEditor(editor, false);
            var firstInput = editor.querySelector("input");
            if (firstInput) firstInput.focus();
          };
        });

        document.querySelectorAll(".user-setting-editor input").forEach(function(input) {
          input.oninput = function() {
            var editor = input.closest(".user-setting-editor");
            if (!editor) return;
            var status = editor.querySelector(".user-setting-editor-status");
            if (!status) return;
            validateUserSettingEditor(editor, true);
            var hasUnsavedChanges = Array.from(editor.querySelectorAll("input[data-original-value]")).some(function(field) {
              return field.value !== field.getAttribute("data-original-value");
            });
            status.hidden = !hasUnsavedChanges;
            updateUserSettingChangeSummary(editor);
          };
        });

        document.querySelectorAll(".user-setting-editor input").forEach(function(input) {
          input.onkeydown = function(event) {
            var editor = input.closest(".user-setting-editor");
            if (!editor) return;
            if (event.key === "Escape") {
              event.preventDefault();
              var cancelButton = editor.querySelector(".user-setting-cancel");
              if (cancelButton) cancelButton.click();
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              var saveButton = editor.querySelector(".user-setting-save");
              if (saveButton && !saveButton.disabled) saveButton.click();
            }
          };
        });

        document.querySelectorAll(".user-setting-cancel").forEach(function(button) {
          button.onclick = function() {
            var card = button.closest(".user-setting-card");
            if (!card) return;
            var view = card.querySelector(".user-setting-view");
            var editor = card.querySelector(".user-setting-editor");
            if (!view || !editor) return;
            editor.querySelectorAll("input[data-original-value]").forEach(function(input) {
              input.value = input.getAttribute("data-original-value");
              input.classList.remove("is-invalid");
              input.setAttribute("aria-invalid", "false");
            });
            var error = editor.querySelector(".user-setting-editor-error");
            if (error) error.hidden = true;
            var status = editor.querySelector(".user-setting-editor-status");
            if (status) status.hidden = true;
            editor.hidden = true;
            view.hidden = false;
          };
        });

        document.querySelectorAll(".user-setting-save").forEach(function(button) {
          button.onclick = async function() {
            var type = button.getAttribute("data-setting-type");
            var groupId = Number(button.getAttribute("data-group-id"));
            var card = button.closest(".user-setting-card");
            var editor = card.querySelector(".user-setting-editor");
            var inputs = Array.from(editor.querySelectorAll("input"));
            var original = button.textContent;
            var successfulInputs = [];
            button.disabled = true;
            button.dataset.saving = "true";
            button.setAttribute("aria-disabled", "true");
            button.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> ' + escapeHtml(tUser("saving")) + '…';
            try {
              if (!validateUserSettingEditor(editor, true)) throw new Error(tUser("invalidSettingValue"));
              for (var i = 0; i < inputs.length; i += 1) {
                var input = inputs[i];
                if (input.value === input.getAttribute("data-original-value")) continue;
                var value = Number(input.value);
                var kind = input.getAttribute("data-kind");
                if (!Number.isSafeInteger(value) || value <= 0) throw new Error(tUser("invalidSettingValue"));
                try {
                  await apiUserSettings(groupId, type, kind, value);
                  input.setAttribute("data-original-value", input.value);
                  successfulInputs.push(input);
                } catch (error) {
                  throw error;
                }
              }
              inputs.forEach(function(input) { input.classList.remove("is-invalid"); input.setAttribute("aria-invalid", "false"); });
              updateUserSettingChangeSummary(editor);
              button.innerHTML = "✓ " + escapeHtml(tUser("saved"));
              window.setTimeout(function(){ button.textContent = original; delete button.dataset.saving; button.disabled=false; button.setAttribute("aria-disabled", "false"); },1500);
              if (document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur();
              await loadUserDashboard(false, groupId);
            } catch(error) {
              delete button.dataset.saving;
              button.disabled=false;
              button.setAttribute("aria-disabled", "false");
              button.textContent=original;
              validateUserSettingEditor(editor, true);
              var remainingDirty = inputs.some(function(input) { return input.value !== input.getAttribute("data-original-value"); });
              var message = error && error.message ? error.message : tUser("saveFailed");
              var recoveryMessage = successfulInputs.length && remainingDirty ? tUser("savePartialFailure") : message;
              updateUserSettingChangeSummary(editor, recoveryMessage);
              showNotice(recoveryMessage, "error");
            }
          };
        });
      }

      async function createAdminSession() {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");
        var response = await fetch("/api/admin/session", { method: "POST", headers: headers });
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "Unable to create admin session.");
        }
        if (!data.session) throw new Error("Unable to create admin session.");
        adminSessionToken = String(data.session);
        void loadAdminNotifications();
        return data;
      }

      async function apiUserMode() {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");

        var controller = typeof AbortController === "function" ? new AbortController() : null;
        var timeout = controller
          ? window.setTimeout(function () { controller.abort(); }, 8000)
          : null;
        var response;
        try {
          response = await fetch("/api/user/mode", {
            method: "GET",
            headers: headers,
            signal: controller ? controller.signal : undefined
          });
        } catch (error) {
          if (error && error.name === "AbortError") {
            throw new Error("Access check timed out. Please reopen the Mini App.");
          }
          throw error;
        } finally {
          if (timeout !== null) window.clearTimeout(timeout);
        }
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Unable to determine access mode."
          );
        }
        return data;
      }

      async function apiUserDashboard(userId, groupId) {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");
        headers.set("Content-Type", "application/json");
        var body = { userId: Number(userId) };
        if (groupId !== undefined) body.groupId = Number(groupId);
        var response = await fetch("/api/user/dashboard",{method:"POST",headers:headers,body:JSON.stringify(body)});
        var data = await response.json().catch(function(){return {};});
        if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Unable to load your dashboard.");
        return data;
      }

      async function apiUserSettings(groupId,type,kind,value) {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");
        headers.set("Content-Type", "application/json");
        var response = await fetch("/api/user/settings",{method:"PUT",headers:headers,
          body:JSON.stringify({groupId:Number(groupId),type:type,kind:kind,value:Number(value)})});
        var data = await response.json().catch(function(){return {};});
        if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Unable to save group settings.");
        return data;
      }

      async function loadUserDashboard(withLoading, groupId) {
        if (!telegramUserId) throw new Error("Unable to identify your Telegram account.");
        if (window.__z28AboutOpen) return true;
        var requestId = ++userDashboardRequestId;
        var showLoader = withLoading !== false;
        var phase = "request";
        if (showLoader) showUserLoading(true);
        try {
          var data;
          try {
            data = await apiUserDashboard(telegramUserId,groupId);
          } catch (error) {
            phase = "api";
            throw error;
          }

          var groupSelectionRequestBlocked =
            window.__z28GroupSelectionOpen && groupId === undefined;
          if (
            requestId !== userDashboardRequestId ||
            groupSelectionRequestBlocked ||
            window.__z28AboutOpen ||
            isUserSettingsEditing()
          ) {
            return false;
          }
          if (!data || typeof data !== "object") {
            throw new Error("Dashboard API returned an invalid response.");
          }
          if (!data.hasGroups) {
            showUserNoGroupScreen();
            return false;
          }

          try {
            phase = "render";
            rememberVerifiedUserId(telegramUserId);
            document.getElementById("user-dashboard-error-screen").hidden = true;
            document.body.classList.remove("user-verification-page", "user-dashboard-error-page", "user-no-group-page");
            document.body.classList.add("user-dashboard-page");
            document.getElementById("user-verify-card").classList.remove("visible");
            renderUserDashboard(data);
          } catch (error) {
            var renderMessage = error && error.message ? error.message : String(error || "Unknown render error.");
            console.error("[user-dashboard] render failed", {
              message: renderMessage,
              stack: error instanceof Error ? error.stack : undefined
            });
            throw new Error("Dashboard render failed: " + renderMessage);
          }
          return true;
        } catch (error) {
          var message = error && error.message ? error.message : String(error || "Unable to load your dashboard.");
          if (phase === "api") {
            message = "Dashboard API failed: " + message;
          }
          if (requestId === userDashboardRequestId && !window.__z28AboutOpen && !isUserSettingsEditing()) {
            showUserDashboardError(new Error(message), groupId);
          }
          throw new Error(message);
        } finally {
          if (showLoader) showUserLoading(false);
        }
      }

      function escapeHtml(value) {
        var text = String(value);
        return text.replace(/[&<>"']/g, function (char) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
        });
      }

      document.getElementById("refresh").addEventListener("click", function() {
        var button=document.getElementById("refresh");
        var groupOptions = document.getElementById("user-group-options");
        if (userMode && (window.__z28AboutOpen || (groupOptions && !groupOptions.hidden))) return;
        if (userMode && hasUserSettingUnsavedChanges()) {
          showNotice(tUser("unsavedRefreshWarning"), "error");
          return;
        }
        runAction(button,"Refreshing…",async function(){
          if(userMode){
            var verified=getVerifiedUserId();
            if(verified) await loadUserDashboard(false,window.__z28SelectedGroupId);
            else {
              showUserVerificationPage();
            }
          } else await load();
        },"Refresh").catch(function(error){showNotice(error && error.message ? error.message : "Refresh failed.","error");});
      });

      function setUserDashboardTab(tab) {
        if (!document.body.classList.contains("user-dashboard-page")) return;
        if (window.__z28GroupSelectionOpen) return;

        var dashboardPage = document.getElementById("user-selected-dashboard");
        var dashboardPageShell = document.getElementById("user-dashboard-page-shell");
        var aboutPage = document.getElementById("user-about-page");
        var tabbar = document.getElementById("user-tabbar");
        var refreshButton = document.getElementById("refresh");
        var switchButton = document.getElementById("switch-group");
        var greeting = document.getElementById("user-greeting");
        var isAbout = tab === "about";

        saveUserDashboardState({ tab: tab });
        ++userDashboardRequestId;
        window.__z28AboutOpen = isAbout;
        dashboardPage.hidden = isAbout;
        dashboardPageShell.hidden = isAbout;
        aboutPage.hidden = !isAbout;
        tabbar.hidden = false;
        refreshButton.hidden = isAbout;
        switchButton.hidden = isAbout;

        document.querySelectorAll("[data-user-tab]").forEach(function(button) {
          var active = button.getAttribute("data-user-tab") === tab;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
        });

        if (isAbout) {
          dashboardPageShell.hidden = true;
          greeting.classList.remove("visible");
          title.textContent = tUser("about");
        } else {
          dashboardPageShell.hidden = false;
          greeting.classList.add("visible");
          title.textContent = tUser("title");
          renderUserGreeting();
        }
        updateUserBackButton();
      }

      document.querySelectorAll("[data-user-tab]").forEach(function(button) {
        button.addEventListener("click", function() {
          setUserDashboardTab(button.getAttribute("data-user-tab"));
        });
      });

      document.getElementById("switch-group").addEventListener("click", function() {
        var button=document.getElementById("switch-group");
        var groupOptions=document.getElementById("user-group-options");
        var selectedDashboard=document.getElementById("user-selected-dashboard");
        var greeting=document.getElementById("user-greeting");
        if (window.__z28GroupSelectionOpen) return;
        if (hasUserSettingUnsavedChanges()) {
          showNotice(tUser("unsavedSwitchWarning"), "error");
          return;
        }

        ++userDashboardRequestId;
        window.__z28GroupSelectionOpen = true;
        button.disabled = true;

        // Enter a dedicated selection state immediately.
        groupOptions.hidden = false;
        document.getElementById("user-dashboard-page-shell").hidden = true;
        selectedDashboard.hidden = true;
        document.getElementById("user-about-page").hidden = true;
        document.getElementById("user-tabbar").hidden = true;
        window.__z28AboutOpen = false;
        button.hidden = true;
        greeting.classList.remove("visible");
        title.textContent = tUser("groupOptions");
        updateUserBackButton();

        apiUserDashboard(telegramUserId).then(function(data){
          renderGroupOptions(data.groups || []);
        }).catch(function(error){
          // Restore the previous dashboard only when loading the group list fails.
          window.__z28GroupSelectionOpen = false;
          groupOptions.hidden = true;
          selectedDashboard.hidden = false;
          document.getElementById("user-about-page").hidden = true;
          document.getElementById("user-tabbar").hidden = false;
          window.__z28AboutOpen = false;
          button.hidden = false;
          title.textContent = tUser("title");
          greeting.classList.add("visible");
          renderUserGreeting();
          updateUserBackButton();
          showNotice(error && error.message ? error.message : "Unable to load groups.","error");
        }).finally(function(){
          button.disabled = false;
        });
      });



      function bindUserLanguageControl(buttonId, menuId) {
        var button = document.getElementById(buttonId);
        var menu = document.getElementById(menuId);
        if (!button || !menu) return;
        button.addEventListener("click", function () {
          var open = menu.hidden;
          menu.hidden = !open;
          this.setAttribute("aria-expanded", String(open));
        });
      }

      bindUserLanguageControl("user-language-button", "user-language-menu");
      bindUserLanguageControl("user-dashboard-language-button", "user-dashboard-language-menu");

      document.querySelectorAll(".user-language-option").forEach(function (option) {
        option.addEventListener("click", function () {
          var selected = option.getAttribute("data-user-lang");
          if (selected !== "en" && selected !== "my" && selected !== "zh") return;
          if (
            userMode &&
            document.body.classList.contains("user-dashboard-page") &&
            hasUserSettingUnsavedChanges()
          ) {
            showNotice(tUser("unsavedLanguageWarning"), "error");
            return;
          }
          userLanguage = selected;
          try { localStorage.setItem(userLanguageKey, userLanguage); } catch {}
          document.querySelectorAll(".user-language-menu").forEach(function(menu) {
            menu.hidden = true;
          });
          document.querySelectorAll(".user-language-button").forEach(function(button) {
            button.setAttribute("aria-expanded", "false");
          });
          applyUserLanguage();

        });
      });

      var userIdInput = document.getElementById("user-id-input");
      var userConfirm = document.getElementById("user-confirm");

      if (userIdInput && userConfirm) {
        userIdInput.addEventListener("input", function () {
          var value = userIdInput.value.trim().replace(/\D/g, "");
          userIdInput.value = value;
          var ready = value.length > 0;
          userConfirm.disabled = !ready;
          userConfirm.classList.toggle("ready", ready);
        });

        userConfirm.addEventListener("click", async function () {
          var entered = userIdInput.value.trim();
          if (!entered || !/^\d+$/.test(entered) || !telegramUserId) return;

          if (Number(entered) !== Number(telegramUserId)) {
            showNotice(tUser("idMismatch"), "error");
            return;
          }

          userConfirm.disabled = true;
          userConfirm.classList.remove("ready");
          try {
            if (adminVerificationMode) {
              setPanelVisibility("admin");
              document.body.classList.remove("admin-verification-page");
              title.textContent = "Administration";
              rememberVerifiedAdminId(telegramUserId);
              await createAdminSession();
              await load();
              hideSplash();
              startAdminDashboardRefresh();
              userConfirm.innerHTML = "Confirmed";
            } else {
              var opened = await loadUserDashboard();
              if (opened) userConfirm.innerHTML = "Confirmed";
            }
          } catch (error) {
            showNotice(error && error.message ? error.message : "Verification failed.", "error");
            userConfirm.disabled = false;
            userConfirm.classList.add("ready");
          }
        });
      }

      async function initializeMode() {
        if (userPageMode) {
          setPanelVisibility("user");
          document.body.classList.remove("user-verification-page", "admin-verification-page");
          title.textContent = telegramUserId ? String(telegramUserId) + " " + tUser("title") : tUser("title");
          var storedUserId = getVerifiedUserId();
          var currentUserId = telegramUserId ? String(telegramUserId) : "";
          if (storedUserId && currentUserId && storedUserId === currentUserId) {
            await loadUserDashboard();
          } else {
            showUserVerificationPage();
          }
          hideSplash();
          return;
        }

        if (groupMode) {
          setPanelVisibility("group");
          document.body.classList.remove("user-verification-page", "admin-verification-page", "user-dashboard-page");
          title.textContent = "⚙️ Group Admin Panel";
          try {
            await load();
          } catch (error) {
            showNotice(error && error.message ? error.message : "Unable to load the group admin panel.", "error");
          } finally {
            hideSplash();
          }
          return;
        }

        try {
          var modeData = await apiUserMode();
          if (modeData.isConfiguredAdmin) {
            setPanelVisibility("admin");
            document.body.classList.remove("user-verification-page", "admin-verification-page", "user-dashboard-page");
            title.textContent = "Administration";
            await createAdminSession();
            await load();
            hideSplash();
            startAdminDashboardRefresh();
          } else {
            setPanelVisibility("user");
            document.body.classList.remove("user-verification-page", "admin-verification-page");
            title.textContent = telegramUserId ? String(telegramUserId) + " " + tUser("title") : tUser("title");
            var storedUserId = getVerifiedUserId();
            var currentUserId = telegramUserId ? String(telegramUserId) : "";
            if (storedUserId && currentUserId && storedUserId === currentUserId) {
              await loadUserDashboard();
            } else {
              showUserVerificationPage();
            }
            hideSplash();
          }
        } catch (error) {
          setPanelVisibility("user");
          if (!document.body.classList.contains("user-dashboard-error-page")) {
            showUserVerificationPage();
            title.textContent = "User Access";
            showNotice(error && error.message ? error.message : "Unable to open the user dashboard.", "error");
          }
          hideSplash();
        }
      }

      document.getElementById("save-limits").addEventListener("click", function () {
        var operations = [
          ["eat", "limit-eat"],
          ["wc", "limit-wc"],
          ["smoke", "limit-smoke"],
          ["wcd", "limit-wcd"]
        ];
        (async function () {
          var button = document.getElementById("save-limits");
          try {
            await runAction(
              button,
              "Saving…",
              async function () {
                for (var i = 0; i < operations.length; i += 1) {
                  var minutes = positiveInteger(operations[i][1]);
                  if (minutes === undefined) throw new Error("Enter positive integers for all activity limits.");
                  await api("/activity-limits", {
                    method: "PUT",
                    body: JSON.stringify({ kind: operations[i][0], minutes: minutes })
                  });
                }
                await load();
              },
              "Save Limits",
              "success-limits"
            );
          } catch (error) {
            showNotice(error && error.message ? error.message : "Save failed.", "error");
          }
        })();
      });

      document.getElementById("save-counts").addEventListener("click", function () {
        var operations = [
          ["wc", "count-wc"],
          ["smoke", "count-smoke"],
          ["wcd", "count-wcd"]
        ];
        (async function () {
          var button = document.getElementById("save-counts");
          try {
            await runAction(
              button,
              "Saving…",
              async function () {
                for (var i = 0; i < operations.length; i += 1) {
                  var count = positiveInteger(operations[i][1]);
                  if (count === undefined) throw new Error("Enter positive integers for all count limits.");
                  await api("/count-limits", {
                    method: "PUT",
                    body: JSON.stringify({ kind: operations[i][0], count: count })
                  });
                }
                await load();
              },
              "Save Count Limits",
              "success-counts"
            );
          } catch (error) {
            showNotice(error && error.message ? error.message : "Save failed.", "error");
          }
        })();
      });


      var adminFolders = {
        dashboard: ["admin-overview", "admin-health"],
        management: ["admin-users-management", "admin-groups-management"],
        analytics: ["admin-analytics"],
        configuration: ["admin-duration", "admin-counts", "admin-automation"],
        operations: ["admin-broadcast", "admin-backup", "admin-maintenance"],
        security: ["admin-audit"]
      };

      var adminFolderLabels = {
        dashboard: "Dashboard",
        management: "Management",
        analytics: "Analytics",
        configuration: "Configuration",
        operations: "Operations",
        security: "Security"
      };

      var activeAdminFolder = "dashboard";

      function loadAdminFolder(folder) {
        if (folder === "dashboard") {
          return Promise.all([load(), loadAdminHealth().catch(function () {})]);
        }
        if (folder === "management") {
          return Promise.all([loadAdminUsers(true), loadAdminGroups(true)]);
        }
        if (folder === "analytics") return loadAdminAnalytics();
        if (folder === "security") return loadAdminAudit(true);
        return load();
      }

      function setAdminFolder(folder, shouldLoad) {
        if (!adminFolders[folder]) folder = "dashboard";
        activeAdminFolder = folder;

        document.querySelectorAll("[data-admin-folder]").forEach(function(button) {
          button.classList.toggle("active", button.getAttribute("data-admin-folder") === folder);
        });

        Object.keys(adminFolders).forEach(function(key) {
          adminFolders[key].forEach(function(sectionId) {
            var section = document.getElementById(sectionId);
            if (section) section.classList.toggle("admin-folder-visible", key === folder);
          });
        });

        var heading = document.querySelector(".admin-heading");
        var subtitle = document.querySelector(".admin-heading-sub");
        var descriptions = {
          dashboard: "Live bot overview and infrastructure diagnostics.",
          management: "Manage users and groups from one protected workspace.",
          analytics: "Review activity trends and export attendance reports.",
          configuration: "Configure global activity limits and automation.",
          operations: "Run announcements, backups, and maintenance tasks.",
          security: "Review protected administrative history and controls."
        };
        if (heading) heading.textContent = adminFolderLabels[folder];
        if (subtitle) subtitle.textContent = descriptions[folder];

        if (shouldLoad !== false) {
          loadAdminFolder(folder).catch(function(error) {
            showNotice(error && error.message ? error.message : "Unable to load this folder.", "error");
          });
        }
      }

      document.querySelectorAll("[data-admin-folder]").forEach(function(button) {
        button.addEventListener("click", function() {
          setAdminFolder(button.getAttribute("data-admin-folder"));
        });
      });

      setAdminFolder("dashboard", false);

      var adminGroupsSearchTimer = null;
      document.getElementById("admin-groups-search").addEventListener("input", function(){
        adminGroupsState.search=this.value.trim(); window.clearTimeout(adminGroupsSearchTimer);
        adminGroupsSearchTimer=window.setTimeout(function(){loadAdminGroups(true).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load groups.","error");});},250);
      });
      document.getElementById("admin-groups-table-body").addEventListener("click", function(event) {
        var target = event.target.closest("[data-group-health]");
        if (!target) return;
        checkAdminGroupHealth(target.getAttribute("data-group-health"));
      });

      document.getElementById("admin-groups-prev").addEventListener("click", function(){
        if(adminGroupsState.page<=1)return; adminGroupsState.page-=1;
        loadAdminGroups(false).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load groups.","error");});
      });
      document.getElementById("admin-groups-next").addEventListener("click", function(){
        if(adminGroupsState.page>=adminGroupsState.totalPages)return; adminGroupsState.page+=1;
        loadAdminGroups(false).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load groups.","error");});
      });

      document.getElementById("admin-analytics-period").addEventListener("change", function(){
        adminAnalyticsDays=Number(this.value)||30; loadAdminAnalytics().catch(function(error){showNotice(error&&error.message?error.message:"Unable to load analytics.","error");});
      });

      document.getElementById("admin-export-csv").addEventListener("click", function() {
        exportAdminCsv().catch(function(error) {
          showNotice(error && error.message ? error.message : "Unable to export report.", "error");
        });
      });

      document.getElementById("admin-retention-cleanup").addEventListener("click", function() {
        cleanupAdminAuditLogs().catch(function(error) {
          showNotice(error && error.message ? error.message : "Cleanup failed.", "error");
        });
      });

      document.getElementById("admin-backup-download").addEventListener("click", function() {
        downloadAdminBackup().catch(function(error) {
          showNotice(error && error.message ? error.message : "Backup failed.", "error");
        });
      });

      var broadcastMode = document.getElementById("admin-broadcast-mode");
      var broadcastMessage = document.getElementById("admin-broadcast-message");
      var broadcastCount = document.getElementById("admin-broadcast-count");
      if (broadcastMode) {
        broadcastMode.addEventListener("change", syncAdminBroadcastMode);
        syncAdminBroadcastMode();
      }

      document.querySelectorAll("[data-admin-broadcast-mode]").forEach(function (option) {
        option.addEventListener("click", function () {
          setAdminBroadcastMode(option.getAttribute("data-admin-broadcast-mode"));
        });
      });
      if (broadcastMessage && broadcastCount) {
        broadcastMessage.addEventListener("input", function() {
          broadcastCount.textContent = String(broadcastMessage.value.length) + " / 4000";
        });
      }
      document.getElementById("admin-broadcast-send").addEventListener("click", function() {
        sendAdminBroadcast().catch(function(error) {
          showNotice(error && error.message ? error.message : "Broadcast failed.", "error");
        });
      });

      document.getElementById("admin-health-refresh").addEventListener("click", function() {
        runAction(document.getElementById("admin-health-refresh"), "Checking…", loadAdminHealth, "Check now").then(function() {
          showNotice("System health check completed.", "ok");
        }).catch(function(error) {
          showNotice(error && error.message ? error.message : "Unable to check system health.", "error");
        });
      });

      var adminAuditSearchTimer = null;
      document.getElementById("admin-audit-search").addEventListener("input", function(){
        adminAuditState.search=this.value.trim(); window.clearTimeout(adminAuditSearchTimer);
        adminAuditSearchTimer=window.setTimeout(function(){loadAdminAudit(true).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load audit history.","error");});},250);
      });
      document.getElementById("admin-audit-filter").addEventListener("change", function(){
        adminAuditState.action=this.value; loadAdminAudit(true).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load audit history.","error");});
      });
      document.getElementById("admin-audit-prev").addEventListener("click", function(){
        if(adminAuditState.page<=1)return; adminAuditState.page-=1; loadAdminAudit(false).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load audit history.","error");});
      });
      document.getElementById("admin-audit-next").addEventListener("click", function(){
        if(adminAuditState.page>=adminAuditState.totalPages)return; adminAuditState.page+=1; loadAdminAudit(false).catch(function(error){showNotice(error&&error.message?error.message:"Unable to load audit history.","error");});
      });

      var adminUsersSearchTimer = null;
      document.getElementById("admin-users-search").addEventListener("input", function(){
        adminUsersState.search = this.value.trim();
        window.clearTimeout(adminUsersSearchTimer);
        adminUsersSearchTimer = window.setTimeout(function(){
          loadAdminUsers(true).catch(function(error){showNotice(error && error.message ? error.message : "Unable to load users.","error");});
        },250);
      });
      document.getElementById("admin-users-filter").addEventListener("change", function(){
        adminUsersState.status = this.value;
        loadAdminUsers(true).catch(function(error){showNotice(error && error.message ? error.message : "Unable to load users.","error");});
      });
      document.getElementById("admin-users-prev").addEventListener("click", function(){
        if (adminUsersState.page <= 1) return;
        adminUsersState.page -= 1;
        loadAdminUsers(false).catch(function(error){showNotice(error && error.message ? error.message : "Unable to load users.","error");});
      });
      document.getElementById("admin-users-next").addEventListener("click", function(){
        if (adminUsersState.page >= adminUsersState.totalPages) return;
        adminUsersState.page += 1;
        loadAdminUsers(false).catch(function(error){showNotice(error && error.message ? error.message : "Unable to load users.","error");});
      });

      document.getElementById("admin-refresh").addEventListener("click", function() {
        runAction(
          document.getElementById("admin-refresh"),
          "Refreshing…",
          load,
          "Refresh"
        ).catch(function(error) {
          showNotice(error && error.message ? error.message : "Refresh failed.", "error");
        });
      });

      document.getElementById("admin-save-duration").addEventListener("click", function() {
        var button = document.getElementById("admin-save-duration");
        runAction(button, "Saving…", async function() {
          var operations = [
            ["eat", "admin-limit-eat"],
            ["wc", "admin-limit-wc"],
            ["smoke", "admin-limit-smoke"],
            ["wcd", "admin-limit-wcd"]
          ];
          for (var i = 0; i < operations.length; i += 1) {
            var minutes = positiveInteger(operations[i][1]);
            if (minutes === undefined) throw new Error("Enter a positive whole number for every duration.");
            await api("/activity-limits", {
              method: "PUT",
              body: JSON.stringify({ kind: operations[i][0], minutes: minutes })
            });
          }
          await load();
        }, "Save duration limits").then(function() {
          showNotice("Duration limits saved successfully.", "ok");
        }).catch(function(error) {
          showNotice(error && error.message ? error.message : "Unable to save duration limits.", "error");
        });
      });

      document.getElementById("admin-save-counts").addEventListener("click", function() {
        var button = document.getElementById("admin-save-counts");
        runAction(button, "Saving…", async function() {
          var operations = [
            ["wc", "admin-count-wc"],
            ["smoke", "admin-count-smoke"],
            ["wcd", "admin-count-wcd"]
          ];
          for (var i = 0; i < operations.length; i += 1) {
            var count = positiveInteger(operations[i][1]);
            if (count === undefined) throw new Error("Enter a positive whole number for every daily limit.");
            await api("/count-limits", {
              method: "PUT",
              body: JSON.stringify({ kind: operations[i][0], count: count })
            });
          }
          await load();
        }, "Save daily limits").then(function() {
          showNotice("Daily activity limits saved successfully.", "ok");
        }).catch(function(error) {
          showNotice(error && error.message ? error.message : "Unable to save daily limits.", "error");
        });
      });

      document.getElementById("admin-save-reminder").addEventListener("click", function() {
        var button = document.getElementById("admin-save-reminder");
        runAction(button, "Saving…", async function() {
          var data = await api("/reminder", {
            method: "PUT",
            body: JSON.stringify({ enabled: document.getElementById("admin-reminder").checked })
          });
          document.getElementById("admin-reminder").checked = data.reminderEnabled;
          await load();
        }, "Save automation").then(function() {
          showNotice("Automation settings saved successfully.", "ok");
        }).catch(function(error) {
          showNotice(error && error.message ? error.message : "Unable to save automation settings.", "error");
        });
      });

      if (!groupMode) {
        document.getElementById("save-reminder").addEventListener("click", function () {
          (async function () {
            var button = document.getElementById("save-reminder");
            try {
              await runAction(
                button,
                "Saving…",
                async function () {
                  var data = await api("/reminder", {
                    method: "PUT",
                    body: JSON.stringify({ enabled: document.getElementById("reminder").checked })
                  });
                  document.getElementById("reminder").checked = data.reminderEnabled;
                },
                "Save Reminder",
                "success-reminder"
              );
            } catch (error) {
              showNotice(error && error.message ? error.message : "Save failed.", "error");
            }
          })();
        });
      } else {
        document.getElementById("save-connect").addEventListener("click", function () {
          var target = document.getElementById("target").value.trim();
          if (!target) {
            showNotice("Enter a target group ID or public group link.", "error");
            return;
          }
          setBusy(true);
          api("/connect", {
            method: "PUT",
            body: JSON.stringify({ target: target })
          }).then(function (data) {
            document.getElementById("connection").innerHTML =
              "<strong>Connected target</strong>" + escapeHtml(data.connection.targetGroupName) + " (" + escapeHtml(String(data.connection.targetChatId)) + ")";
            document.getElementById("target").value = String(data.connection.targetChatId);
            showNotice("Group connection saved.", "ok");
          }).catch(function (error) {
            showNotice(error && error.message ? error.message : "Save failed.", "error");
          }).finally(function () {
            setBusy(false);
          });
        });
      }

      document.getElementById("user-dashboard-error-retry").addEventListener("click", function() {
        var button=document.getElementById("user-dashboard-error-retry");
        if(button.disabled)return;
        var groupId=window.__z28DashboardErrorGroupId;
        button.disabled=true;button.textContent=tUser("saving");
        loadUserDashboard(true,groupId).then(function(opened){
          if(opened){document.getElementById("user-dashboard-error-screen").hidden=true;document.body.classList.remove("user-dashboard-error-page");}
        }).catch(function(error){showNotice(error&&error.message?error.message:tUser("dashboardLoadError"),"error");}).finally(function(){
          if(document.body.classList.contains("user-dashboard-error-page")){button.disabled=false;button.textContent=tUser("retry");}
        });
      });

      loadUserLanguage();
      applyUserLanguage();
      initializeMode().catch(function (error) {
        handleStartupFailure(error);
      });
    })();
