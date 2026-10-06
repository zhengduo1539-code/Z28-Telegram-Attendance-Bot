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
    normalUserMode: false,
    dashboard: null,
    requestId: 0,
    appReady: false,
    settingsSaving: false,
    groupPickerOpen: false,
    aboutOpen: false,
    supportOpen: false,
    toolsOpen: false,
    toolDetail: null,
    connectEditMode: false,
    connectEditSnapshot: null,
    connectLoading: false,
    connectSaving: false,
    connectRequestId: 0,
    replyEditorData: null,
    replyOriginalSnapshot: "",
    replyLocale: "en",
    replyRequestId: 0,
    replyLoading: false,
    replySaving: false,
    replyDirty: false,
    connectGuideVisible: true,
    appearanceOpen: false,
    onboardingVisible: true,
    appearanceTheme: "dark",
    wallpaper: "default",
    backgroundEffect: "none",
    backgroundEffectIntensity: "medium",
    customWallpaper: null,
    animationsEnabled: true,
    compactMode: false,
    textSize: "standard",
    highContrast: false,
    workspaceName: "My Workspace",
    themeCreator: {
      enabled: false,
      primary: "#48a8ff",
      secondary: "#7a68ff",
      glow: 60,
      radius: 18,
      background: 70
    },
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
    connectGuide: "z28_connect_guide_visible",
    autoRefresh: "z28_user_auto_refresh",
    onboarding: "z28_user_onboarding_v1",
    appearanceTheme: "z28_appearance_theme",
    wallpaper: "z28_appearance_wallpaper",
    wallpaperCustom: "z28_appearance_wallpaper_custom",
    backgroundEffect: "z28_appearance_background_effect",
    backgroundEffectIntensity: "z28_appearance_background_effect_intensity",
    animations: "z28_appearance_animations",
    compactMode: "z28_appearance_compact",
    textSize: "z28_appearance_text_size",
    highContrast: "z28_appearance_high_contrast",
    workspaceName: "z28_workspace_name",
    themeCreator: "z28_appearance_theme_creator"
  };

  var DEFAULTS = {
    duration: { eat: 30, wc: 7, smoke: 7, wcd: 15 },
    count: { eat: Infinity, wc: 7, smoke: 7, wcd: 2 }
  };

  var THEME_PALETTES = {
    dark: { primary: "#48a8ff", secondary: "#7a68ff" },
    midnight: { primary: "#8a91ff", secondary: "#63b9ff" },
    amoled: { primary: "#72d8ff", secondary: "#9a8cff" },
    ocean: { primary: "#27c9ff", secondary: "#3d7dff" },
    violet: { primary: "#a66cff", secondary: "#5d7cff" },
    mint: { primary: "#35e0b3", secondary: "#37a8ff" },
    sunset: { primary: "#ff9a62", secondary: "#ff5e93" },
    light: { primary: "#2f8cff", secondary: "#6d63ff" },
    white: { primary: "#2274ff", secondary: "#6257e8" }
  };

  var THEME_CREATOR_DEFAULTS = {
    enabled: false,
    primary: "#48a8ff",
    secondary: "#7a68ff",
    glow: 60,
    radius: 18,
    background: 70
  };

  var BACKGROUND_EFFECTS = ["none","dollar","coins","hacker"];
  var BACKGROUND_EFFECT_INTENSITIES = ["low","medium","high"];
  var backgroundEffectEngine = {
    canvas: null, ctx: null, width: 0, height: 0, mode: "none", intensity: "medium",
    particles: [], columns: [], raf: 0, lastFrame: 0, running: false, initialized: false, resizeTimer: null,
    reducedMotion: Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  };

  function effectDensity() {
    var base = { low: 16, medium: 26, high: 38 }[backgroundEffectEngine.intensity] || 26;
    return Math.max(10, Math.round(base * Math.min(1.55, Math.max(.72, backgroundEffectEngine.width / 390))));
  }
  function effectSpeed() {
    return { low: .68, medium: 1, high: 1.32 }[backgroundEffectEngine.intensity] || 1;
  }
  function createDollar(initial) {
    var size = 12 + Math.random() * 13;
    return {
      x: Math.random() * backgroundEffectEngine.width,
      y: initial ? Math.random() * backgroundEffectEngine.height : -size - Math.random() * 80,
      speed: 24 + Math.random() * 42,
      drift: (Math.random() - .5) * 12,
      rotation: (Math.random() - .5) * .5,
      spin: (Math.random() - .5) * .012,
      size: size,
      alpha: .42 + Math.random() * .34,
      glyph: Math.random() > .7 ? "$" + (Math.random() > .5 ? "100" : "500") : "$"
    };
  }
  function createCoin(initial) {
    var size = 11 + Math.random() * 9;
    return {
      x: Math.random() * backgroundEffectEngine.width,
      y: initial ? Math.random() * backgroundEffectEngine.height : -size * 2 - Math.random() * 80,
      speed: 30 + Math.random() * 48,
      drift: (Math.random() - .5) * 15,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() > .5 ? 1 : -1) * (.045 + Math.random() * .055),
      size: size,
      alpha: .38 + Math.random() * .34
    };
  }
  function resetHacker(initial) {
    var gap = { low: 26, medium: 22, high: 18 }[backgroundEffectEngine.intensity] || 22;
    var count = Math.ceil(backgroundEffectEngine.width / gap);
    backgroundEffectEngine.columns = [];
    for (var i = 0; i < count; i += 1) {
      backgroundEffectEngine.columns.push({
        x: i * gap + Math.random() * 8,
        y: initial ? Math.random() * backgroundEffectEngine.height : -Math.random() * backgroundEffectEngine.height * .35,
        speed: 42 + Math.random() * 76,
        size: 8 + Math.random() * 4,
        length: { low: 3, medium: 5, high: 7 }[backgroundEffectEngine.intensity] || 5,
        phase: Math.random() * Math.PI * 2,
        chars: "01ZX28<>/{}[]#$*+=~"
      });
    }
  }
  function resetEffectParticles(initial) {
    backgroundEffectEngine.particles = [];
    if (backgroundEffectEngine.mode === "hacker") {
      resetHacker(Boolean(initial));
      return;
    }
    if (backgroundEffectEngine.mode === "dollar" || backgroundEffectEngine.mode === "coins") {
      for (var i = 0; i < effectDensity(); i += 1) {
        backgroundEffectEngine.particles.push(
          backgroundEffectEngine.mode === "dollar" ? createDollar(Boolean(initial)) : createCoin(Boolean(initial))
        );
      }
    }
  }
  function resizeBackgroundEffects() {
    if (!backgroundEffectEngine.canvas || !backgroundEffectEngine.ctx) return;
    var w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    var h = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    var dpr = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
    backgroundEffectEngine.width = w;
    backgroundEffectEngine.height = h;
    backgroundEffectEngine.canvas.width = Math.floor(w * dpr);
    backgroundEffectEngine.canvas.height = Math.floor(h * dpr);
    backgroundEffectEngine.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    backgroundEffectEngine.ctx.textBaseline = "middle";
    resetEffectParticles(true);
  }
  function drawDollar(p) {
    var c = backgroundEffectEngine.ctx;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.rotation);
    c.font = "800 " + p.size.toFixed(1) + "px ui-sans-serif,system-ui,sans-serif";
    c.fillStyle = "rgba(118,255,177," + p.alpha.toFixed(3) + ")";
    c.shadowBlur = p.size * .8;
    c.shadowColor = "rgba(72,255,162,.22)";
    c.fillText(p.glyph, 0, 0);
    c.restore();
  }
  function drawCoin(p) {
    var c = backgroundEffectEngine.ctx;
    var scaleX = .32 + Math.abs(Math.sin(p.rotation)) * .68;
    c.save();
    c.translate(p.x, p.y);
    c.scale(scaleX, 1);
    var g = c.createRadialGradient(-p.size * .25, -p.size * .3, 1, 0, 0, p.size);
    g.addColorStop(0, "rgba(255,245,180," + p.alpha.toFixed(3) + ")");
    g.addColorStop(.48, "rgba(245,188,55," + p.alpha.toFixed(3) + ")");
    g.addColorStop(1, "rgba(137,77,12," + (p.alpha * .94).toFixed(3) + ")");
    c.fillStyle = g;
    c.shadowBlur = p.size * .9;
    c.shadowColor = "rgba(255,193,61,.2)";
    c.beginPath();
    c.arc(0, 0, p.size, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 1.1;
    c.strokeStyle = "rgba(255,226,133," + (p.alpha * .78).toFixed(3) + ")";
    c.stroke();
    c.restore();
    if (scaleX > .48) {
      c.save();
      c.translate(p.x, p.y);
      c.fillStyle = "rgba(114,69,10," + (p.alpha * .7).toFixed(3) + ")";
      c.font = "900 " + Math.max(7, p.size * .74).toFixed(1) + "px ui-sans-serif,system-ui,sans-serif";
      c.textAlign = "center";
      c.fillText("Z", 0, .5);
      c.restore();
    }
  }
  function drawHacker(dt) {
    var c = backgroundEffectEngine.ctx;
    c.fillStyle = "rgba(1,8,5,.10)";
    c.fillRect(0, 0, backgroundEffectEngine.width, backgroundEffectEngine.height);
    c.textAlign = "center";
    backgroundEffectEngine.columns.forEach(function (col) {
      col.y += col.speed * effectSpeed() * dt;
      for (var i = 0; i < col.length; i += 1) {
        var y = col.y - i * (col.size + 6);
        if (y < -20 || y > backgroundEffectEngine.height + 20) continue;
        var index = Math.floor((col.phase + i * 1.7 + col.y * .012) % col.chars.length);
        var alpha = i === 0 ? .78 : Math.max(.08, .42 - i * .055);
        c.fillStyle = "rgba(84,255,157," + alpha.toFixed(3) + ")";
        c.font = (i === 0 ? "800 " : "650 ") + col.size.toFixed(1) + "px ui-monospace,SFMono-Regular,Menlo,monospace";
        c.shadowBlur = i === 0 ? 7 : 0;
        c.shadowColor = "rgba(84,255,157,.25)";
        c.fillText(col.chars.charAt(index), col.x, y);
      }
      if (col.y - (col.length + 1) * (col.size + 6) > backgroundEffectEngine.height + 30) {
        col.y = -12 - Math.random() * backgroundEffectEngine.height * .25;
        col.phase = Math.random() * Math.PI * 2;
      }
    });
    c.shadowBlur = 0;
    c.textAlign = "start";
  }
  function renderBackgroundEffect(now) {
    if (!backgroundEffectEngine.ctx) return;
    var c = backgroundEffectEngine.ctx;
    var dt = Math.min(.05, Math.max(0, (now - (backgroundEffectEngine.lastFrame || now)) / 1000));
    backgroundEffectEngine.lastFrame = now;
    if (backgroundEffectEngine.mode === "hacker") {
      drawHacker(dt);
      return;
    }
    c.clearRect(0, 0, backgroundEffectEngine.width, backgroundEffectEngine.height);
    if (backgroundEffectEngine.mode === "dollar" || backgroundEffectEngine.mode === "coins") {
      backgroundEffectEngine.particles.forEach(function (p) {
        p.y += p.speed * effectSpeed() * dt;
        p.x += p.drift * dt;
        p.rotation += p.spin;
        if (p.y > backgroundEffectEngine.height + p.size * 2) {
          Object.assign(p, backgroundEffectEngine.mode === "dollar" ? createDollar(false) : createCoin(false));
        } else if (backgroundEffectEngine.mode === "dollar") {
          drawDollar(p);
        } else {
          drawCoin(p);
        }
      });
    }
  }
  function backgroundEffectLoop(now) {
    if (!backgroundEffectEngine.running) return;
    renderBackgroundEffect(now);
    backgroundEffectEngine.raf = window.requestAnimationFrame(backgroundEffectLoop);
  }
  function stopBackgroundEffectLoop() {
    backgroundEffectEngine.running = false;
    if (backgroundEffectEngine.raf) {
      window.cancelAnimationFrame(backgroundEffectEngine.raf);
      backgroundEffectEngine.raf = 0;
    }
  }
  function startBackgroundEffectLoop() {
    if (!backgroundEffectEngine.initialized || backgroundEffectEngine.running) return;
    backgroundEffectEngine.running = true;
    backgroundEffectEngine.lastFrame = window.performance.now();
    if (backgroundEffectEngine.ctx) {
      backgroundEffectEngine.ctx.clearRect(0, 0, backgroundEffectEngine.width, backgroundEffectEngine.height);
    }
    resetEffectParticles(true);
    backgroundEffectEngine.raf = window.requestAnimationFrame(backgroundEffectLoop);
  }
  function syncBackgroundEffectEngine() {
    var mode = BACKGROUND_EFFECTS.indexOf(state.backgroundEffect) >= 0 ? state.backgroundEffect : "none";
    var intensity = BACKGROUND_EFFECT_INTENSITIES.indexOf(state.backgroundEffectIntensity) >= 0 ? state.backgroundEffectIntensity : "medium";
    var canAnimate = state.animationsEnabled && !document.hidden && !backgroundEffectEngine.reducedMotion && mode !== "none";
    backgroundEffectEngine.mode = mode;
    backgroundEffectEngine.intensity = intensity;
    document.documentElement.setAttribute("data-background-effect", mode);
    document.documentElement.setAttribute("data-background-effect-intensity", intensity);
    if (els["appearance-effects"]) els["appearance-effects"].hidden = !canAnimate;
    if (els["appearance-effects-canvas"]) els["appearance-effects-canvas"].hidden = !canAnimate;
    if (!canAnimate) {
      stopBackgroundEffectLoop();
      if (backgroundEffectEngine.ctx) {
        backgroundEffectEngine.ctx.clearRect(0, 0, backgroundEffectEngine.width, backgroundEffectEngine.height);
      }
      return;
    }
    resetEffectParticles(false);
    stopBackgroundEffectLoop();
    startBackgroundEffectLoop();
  }
  function initializeBackgroundEffectEngine() {
    if (backgroundEffectEngine.initialized) return;
    backgroundEffectEngine.canvas = els["appearance-effects-canvas"];
    backgroundEffectEngine.ctx = backgroundEffectEngine.canvas && backgroundEffectEngine.canvas.getContext ? backgroundEffectEngine.canvas.getContext("2d") : null;
    backgroundEffectEngine.initialized = true;
    resizeBackgroundEffects();
    window.addEventListener("resize", function () {
      window.clearTimeout(backgroundEffectEngine.resizeTimer);
      backgroundEffectEngine.resizeTimer = window.setTimeout(function () {
        resizeBackgroundEffects();
        syncBackgroundEffectEngine();
      }, 120);
    }, { passive: true });
    var media = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (media) {
      var onChange = function (event) {
        backgroundEffectEngine.reducedMotion = Boolean(event.matches);
        syncBackgroundEffectEngine();
      };
      if (typeof media.addEventListener === "function") media.addEventListener("change", onChange);
      else if (typeof media.addListener === "function") media.addListener(onChange);
    }
  }
  function updateBackgroundEffectControls() {
    var effect = BACKGROUND_EFFECTS.indexOf(state.backgroundEffect) >= 0 ? state.backgroundEffect : "none";
    var intensity = BACKGROUND_EFFECT_INTENSITIES.indexOf(state.backgroundEffectIntensity) >= 0 ? state.backgroundEffectIntensity : "medium";
    document.querySelectorAll('input[name="background-effect"]').forEach(function (input) {
      var selected = input.value === effect;
      input.checked = selected;
      var option = input.closest(".appearance-effect-option");
      if (option) option.classList.toggle("is-selected", selected);
    });
    document.querySelectorAll('input[name="background-effect-intensity"]').forEach(function (input) {
      var selected = input.value === intensity;
      input.checked = selected;
      input.disabled = effect === "none";
      var option = input.closest(".appearance-intensity-option");
      if (option) {
        option.classList.toggle("is-selected", selected);
        option.classList.toggle("is-disabled", effect === "none");
      }
    });
    if (els["appearance-background-effect-status"]) {
      var label = effect === "dollar" ? text("backgroundEffectDollar")
        : effect === "coins" ? text("backgroundEffectCoins")
        : effect === "hacker" ? text("backgroundEffectHacker") : "";
      els["appearance-background-effect-status"].textContent =
        effect === "none" ? text("backgroundEffectStatusNone") : text("backgroundEffectStatusActive") + " • " + label;
    }
  }

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
      activityNamesTitle: "Activity Names",
      activityNamesSub: "Rename the four activity labels for this group. Leave a field blank to use the default.",
      activityNamesHint: "Up to 32 characters. This changes the display name only; /eat, /wc, /smoke and /wcd stay unchanged.",
      saveActivityNames: "Save Names",
      resetActivityNames: "Reset to Defaults",
      activityNamesSaved: "Activity names saved.",
      activityNamesSaveFailed: "Activity names could not be saved. Your changes are still here.",
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
      onboardingKicker: "QUICK START",
      onboardingTitle: "Get started with Z28",
      onboardingSub: "A quick guide to the parts you will use most.",
      onboardingStep1Title: "Choose your group",
      onboardingStep1Copy: "Use Switch any time you need to work with another group.",
      onboardingStep2Title: "Manage attendance",
      onboardingStep2Copy: "Review limits and update activity settings from your dashboard.",
      onboardingStep3Title: "Personalize your workspace",
      onboardingStep3Copy: "Customize your theme, wallpaper and layout from Appearance.",
      onboardingTools: "Explore Tools",
      onboardingAppearance: "Customize Appearance",
      onboardingDismiss: "Got it",
      toolsCategoryKicker: "GROUP MANAGEMENT",
      toolsCategoryTitle: "Group tools",
      toolsCategorySub: "Tools that configure how Z28 connects and works across your groups.",
      toolsDirectoryKicker: "AVAILABLE TOOLS",
      toolsDirectoryTitle: "Choose a tool",
      toolsDirectorySub: "Open a dedicated workspace for the task you want to manage.",
      toolsCurrentGroup: "CURRENT GROUP",
      toolsWorkspacePersonal: "PERSONAL",
      toolsWorkspaceRoleOwner: "OWNER",
      toolsWorkspaceRoleAdmin: "ADMIN",
      toolConnectionKicker: "GROUP ROUTING",
      toolRepliesKicker: "GROUP RESPONSES",
      toolRequiresGroup: "Available after connecting a group.",
      toolBack: "Back to Tools",
      toolDetailKicker: "TOOL WORKSPACE",
      toolDetailSub: "Manage this feature for the selected group.",
      replyMessagesKicker: "ACTIVITY RESPONSES",
      replyMessagesTitle: "Activity Reply Messages",
      replyMessagesSub: "Customize the bot's activity replies for this group only.",
      replyMessagesGroupLabel: "Editing Group",
      replyMessagesNote: "Only this selected group is affected. Other groups keep their own messages.",
      replyMessagesLanguageTitle: "Bot Reply Language",
      replyMessagesLanguageSub: "The bot uses the selected member's language for these replies.",
      replyCustomBadge: "CUSTOM",
      replySave: "Save Changes",
      replyDiscard: "Discard Changes",
      replyResetLanguage: "Reset Language to Default",
      replySaving: "Saving…",
      replySaved: "Activity reply messages saved for this group.",
      replyDefaultActive: "Default replies are active for this group.",
      replyCustomActive: "Custom replies are active for this group.",
      replyUnsaved: "Unsaved activity reply changes.",
      replyLoadFailed: "Unable to load activity reply messages.",
      replySaveFailed: "Nothing was saved. Your changes are still here; please try again.",
      replyPlainTextOnly: "Plain text only. Telegram formatting is disabled for custom replies.",
      replyVariables: "Available variables",
      replyInsertVariable: "Insert",
      replyReset: "Reset",
      replyConfirmDiscard: "Unsaved activity reply changes will be discarded. Continue?",
      replyResetConfirm: "Reset all messages in this language to the default templates?",
      replyNoActiveTitle: "No Active Activity",
      replyNoActiveSub: "Sent when a member uses Back without an active activity.",
      replyAlreadyActiveTitle: "Already Active",
      replyAlreadyActiveSub: "Sent when a member starts another activity while one is already active.",
      replyStartedTitle: "Activity Started",
      replyStartedSub: "Sent immediately after Eat, WC, Smoke, or WCD starts successfully.",
      replySettledTitle: "Activity Settled",
      replySettledSub: "Sent when an activity is completed with Back to Seat.",
      replyDailyCountTitle: "Daily Count Limit",
      replyDailyCountSub: "Sent when the group limit for that activity has been reached.",
      replyTimeoutReminderTitle: "Timeout Reminder",
      replyTimeoutReminderSub: "Sent when an active activity passes its allowed time.",
      replyTimeoutNotificationTitle: "Group Timeout Notification",
      replyTimeoutNotificationSub: "Sent to the connected Target Group when a Source Group activity times out.",
      wallpaperSub: "Choose a preset or use an image from this device.",
      backgroundEffects: "Background Effects",
      backgroundEffectsSub: "Add a lightweight animated layer to your wallpaper. Saved only on this device.",
      backgroundEffectNone: "None",
      backgroundEffectNoneSub: "Clean background",
      backgroundEffectDollar: "Dollar Rain",
      backgroundEffectDollarSub: "Falling currency",
      backgroundEffectCoins: "Gold Coins",
      backgroundEffectCoinsSub: "Falling gold coins",
      backgroundEffectHacker: "Hacker Stream",
      backgroundEffectHackerSub: "Falling terminal code",
      backgroundEffectIntensity: "Effect Intensity",
      backgroundEffectIntensitySub: "Control how visible and active the effect feels.",
      backgroundEffectLow: "Low",
      backgroundEffectMedium: "Medium",
      backgroundEffectHigh: "High",
      backgroundEffectStatusNone: "No background effect is active.",
      backgroundEffectStatusActive: "Background effect is active on this device.",
      wallpaperDefault: "Default",
      wallpaperAurora: "Aurora",
      wallpaperGrid: "Neon Grid",
      wallpaperNebula: "Nebula",
      wallpaperOcean: "Ocean Glow",
      wallpaperViolet: "Violet Glass",
      wallpaperCustom: "Device Image",
      wallpaperUpload: "Choose Image",
      wallpaperRemove: "Remove Image",
      wallpaperCustomEmpty: "No device image selected.",
      wallpaperCustomSaved: "Custom wallpaper is active • saved on this device.",
      wallpaperProcessing: "Preparing wallpaper…",
      wallpaperSaved: "Wallpaper updated successfully.",
      wallpaperRemoved: "Device wallpaper removed.",
      wallpaperInvalidType: "Please choose a JPG, PNG or WebP image.",
      wallpaperInvalidSize: "That image is too large to process. Choose a smaller image.",
      wallpaperStorageFailed: "This device could not save the wallpaper. Choose a smaller image or free some browser storage.",
      themeCreator: "Theme Creator",
      themeCreatorSub: "Create your own look and keep it saved on this device.",
      themeCreatorPresets: "Quick palettes",
      themeCreatorPresetsSub: "Start with a preset, then fine-tune it.",
      themePaletteOcean: "Ocean",
      themePaletteViolet: "Violet",
      themePaletteMint: "Mint",
      themePaletteSunset: "Sunset",
      themeCreatorPrimary: "Primary color",
      themeCreatorSecondary: "Secondary color",
      themeCreatorGlow: "Glow intensity",
      themeCreatorRadius: "Corner radius",
      themeCreatorBackground: "Background intensity",
      themeCreatorCustom: "Custom",
      themeCreatorDeviceOnly: "DEVICE ONLY",
      themeCreatorActive: "Custom theme is active • saved on this device.",
      themeCreatorInactive: "Custom theme is not active.",
      themeCreatorReset: "Reset",
      workspaceIdentity: "WORKSPACE IDENTITY",
      workspaceNameTitle: "Personal Workspace Name",
      workspaceNameSub: "Give your Z28 workspace a name. It is saved only on this device.",
      workspaceNamePlaceholder: "My Workspace",
      workspaceNameHint: "1–32 characters",
      workspaceNameSave: "Save Workspace Name",
      workspaceNameSaved: "Workspace name saved on this device.",
      workspaceNameReset: "Reset",
      workspaceNameDeviceOnly: "DEVICE ONLY",
      workspaceNameInvalid: "Enter a workspace name from 1 to 32 characters.",
      workspaceNameDefault: "My Workspace",

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
      connectSelectBoth: "Select a Source Group and a Target Group first.",
      connectGuideKicker: "HOW IT WORKS",
      connectGuideTitle: "How to connect groups",
      connectGuideSub: "Follow these steps to route timeout notifications from one group to another.",
      connectGuideStep1Title: "Choose a Source Group",
      connectGuideStep1Copy: "Select the group where Z28 detects activity timeouts. This is the group whose timeout notifications you want to send somewhere else.",
      connectGuideStep2Title: "Choose a Target Group",
      connectGuideStep2Copy: "Select the group where Z28 should send the timeout notifications. Both groups must be available to you and the bot.",
      connectGuideStep3Title: "Review the route",
      connectGuideStep3Copy: "Make sure the Source and Target are different groups. The status area above will show that the route is ready before you connect it.",
      connectGuideStep4Title: "Connect and verify",
      connectGuideStep4Copy: "Press Connect Group. After a successful save, the current connection is shown above and the action changes to Edit Connection when you need to change the target later.",
      connectGuideRule1: "Only groups that are available to your Telegram account and have the required bot access can be selected.",
      connectGuideRule2: "One Source Group can have one active Target Group. Saving a new target updates that source connection.",
      connectGuideRule3: "If you only want to change the target, use Edit Connection instead of starting over.",
      connectGuideHide: "Hide Guide",
      connectGuideShow: "Show Guide",
      connectFlowKicker: "WHAT HAPPENS AFTER CONNECTING",
      connectFlowTitle: "How the connection works",
      connectFlowSub: "The connection routes a timeout notice from the Source Group to the Target Group.",
      connectFlowStep1Title: "Activity starts in the Source Group",
      connectFlowStep1Copy: "A member starts an activity such as Eat, WC, Smoke, or WCD in the Source Group.",
      connectFlowStep2Title: "The group time limit applies",
      connectFlowStep2Copy: "Z28 uses that Source Group's configured activity limit to determine when the activity has gone over time.",
      connectFlowStep3Title: "The member returns after the limit",
      connectFlowStep3Copy: "When the member presses Back after the allowed time, Z28 calculates the overtime. A value greater than zero is treated as a timeout.",
      connectFlowStep4Title: "Z28 creates the timeout notice",
      connectFlowStep4Copy: "Z28 records the timeout and prepares a notice containing the Source Group, member, activity type, and overtime duration.",
      connectFlowStep5Title: "The Target Group is notified",
      connectFlowStep5Copy: "Because the Source Group is connected, the timeout notice is delivered to its configured Target Group instead of being sent nowhere.",
      connectFlowExampleLabel: "EXAMPLE",
      connectFlowExample: "Source: Main Group → Target: Admin Group. A member starts Eat with a 30-minute limit and returns after 38 minutes. Z28 detects 8 minutes of overtime and sends the timeout notification to Admin Group.",
      connectFlowImportant1: "Within the allowed time: the activity is completed normally and no connected-group timeout notice is created.",
      connectFlowImportant2: "Over the allowed time: the overtime is recorded and the connected Target Group can receive the timeout notice.",
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
      themeLight: "Light",
      themeLightSub: "Soft light interface",
      themeWhite: "White",
      themeWhiteSub: "Clean pure-white interface",
      animations: "Animations",
      animationsSub: "Keep interface motion and transitions enabled.",
      compactMode: "Compact Mode",
      compactModeSub: "Reduce spacing for a denser layout.",
      accessibilityTitle: "Accessibility", accessibilitySub: "Make text and contrast easier to read. Preferences are saved only on this device.", textSize: "Text Size", textSizeSub: "Choose a comfortable reading size for this Mini App.", textSizeStandard: "Standard", textSizeStandardSub: "Balanced", textSizeLarge: "Large", textSizeLargeSub: "Easier reading", textSizeExtraLarge: "Extra Large", textSizeExtraLargeSub: "Maximum readability", highContrast: "High Contrast", highContrastSub: "Increase text and control contrast for clearer visibility.",
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
      noGroupEyebrow: "PERSONAL WORKSPACE",
      noGroup: "Welcome to your Z28 workspace",
      noGroupConnect: "Connect a Group",
      noGroupStatus: "No group connected",
      noGroupCopy: "Your personal Mini App space is ready. Group Dashboard tools will appear automatically when your Telegram account has eligible administrator access.",
      noGroupHelpTitle: "Quick access",
      noGroupHelpCaption: "Personal preferences are saved only on this device.",
      noGroupStep1Title: "Appearance",
      noGroupStep1Copy: "Customize your theme, wallpaper, animations and workspace name.",
      noGroupStep2Title: "Help & Support",
      noGroupStep2Copy: "Browse the FAQ and get guidance for using Z28.",
      noGroupStep3Title: "About Z28",
      noGroupStep3Copy: "View app information, privacy, terms and creator details.",
      noGroupNote: "No group dashboard is available for this account right now. Reopen the Mini App after your group access changes.",
      noGroupBack: "Check Group Access",
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
      reportNoGroup: "No group connected",
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
      activityNamesTitle: "Activity အမည်များ",
      activityNamesSub: "ဤ Group အတွက် activity လေးမျိုး၏ ပြသမည့်အမည်များကို ပြောင်းနိုင်ပါသည်။ အကွက်ကိုဗလာထားလျှင် မူလအမည်ကို အသုံးပြုပါမည်။",
      activityNamesHint: "အများဆုံး 32 စာလုံးအထိ သတ်မှတ်နိုင်ပါသည်။ ပြသမည့်အမည်သာ ပြောင်းမည်ဖြစ်ပြီး /eat, /wc, /smoke, /wcd command များ မပြောင်းပါ။",
      saveActivityNames: "အမည်များသိမ်းမည်",
      resetActivityNames: "မူလအမည်သို့ ပြန်ထားမည်",
      activityNamesSaved: "Activity အမည်များကို သိမ်းပြီးပါပြီ။",
      activityNamesSaveFailed: "Activity အမည်များကို မသိမ်းနိုင်ပါ။ ပြင်ဆင်ထားသည်များ မပျောက်သေးပါ။",
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
      onboardingKicker: "အမြန်စတင်ရန်",
      onboardingTitle: "Z28 ကို စတင်အသုံးပြုပါ",
      onboardingSub: "အများဆုံးအသုံးပြုမည့် လုပ်ဆောင်ချက်များကို အမြန်လေ့လာပါ။",
      onboardingStep1Title: "Group ရွေးပါ",
      onboardingStep1Copy: "အခြား group တစ်ခုကို စီမံလိုပါက Switch ကို အချိန်မရွေး အသုံးပြုနိုင်ပါသည်။",
      onboardingStep2Title: "Attendance ကို စီမံပါ",
      onboardingStep2Copy: "Dashboard မှ activity limits နှင့် settings များကို ကြည့်ရှုပြင်ဆင်နိုင်ပါသည်။",
      onboardingStep3Title: "Workspace ကို စိတ်ကြိုက်ပြင်ပါ",
      onboardingStep3Copy: "Appearance မှ theme, wallpaper နှင့် layout ကို စိတ်ကြိုက်ပြင်နိုင်ပါသည်။",
      onboardingTools: "Tools ကြည့်မည်",
      onboardingAppearance: "Appearance ပြင်မည်",
      onboardingDismiss: "နားလည်ပါပြီ",
      toolsCategoryKicker: "GROUP MANAGEMENT",
      toolsCategoryTitle: "Group Tools",
      toolsCategorySub: "Z28 ၏ group ချိတ်ဆက်မှုနှင့် group အလိုက်လုပ်ဆောင်ချက်များကို စီမံရန် tools များ။",
      toolsDirectoryKicker: "AVAILABLE TOOLS",
      toolsDirectoryTitle: "Tool တစ်ခုရွေးပါ",
      toolsDirectorySub: "စီမံလိုသောလုပ်ဆောင်ချက်အတွက် သီးခြား workspace ကိုဖွင့်ပါ။",
      toolsCurrentGroup: "CURRENT GROUP",
      toolsWorkspacePersonal: "ကိုယ်ပိုင် Workspace",
      toolsWorkspaceRoleOwner: "OWNER",
      toolsWorkspaceRoleAdmin: "ADMIN",
      toolConnectionKicker: "GROUP ROUTING",
      toolRepliesKicker: "GROUP RESPONSES",
      toolRequiresGroup: "Group ချိတ်ဆက်ပြီးမှ အသုံးပြုနိုင်ပါသည်။",
      toolBack: "Tools သို့ ပြန်ရန်",
      toolDetailKicker: "TOOL WORKSPACE",
      toolDetailSub: "ရွေးထားသော group အတွက် ဤလုပ်ဆောင်ချက်ကို စီမံပါ။",
      replyMessagesKicker: "ACTIVITY RESPONSES",
      replyMessagesTitle: "Activity Reply Messages",
      replyMessagesSub: "ဤ group အတွက်သာ bot ရဲ့ activity reply စာသားတွေကို စိတ်ကြိုက်ပြင်နိုင်ပါသည်။",
      replyMessagesGroupLabel: "ပြင်ဆင်နေသော Group",
      replyMessagesNote: "ရွေးထားသော ဤ group တစ်ခုတည်းကိုသာ သက်ရောက်ပါမည်။ အခြား group များက မိမိတို့၏စာသားအတိုင်း ဆက်ရှိပါမည်။",
      replyMessagesLanguageTitle: "Bot Reply Language",
      replyMessagesLanguageSub: "Member တစ်ဦး၏ bot language အလိုက် reply စာသားကို အသုံးပြုပါမည်။",
      replyCustomBadge: "CUSTOM",
      replySave: "ပြောင်းလဲချက်များ သိမ်းမည်",
      replyDiscard: "မသိမ်းရသေးတာ ဖျက်မည်",
      replyResetLanguage: "ဒီ Language ကို Default ပြန်ထားမည်",
      replySaving: "သိမ်းနေပါသည်…",
      replySaved: "ဤ group အတွက် activity reply စာသားများကို သိမ်းပြီးပါပြီ။",
      replyDefaultActive: "ဤ group တွင် Default reply စာသားများကို အသုံးပြုနေပါသည်။",
      replyCustomActive: "ဤ group တွင် စိတ်ကြိုက် reply စာသားများကို အသုံးပြုနေပါသည်။",
      replyUnsaved: "မသိမ်းရသေးသော activity reply ပြောင်းလဲချက်များ ရှိပါသည်။",
      replyLoadFailed: "Activity reply စာသားများကို မဖတ်နိုင်ပါ။",
      replySaveFailed: "ဘာမျှ မသိမ်းရသေးပါ။ ပြင်ဆင်ထားသည်များကို ထားရှိပြီး ထပ်မံကြိုးစားပါ။",
      replyPlainTextOnly: "Plain text သာ အသုံးပြုနိုင်ပါသည်။ Custom reply များတွင် Telegram formatting ကို ပိတ်ထားပါသည်။",
      replyVariables: "အသုံးပြုနိုင်သော variables",
      replyInsertVariable: "ထည့်မည်",
      replyReset: "Reset",
      replyConfirmDiscard: "မသိမ်းရသေးသော activity reply ပြောင်းလဲချက်များ ပျက်သွားပါမည်။ ဆက်လုပ်မလား?",
      replyResetConfirm: "ဒီ language ထဲက message အားလုံးကို Default template သို့ ပြန်ထားမလား?",
      replyNoActiveTitle: "Active Activity မရှိပါ",
      replyNoActiveSub: "Active activity မရှိဘဲ Back နှိပ်သည့်အခါ ပို့မည့်စာသား။",
      replyAlreadyActiveTitle: "Activity ရှိနေပြီးသား",
      replyAlreadyActiveSub: "Activity တစ်ခုလုပ်နေစဉ် နောက်ထပ် activity စသည့်အခါ ပို့မည့်စာသား။",
      replyStartedTitle: "Activity စတင်ပြီး",
      replyStartedSub: "Eat, WC, Smoke သို့မဟုတ် WCD အောင်မြင်စွာ စတင်ပြီးချိန်တွင် ပို့မည့်စာသား။",
      replySettledTitle: "Activity ပြီးဆုံးပြီး",
      replySettledSub: "Back to Seat ဖြင့် activity ပြီးဆုံးသည့်အခါ ပို့မည့်စာသား။",
      replyDailyCountTitle: "Daily Count Limit",
      replyDailyCountSub: "ထို activity ၏ ဒီနေ့အသုံးပြုခွင့် အကြိမ်ရေ limit ပြည့်သည့်အခါ ပို့မည့်စာသား။",
      replyTimeoutReminderTitle: "Timeout Reminder",
      replyTimeoutReminderSub: "Activity သတ်မှတ်ချိန်ကျော်သွားသည့်အခါ member ထံ ပို့မည့်စာသား။",
      replyTimeoutNotificationTitle: "Group Timeout Notification",
      replyTimeoutNotificationSub: "Source Group activity timeout ဖြစ်သည့်အခါ ချိတ်ထားသော Target Group သို့ ပို့မည့်စာသား။",
      wallpaperSub: "Preset တစ်ခုရွေးပါ သို့မဟုတ် ဤစက်ထဲက image တစ်ပုံကို သုံးပါ။",
      backgroundEffects: "နောက်ခံ Effect",
      backgroundEffectsSub: "ရွေးထားသော wallpaper ပေါ်တွင် ပေါ့ပါးသော animation layer ထည့်ပါ။ ဤ device ပေါ်တွင်သာ သိမ်းထားပါမည်။",
      backgroundEffectNone: "မရှိပါ",
      backgroundEffectNoneSub: "ရိုးရှင်းသော နောက်ခံ",
      backgroundEffectDollar: "ဒေါ်လာများ ကျဆင်းခြင်း",
      backgroundEffectDollarSub: "ဒေါ်လာများ ကျဆင်းမည်",
      backgroundEffectCoins: "ရွှေဒင်္ဂါးများ",
      backgroundEffectCoinsSub: "ရွှေဒင်္ဂါးများ ကျဆင်းမည်",
      backgroundEffectHacker: "Hacker စာတန်းများ",
      backgroundEffectHackerSub: "Terminal code စာတန်းများ ကျဆင်းမည်",
      backgroundEffectIntensity: "Effect အား",
      backgroundEffectIntensitySub: "Effect ၏ မြင်သာမှုနှင့် လှုပ်ရှားမှုကို ချိန်ညှိပါ။",
      backgroundEffectLow: "နည်း",
      backgroundEffectMedium: "အလယ်အလတ်",
      backgroundEffectHigh: "မြင့်",
      backgroundEffectStatusNone: "နောက်ခံ Effect မည်သည့်အရာမျှ မဖွင့်ထားပါ။",
      backgroundEffectStatusActive: "နောက်ခံ Effect ကို ဤ device တွင် အသုံးပြုနေပါသည်။",
      wallpaperDefault: "Default",
      wallpaperAurora: "Aurora",
      wallpaperGrid: "Neon Grid",
      wallpaperNebula: "Nebula",
      wallpaperOcean: "Ocean Glow",
      wallpaperViolet: "Violet Glass",
      wallpaperCustom: "Device Image",
      wallpaperUpload: "Image ရွေးမည်",
      wallpaperRemove: "Image ဖယ်မည်",
      wallpaperCustomEmpty: "Device image မရွေးရသေးပါ။",
      wallpaperCustomSaved: "ကိုယ်ပိုင် wallpaper ကို ဤစက်ပေါ်တွင် သိမ်းထားပြီး အသုံးပြုနေပါသည်။",
      wallpaperProcessing: "Wallpaper ကို ပြင်ဆင်နေပါသည်…",
      wallpaperSaved: "Wallpaper ပြောင်းလဲပြီးပါပြီ။",
      wallpaperRemoved: "Device wallpaper ကို ဖယ်ရှားပြီးပါပြီ။",
      wallpaperInvalidType: "JPG, PNG သို့မဟုတ် WebP image ကိုသာ ရွေးပါ။",
      wallpaperInvalidSize: "ဤ image သည် process လုပ်ရန် ကြီးလွန်းပါသည်။ သေးငယ်သော image ကို ရွေးပါ။",
      wallpaperStorageFailed: "ဤစက်တွင် wallpaper သိမ်း၍မရပါ။ Image ပိုသေးသည့်တစ်ခုကို ရွေးပါ သို့မဟုတ် browser storage အချို့ရှင်းပါ။",
      themeCreator: "Theme Creator",
      themeCreatorSub: "ကိုယ်ပိုင်အပြင်အဆင်ကို ဖန်တီးပြီး ဤစက်ပေါ်မှာပဲ သိမ်းထားနိုင်ပါသည်။",
      themeCreatorPresets: "အမြန်ရွေးချယ်ရန် Palette များ",
      themeCreatorPresetsSub: "Preset တစ်ခုရွေးပြီး အသေးစိတ်ညှိနိုင်ပါသည်။",
      themePaletteOcean: "Ocean",
      themePaletteViolet: "Violet",
      themePaletteMint: "Mint",
      themePaletteSunset: "Sunset",
      themeCreatorPrimary: "အဓိကအရောင်",
      themeCreatorSecondary: "ဒုတိယအရောင်",
      themeCreatorGlow: "Glow အားပြင်းမှု",
      themeCreatorRadius: "ထောင့်ဝိုင်းမှု",
      themeCreatorBackground: "Background အားပြင်းမှု",
      themeCreatorCustom: "Custom",
      themeCreatorDeviceOnly: "ဤစက်တွင်သာ",
      themeCreatorActive: "Custom theme ကို ဖွင့်ထားပြီး ဤစက်ပေါ်တွင် သိမ်းထားပါသည်။",
      themeCreatorInactive: "Custom theme ကို မဖွင့်ရသေးပါ။",
      themeCreatorReset: "မူလသို့ ပြန်ထားမည်",
      workspaceIdentity: "WORKSPACE IDENTITY",
      workspaceNameTitle: "Personal Workspace Name",
      workspaceNameSub: "သင့် Z28 workspace အတွက် နာမည်ပေးပါ။ ဤ device ပေါ်တွင်သာ သိမ်းထားပါမည်။",
      workspaceNamePlaceholder: "My Workspace",
      workspaceNameHint: "စာလုံး ၁ မှ ၃၂ လုံး",
      workspaceNameSave: "Workspace Name သိမ်းမည်",
      workspaceNameSaved: "Workspace name ကို ဤ device ပေါ်တွင် သိမ်းထားပါသည်။",
      workspaceNameReset: "မူလသို့ ပြန်ထားမည်",
      workspaceNameDeviceOnly: "ဤစက်တွင်သာ",
      workspaceNameInvalid: "Workspace Name ကို စာလုံး ၁ မှ ၃၂ လုံးအတွင်း ထည့်ပါ။",
      workspaceNameDefault: "My Workspace",

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
      connectSelectBoth: "အရင်ဆုံး Source Group နဲ့ Target Group နှစ်ခုလုံးကို ရွေးပါ။",
      connectGuideKicker: "အသုံးပြုပုံ",
      connectGuideTitle: "Group ချိတ်ဆက်နည်း",
      connectGuideSub: "Timeout notification ကို Group တစ်ခုမှ အခြား Group တစ်ခုသို့ ပို့ရန် အောက်ပါအဆင့်များအတိုင်း လုပ်ဆောင်ပါ။",
      connectGuideStep1Title: "Source Group ကိုရွေးပါ",
      connectGuideStep1Copy: "Z28 က activity timeout ကို စောင့်ကြည့်မည့် Group ကို ရွေးပါ။ ဒီ Group ရဲ့ timeout notification တွေကို အခြား Group သို့ ပို့မည်ဖြစ်ပါတယ်။",
      connectGuideStep2Title: "Target Group ကိုရွေးပါ",
      connectGuideStep2Copy: "Timeout notification တွေကို လက်ခံမည့် Group ကို ရွေးပါ။ Group နှစ်ခုလုံးကို သင့် account နဲ့ Bot က အသုံးပြုနိုင်ရပါမည်။",
      connectGuideStep3Title: "ချိတ်ဆက်မှုကို စစ်ပါ",
      connectGuideStep3Copy: "Source Group နဲ့ Target Group မတူကြောင်း စစ်ပါ။ အပေါ်ဘက် status မှာ ချိတ်ဆက်ရန် အဆင်သင့်ဖြစ်ကြောင်း ပြပါမည်။",
      connectGuideStep4Title: "Connect လုပ်ပြီး အတည်ပြုပါ",
      connectGuideStep4Copy: "Group ချိတ်ဆက်မည် ကိုနှိပ်ပါ။ အောင်မြင်ပြီးပါက အပေါ်ဘက်မှာ လက်ရှိ connection ကို ပြပြီး နောက်ပိုင်းပြင်လိုပါက ချိတ်ဆက်မှု ပြင်မည် ကို အသုံးပြုနိုင်ပါသည်။",
      connectGuideRule1: "သင့် Telegram account နဲ့ Bot နှစ်ခုလုံး အသုံးပြုနိုင်သော Group များကိုသာ ရွေးချယ်နိုင်ပါသည်။",
      connectGuideRule2: "Source Group တစ်ခုမှာ active Target Group တစ်ခု ရှိနိုင်ပါသည်။ Target အသစ်ကို Save လုပ်ပါက အဲဒီ Source connection ကို update လုပ်ပါမည်။",
      connectGuideRule3: "Target Group ကိုသာ ပြောင်းလိုပါက အစမှ ပြန်လုပ်စရာမလိုဘဲ ချိတ်ဆက်မှု ပြင်မည် ကို အသုံးပြုပါ။",
      connectGuideHide: "Guide ကို ဖျောက်မည်",
      connectGuideShow: "Guide ကို ပြမည်",
      connectFlowKicker: "ချိတ်ဆက်ပြီးနောက် ဘယ်လိုအလုပ်လုပ်သလဲ",
      connectFlowTitle: "Connection အလုပ်လုပ်ပုံ",
      connectFlowSub: "Source Group မှာ ဖြစ်ပေါ်သော timeout notification ကို ချိတ်ဆက်ထားသော Target Group သို့ ပို့ပေးပါသည်။",
      connectFlowStep1Title: "Source Group တွင် Activity စတင်ပါမည်",
      connectFlowStep1Copy: "Member တစ်ယောက်က Source Group ထဲမှာ Eat, WC, Smoke သို့မဟုတ် WCD activity တစ်ခု စတင်ပါမည်။",
      connectFlowStep2Title: "Group ၏ Time Limit ကို အသုံးပြုပါမည်",
      connectFlowStep2Copy: "Z28 သည် Source Group အတွက် သတ်မှတ်ထားသော activity limit ကို အသုံးပြုပြီး အချိန်ကျော်မကျော် စစ်ဆေးပါမည်။",
      connectFlowStep3Title: "Limit ကျော်ပြီးမှ Back လုပ်ပါမည်",
      connectFlowStep3Copy: "Member က သတ်မှတ်ထားသောအချိန်ထက် ကျော်ပြီး Back နှိပ်သောအခါ Z28 က overtime ကိုတွက်ပါမည်။ Zero ထက်ကြီးပါက timeout အဖြစ် သတ်မှတ်ပါသည်။",
      connectFlowStep4Title: "Z28 က Timeout Notice ပြုလုပ်ပါမည်",
      connectFlowStep4Copy: "Z28 က timeout ကို မှတ်တမ်းတင်ပြီး Source Group, member, activity အမျိုးအစားနှင့် overtime ကြာချိန် ပါဝင်သော notification ကို ပြုလုပ်ပါမည်။",
      connectFlowStep5Title: "Target Group သို့ အသိပေးပါမည်",
      connectFlowStep5Copy: "Source Group ကို connection ချိတ်ထားသောကြောင့် ထို timeout notification ကို သတ်မှတ်ထားသော Target Group သို့ ပို့ပေးပါမည်။",
      connectFlowExampleLabel: "ဥပမာ",
      connectFlowExample: "Source: Main Group → Target: Admin Group။ Member တစ်ယောက်က Eat ကို 30 မိနစ် limit နဲ့ စပြီး 38 မိနစ်ကြာမှ ပြန်လာပါက Z28 က 8 မိနစ် overtime ဖြစ်ကြောင်းသိရှိပြီး Admin Group သို့ timeout notification ပို့ပါမည်။",
      connectFlowImportant1: "သတ်မှတ်ထားသောအချိန်အတွင်း ပြန်လာပါက activity ကို ပုံမှန်ပြီးဆုံးသည်ဟု သတ်မှတ်ပြီး connected-group timeout notice မပြုလုပ်ပါ။",
      connectFlowImportant2: "သတ်မှတ်ထားသောအချိန်ကို ကျော်သွားပါက overtime ကို မှတ်တမ်းတင်ပြီး ချိတ်ဆက်ထားသော Target Group သို့ timeout notice ပို့နိုင်ပါသည်။",
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
      themeLight: "Light",
      themeLightSub: "မျက်စိသက်သာသော အလင်းရောင် interface ပုံစံ",
      themeWhite: "White",
      themeWhiteSub: "သန့်ရှင်းသော အဖြူရောင် interface ပုံစံ",
      animations: "Animations",
      animationsSub: "Interface ရဲ့ motion နဲ့ transition များကို ဖွင့်ထားမည်။",
      compactMode: "Compact Mode",
      compactModeSub: "Screen space သက်သာစေရန် spacing ကို လျှော့မည်။",
      accessibilityTitle: "Accessibility", accessibilitySub: "စာသားနှင့် contrast ကို ပိုမိုဖတ်ရှုရလွယ်ကူအောင် ပြင်ဆင်ပါ။ ဤ setting များကို ဤ device ပေါ်တွင်သာ သိမ်းထားပါမည်။", textSize: "Text Size", textSizeSub: "Mini App ကို သက်တောင့်သက်သာ ဖတ်ရှုနိုင်မည့် စာလုံးအရွယ်အစားကို ရွေးပါ။", textSizeStandard: "Standard", textSizeStandardSub: "ပုံမှန်", textSizeLarge: "Large", textSizeLargeSub: "ပိုမိုဖတ်ရလွယ်", textSizeExtraLarge: "Extra Large", textSizeExtraLargeSub: "အများဆုံး ဖတ်ရလွယ်ကူမှု", highContrast: "High Contrast", highContrastSub: "စာသားနှင့် control များကို ပိုမိုရှင်းလင်းစွာ မြင်နိုင်အောင် contrast မြှင့်ပါ။",
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
      noGroupEyebrow: "PERSONAL WORKSPACE",
      noGroup: "သင့် Z28 Workspace မှ ကြိုဆိုပါသည်",
      noGroupConnect: "Group ချိတ်ဆက်မည်",
      noGroupStatus: "Group ချိတ်ဆက်ထားခြင်း မရှိသေးပါ",
      noGroupCopy: "သင့်အတွက် Personal Mini App space ကို အသင့်ပြင်ထားပြီးပါပြီ။ Telegram account တွင် Group access ရရှိလာပါက Group Dashboard tools များကို အလိုအလျောက် အသုံးပြုနိုင်ပါမည်။",
      noGroupHelpTitle: "အမြန်အသုံးပြုရန်",
      noGroupHelpCaption: "Personal preferences များကို ဤ device ပေါ်တွင်သာ သိမ်းထားပါသည်။",
      noGroupStep1Title: "Appearance",
      noGroupStep1Copy: "Theme, wallpaper, animations နှင့် workspace name ကို စိတ်ကြိုက်ပြင်နိုင်ပါသည်။",
      noGroupStep2Title: "Help & Support",
      noGroupStep2Copy: "FAQ များကို ကြည့်ရှုပြီး Z28 အသုံးပြုနည်း အကူအညီများ ရယူနိုင်ပါသည်။",
      noGroupStep3Title: "Z28 အကြောင်း",
      noGroupStep3Copy: "App အချက်အလက်၊ privacy၊ terms နှင့် creator information များကို ကြည့်နိုင်ပါသည်။",
      noGroupNote: "ယခုအချိန်တွင် ဤ account အတွက် Group Dashboard မရရှိသေးပါ။ Group access ပြောင်းလဲပြီးနောက် Mini App ကို ပြန်ဖွင့်ပါ။",
      noGroupBack: "Group Access စစ်မည်",
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
      reportNoGroup: "Group ချိတ်ဆက်ထားခြင်း မရှိသေးပါ",
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
      confirm: "确认",      confirmed: "已确认",
      yourGroups: "您的群组",
      groupOptions: "群组选择",
      groupOptionsSub: "选择一个群组以打开其仪表板。",
      groupMembers: "群组成员",
      memberActive: "活跃成员",
      groupConfiguration: "群组配置",
      settingsTitle: "活动设置",
      settingsSub: "管理此群组的限制。",
      activityNamesTitle: "活动名称",
      activityNamesSub: "为此群组重命名四种活动。留空即可恢复使用默认名称。",
      activityNamesHint: "最多 32 个字符。这里只改变显示名称；/eat、/wc、/smoke 和 /wcd 命令保持不变。",
      saveActivityNames: "保存名称",
      resetActivityNames: "恢复默认",
      activityNamesSaved: "活动名称已保存。",
      activityNamesSaveFailed: "活动名称保存失败。您的更改仍然保留。",
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
      onboardingKicker: "快速开始",
      onboardingTitle: "开始使用 Z28",
      onboardingSub: "快速了解最常用的功能。",
      onboardingStep1Title: "选择群组",
      onboardingStep1Copy: "需要管理其他群组时，随时使用“切换”。",
      onboardingStep2Title: "管理考勤",
      onboardingStep2Copy: "在仪表板查看限制并更新活动设置。",
      onboardingStep3Title: "个性化工作区",
      onboardingStep3Copy: "在“外观”中自定义主题、壁纸和布局。",
      onboardingTools: "探索工具",
      onboardingAppearance: "自定义外观",
      onboardingDismiss: "知道了",
      toolsCategoryKicker: "群组管理",
      toolsCategoryTitle: "群组工具",
      toolsCategorySub: "管理 Z28 在不同群组之间的连接和相关功能。",
      toolsDirectoryKicker: "可用工具",
      toolsDirectoryTitle: "选择工具",
      toolsDirectorySub: "打开对应的独立工作区，管理你需要的功能。",
      toolsCurrentGroup: "当前群组",
      toolsWorkspacePersonal: "个人工作区",
      toolsWorkspaceRoleOwner: "群主",
      toolsWorkspaceRoleAdmin: "管理员",
      toolConnectionKicker: "群组路由",
      toolRepliesKicker: "群组回复",
      toolRequiresGroup: "连接群组后即可使用。",
      toolBack: "返回工具",
      toolDetailKicker: "工具工作区",
      toolDetailSub: "管理当前选定群组的此功能。",
      replyMessagesKicker: "活动回复",
      replyMessagesTitle: "活动回复消息",
      replyMessagesSub: "仅为当前群组自定义 Bot 的活动回复消息。",
      replyMessagesGroupLabel: "正在编辑的群组",
      replyMessagesNote: "仅影响当前选中的群组。其他群组保留各自的消息。",
      replyMessagesLanguageTitle: "Bot 回复语言",
      replyMessagesLanguageSub: "Bot 会根据成员选择的语言发送对应回复。",
      replyCustomBadge: "自定义",
      replySave: "保存更改",
      replyDiscard: "放弃更改",
      replyResetLanguage: "恢复当前语言默认模板",
      replySaving: "保存中…",
      replySaved: "此群组的活动回复消息已保存。",
      replyDefaultActive: "此群组正在使用默认回复消息。",
      replyCustomActive: "此群组正在使用自定义回复消息。",
      replyUnsaved: "有未保存的活动回复更改。",
      replyLoadFailed: "无法加载活动回复消息。",
      replySaveFailed: "未保存任何更改。当前编辑内容仍然保留，请重试。",
      replyPlainTextOnly: "仅支持纯文本。自定义回复中会禁用 Telegram 格式化。",
      replyVariables: "可用变量",
      replyInsertVariable: "插入",
      replyReset: "重置",
      replyConfirmDiscard: "未保存的活动回复更改将被丢弃。是否继续？",
      replyResetConfirm: "将此语言中的所有消息恢复为默认模板？",
      replyNoActiveTitle: "没有进行中的活动",
      replyNoActiveSub: "成员没有进行中的活动却使用返回座位时发送。",
      replyAlreadyActiveTitle: "已有进行中的活动",
      replyAlreadyActiveSub: "成员已有活动时再次开始其他活动时发送。",
      replyStartedTitle: "活动开始",
      replyStartedSub: "Eat、WC、Smoke 或 WCD 成功开始后发送。",
      replySettledTitle: "活动结算",
      replySettledSub: "成员使用返回座位完成活动后发送。",
      replyDailyCountTitle: "每日次数上限",
      replyDailyCountSub: "该活动达到群组每日次数上限时发送。",
      replyTimeoutReminderTitle: "超时提醒",
      replyTimeoutReminderSub: "进行中的活动超过允许时间时发送给成员。",
      replyTimeoutNotificationTitle: "群组超时通知",
      replyTimeoutNotificationSub: "源群组活动超时后发送到已连接的目标群组。",
      wallpaperSub: "选择预设，或使用此设备中的图片。",
      backgroundEffects: "背景效果",
      backgroundEffectsSub: "为当前壁纸添加轻量动态效果。仅保存在此设备。",
      backgroundEffectNone: "无",
      backgroundEffectNoneSub: "简洁背景",
      backgroundEffectDollar: "美元雨",
      backgroundEffectDollarSub: "美元从上方落下",
      backgroundEffectCoins: "金币雨",
      backgroundEffectCoinsSub: "金币从上方落下",
      backgroundEffectHacker: "黑客代码流",
      backgroundEffectHackerSub: "终端代码从上方落下",
      backgroundEffectIntensity: "效果强度",
      backgroundEffectIntensitySub: "调整效果的可见度和运动强度。",
      backgroundEffectLow: "低",
      backgroundEffectMedium: "中",
      backgroundEffectHigh: "高",
      backgroundEffectStatusNone: "未启用背景效果。",
      backgroundEffectStatusActive: "背景效果已在此设备启用。",
      wallpaperDefault: "默认",
      wallpaperAurora: "极光",
      wallpaperGrid: "霓虹网格",
      wallpaperNebula: "星云",
      wallpaperOcean: "海洋光",
      wallpaperViolet: "紫色玻璃",
      wallpaperCustom: "设备图片",
      wallpaperUpload: "选择图片",
      wallpaperRemove: "移除图片",
      wallpaperCustomEmpty: "尚未选择设备图片。",
      wallpaperCustomSaved: "自定义壁纸已启用 • 仅保存在此设备。",
      wallpaperProcessing: "正在准备壁纸…",
      wallpaperSaved: "壁纸已成功更新。",
      wallpaperRemoved: "设备壁纸已移除。",
      wallpaperInvalidType: "请选择 JPG、PNG 或 WebP 图片。",
      wallpaperInvalidSize: "图片太大，无法处理。请选择较小的图片。",
      wallpaperStorageFailed: "此设备无法保存壁纸。请选择更小的图片，或释放一些浏览器存储空间。",
      themeCreator: "主题创建器",
      themeCreatorSub: "创建自己的界面风格，并仅保存在此设备上。",
      themeCreatorPresets: "快速配色",
      themeCreatorPresetsSub: "先选择预设，再进行细节调整。",
      themePaletteOcean: "海洋",
      themePaletteViolet: "紫色",
      themePaletteMint: "薄荷",
      themePaletteSunset: "日落",
      themeCreatorPrimary: "主色",
      themeCreatorSecondary: "辅助色",
      themeCreatorGlow: "光晕强度",
      themeCreatorRadius: "圆角大小",
      themeCreatorBackground: "背景强度",
      themeCreatorCustom: "自定义",
      themeCreatorDeviceOnly: "仅此设备",
      themeCreatorActive: "自定义主题已启用 • 已保存在此设备。",
      themeCreatorInactive: "自定义主题未启用。",
      themeCreatorReset: "重置",
      workspaceIdentity: "工作区身份",
      workspaceNameTitle: "个人工作区名称",
      workspaceNameSub: "为您的 Z28 工作区设置名称，仅保存在此设备上。",
      workspaceNamePlaceholder: "我的工作区",
      workspaceNameHint: "1–32 个字符",
      workspaceNameSave: "保存工作区名称",
      workspaceNameSaved: "工作区名称已保存在此设备上。",
      workspaceNameReset: "重置",
      workspaceNameDeviceOnly: "仅此设备",
      workspaceNameInvalid: "请输入 1–32 个字符的工作区名称。",
      workspaceNameDefault: "我的工作区",

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
      connectSelectBoth: "请先选择来源群组和目标群组。",
      connectGuideKicker: "使用说明",
      connectGuideTitle: "如何连接群组",
      connectGuideSub: "按照以下步骤，将超时通知从一个群组发送到另一个群组。",
      connectGuideStep1Title: "选择来源群组",
      connectGuideStep1Copy: "选择 Z28 检测活动超时的群组。该群组的超时通知会被发送到您指定的目标群组。",
      connectGuideStep2Title: "选择目标群组",
      connectGuideStep2Copy: "选择接收超时通知的群组。两个群组都必须对您的账号和 Bot 可用。",
      connectGuideStep3Title: "检查连接路径",
      connectGuideStep3Copy: "确认来源群组和目标群组不是同一个群组。上方状态区域会显示连接是否已经准备就绪。",
      connectGuideStep4Title: "连接并确认",
      connectGuideStep4Copy: "点击连接群组。保存成功后，上方会显示当前连接；以后需要更换目标时可以使用更换群组。",
      connectGuideRule1: "只能选择您的 Telegram 账号和 Bot 都可以使用，并具备所需权限的群组。",
      connectGuideRule2: "每个来源群组只能有一个有效目标群组。保存新的目标后，该来源群组的连接会被更新。",
      connectGuideRule3: "如果只想更换目标群组，无需重新开始，请直接使用更换群组。",
      connectGuideHide: "隐藏说明",
      connectGuideShow: "显示说明",
      connectFlowKicker: "连接后会发生什么",
      connectFlowTitle: "连接的工作方式",
      connectFlowSub: "连接会把来源群组产生的超时通知发送到目标群组。",
      connectFlowStep1Title: "活动在来源群组开始",
      connectFlowStep1Copy: "成员在来源群组中开始 Eat、WC、Smoke 或 WCD 等活动。",
      connectFlowStep2Title: "应用来源群组的时间限制",
      connectFlowStep2Copy: "Z28 使用该来源群组设置的活动时间限制，判断活动是否已经超时。",
      connectFlowStep3Title: "成员超过限制后点击返回",
      connectFlowStep3Copy: "成员超过允许时间后点击返回时，Z28 会计算超时时长。只要数值大于零，就会判定为超时。",
      connectFlowStep4Title: "Z28 生成超时通知",
      connectFlowStep4Copy: "Z28 记录这次超时，并生成包含来源群组、成员、活动类型和超时时长的通知。",
      connectFlowStep5Title: "通知发送到目标群组",
      connectFlowStep5Copy: "由于来源群组已建立连接，超时通知会发送到所配置的目标群组。",
      connectFlowExampleLabel: "示例",
      connectFlowExample: "来源：Main Group → 目标：Admin Group。成员开始 Eat，限制为 30 分钟，38 分钟后返回。Z28 判断超时 8 分钟，并向 Admin Group 发送超时通知。",
      connectFlowImportant1: "在允许时间内返回：活动正常结束，不会创建连接群组超时通知。",
      connectFlowImportant2: "超过允许时间：记录超时，并可向已连接的目标群组发送超时通知。",
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
      themeLight: "浅色",
      themeLightSub: "柔和明亮的界面",
      themeWhite: "纯白",
      themeWhiteSub: "干净纯白的界面",
      animations: "动画",
      animationsSub: "保持界面动画和过渡效果。",
      compactMode: "紧凑模式",
      compactModeSub: "减少间距，让布局更加紧凑。",
      accessibilityTitle: "无障碍阅读", accessibilitySub: "提高文字与对比度的可读性。设置仅保存在此设备上。", textSize: "文字大小", textSizeSub: "选择适合您阅读的 Mini App 文字大小。", textSizeStandard: "标准", textSizeStandardSub: "平衡", textSizeLarge: "大", textSizeLargeSub: "更易阅读", textSizeExtraLarge: "特大", textSizeExtraLargeSub: "最大可读性", highContrast: "高对比度", highContrastSub: "提高文字和控件的对比度，让内容更清晰。",
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
      noGroupEyebrow: "个人工作区",
      noGroup: "欢迎进入您的 Z28 工作区",
      noGroupConnect: "连接群组",
      noGroupStatus: "尚未连接群组",
      noGroupCopy: "您的个人 Mini App 空间已经准备好。获得可用的群组管理权限后，Group Dashboard 工具会自动出现。",
      noGroupHelpTitle: "快速访问",
      noGroupHelpCaption: "个人偏好设置仅保存在此设备上。",
      noGroupStep1Title: "外观",
      noGroupStep1Copy: "自定义主题、壁纸、动画和工作区名称。",
      noGroupStep2Title: "帮助与支持",
      noGroupStep2Copy: "查看常见问题并获取 Z28 使用帮助。",
      noGroupStep3Title: "关于 Z28",
      noGroupStep3Copy: "查看应用信息、隐私、使用条款和创建者信息。",
      noGroupNote: "当前账号暂时没有可用的群组仪表板。群组访问权限发生变化后，请重新打开 Mini App。",
      noGroupBack: "检查群组权限",
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
      reportNoGroup: "尚未连接群组",
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
      "user-no-group-connect","user-no-group-back","user-no-group-back-label",
      "user-dashboard-error-screen","user-dashboard-error-title","user-dashboard-error-lead",
      "user-dashboard-error-retry","user-dashboard","user-group-options",
      "group-options-title","group-options-subtitle","user-group-options-list",
      "user-selected-dashboard","user-onboarding","user-onboarding-title","user-onboarding-sub",
      "user-onboarding-step1-title","user-onboarding-step1-copy","user-onboarding-step2-title","user-onboarding-step2-copy",
      "user-onboarding-step3-title","user-onboarding-step3-copy","user-onboarding-tools","user-onboarding-appearance","user-onboarding-dismiss",
      "selected-group-eyebrow","user-selected-group-title",
      "user-dashboard-sub","refresh","auto-refresh-toggle","auto-refresh-label",
      "switch-group","switch-group-label",
      "user-member-count","user-active-count","user-group-member-label",
      "user-member-active-label","settings-title","settings-subtitle",
      "user-settings-limits-card","user-settings-counts-card","user-settings-names-card",
      "user-tools-page","user-tools-tab-label","user-tools-title","user-tools-sub",
      "user-tools-directory","user-tools-directory-kicker","user-tools-directory-title","user-tools-directory-sub",
      "user-tools-active-group-label","user-tools-active-group","user-tools-active-role",
      "user-tool-connection-kicker","user-tool-connection-title","user-tool-connection-sub",
      "user-tool-replies-kicker","user-tool-replies-title","user-tool-replies-sub",
      "user-tool-detail","user-tool-detail-back","user-tool-detail-back-label","user-tool-detail-kicker",
      "user-tool-detail-title","user-tool-detail-sub","user-tool-detail-replies","user-tool-detail-connection",
      "user-tools-category-kicker","user-tools-category-title","user-tools-category-sub",
      "user-connect-title","user-connect-sub",
      "user-connect-source-label","user-connect-source-sub","user-connect-source",
      "user-connect-target-label","user-connect-target-sub","user-connect-target",
      "user-connect-note","user-connect-submit","user-connect-status-title","user-connect-status-value",
      "user-connect-status-meta","user-connect-change",
      "user-reply-messages-kicker","user-reply-messages-title","user-reply-messages-sub",
      "user-reply-messages-group-label","user-reply-messages-group","user-reply-messages-role",
      "user-reply-messages-note","user-reply-messages-language-title","user-reply-messages-language-sub",
      "user-reply-locale-en","user-reply-locale-mm","user-reply-locale-zh","user-reply-messages-list",
      "user-reply-save","user-reply-discard","user-reply-reset-language",
      "user-reply-messages-status","user-reply-status-dot","user-reply-status-text",
      "user-connect-guide-kicker","user-connect-guide-title","user-connect-guide-sub",
      "user-connect-guide-step1-title","user-connect-guide-step1-copy",
      "user-connect-guide-step2-title","user-connect-guide-step2-copy",
      "user-connect-guide-step3-title","user-connect-guide-step3-copy",
      "user-connect-guide-step4-title","user-connect-guide-step4-copy",
      "user-connect-guide-rule1","user-connect-guide-rule2","user-connect-guide-rule3",
      "user-connect-guide-toggle","user-connect-guide-toggle-label","user-connect-help",
      "user-connect-flow-kicker","user-connect-flow-title","user-connect-flow-sub",
      "user-connect-flow-step1-title","user-connect-flow-step1-copy",
      "user-connect-flow-step2-title","user-connect-flow-step2-copy",
      "user-connect-flow-step3-title","user-connect-flow-step3-copy",
      "user-connect-flow-step4-title","user-connect-flow-step4-copy",
      "user-connect-flow-step5-title","user-connect-flow-step5-copy",
      "user-connect-flow-example-label","user-connect-flow-example",
      "user-connect-flow-important1","user-connect-flow-important2",
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
      "appearance-theme-dark","appearance-theme-midnight","appearance-theme-amoled","appearance-theme-light","appearance-theme-white",
      "user-appearance-theme-dark-title","user-appearance-theme-dark-sub",
      "user-appearance-theme-midnight-title","user-appearance-theme-midnight-sub",
      "user-appearance-theme-amoled-title","user-appearance-theme-amoled-sub",
      "user-appearance-theme-light-title","user-appearance-theme-light-sub",
      "user-appearance-theme-white-title","user-appearance-theme-white-sub",
      "user-appearance-wallpaper-title","user-appearance-wallpaper-sub",
      "appearance-wallpaper-default","appearance-wallpaper-aurora","appearance-wallpaper-grid",
      "appearance-wallpaper-nebula","appearance-wallpaper-ocean","appearance-wallpaper-violet","appearance-wallpaper-custom",
      "user-appearance-wallpaper-default","user-appearance-wallpaper-aurora",
      "user-appearance-wallpaper-grid","user-appearance-wallpaper-nebula",
      "user-appearance-wallpaper-ocean","user-appearance-wallpaper-violet","user-appearance-wallpaper-custom",
      "appearance-wallpaper-custom-preview","appearance-wallpaper-file","appearance-wallpaper-upload",
      "appearance-wallpaper-remove","appearance-wallpaper-status",
      "appearance-effects","appearance-effects-canvas",
      "user-appearance-effects-title","user-appearance-effects-sub",
      "user-background-effect-none","user-background-effect-none-sub",
      "user-background-effect-dollar","user-background-effect-dollar-sub",
      "user-background-effect-coins","user-background-effect-coins-sub",
      "user-background-effect-hacker","user-background-effect-hacker-sub",
      "user-appearance-effects-intensity","user-appearance-effects-intensity-sub",
      "user-background-intensity-low","user-background-intensity-medium","user-background-intensity-high",
      "appearance-background-effect-status",
      "appearance-animations-toggle","user-appearance-animations-title","user-appearance-animations-sub",
      "user-appearance-animations-state","appearance-compact-toggle","user-appearance-compact-title",
      "user-appearance-compact-sub","user-appearance-compact-state",
      "user-appearance-accessibility-title","user-appearance-accessibility-sub","user-accessibility-text-size-title","user-accessibility-text-size-sub","user-accessibility-text-size-value","user-accessibility-text-standard","user-accessibility-text-standard-sub","user-accessibility-text-large","user-accessibility-text-large-sub","user-accessibility-text-extra-large","user-accessibility-text-extra-large-sub","appearance-high-contrast-toggle","user-accessibility-contrast-title","user-accessibility-contrast-sub","user-accessibility-contrast-state",
      "workspace-identity","workspace-name-kicker","workspace-name-title","workspace-name-sub",
      "workspace-name-badge","workspace-name-input","workspace-name-hint","workspace-name-count",
      "workspace-name-save","workspace-name-save-label","workspace-name-reset","workspace-name-reset-label",
      "workspace-name-status","workspace-name-status-dot","workspace-name-status-text",
      "theme-creator-title","theme-creator-sub","theme-creator-badge",
      "theme-creator-preview","theme-creator-preview-title","theme-creator-preview-status",
      "theme-creator-preview-label","theme-creator-preview-value","theme-creator-preview-chip",
      "theme-creator-presets-title","theme-creator-presets-sub",
      "theme-palette-ocean-label","theme-palette-violet-label","theme-palette-mint-label","theme-palette-sunset-label",
      "theme-creator-primary","theme-creator-primary-value","theme-creator-primary-label","theme-creator-primary-swatch",
      "theme-creator-secondary","theme-creator-secondary-value","theme-creator-secondary-label","theme-creator-secondary-swatch",
      "theme-creator-glow","theme-creator-glow-value","theme-creator-glow-label",
      "theme-creator-radius","theme-creator-radius-value","theme-creator-radius-label",
      "theme-creator-background","theme-creator-background-value","theme-creator-background-label",
      "theme-creator-save-dot","theme-creator-save-state","theme-creator-reset","theme-creator-reset-label",
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

  function normalizeWorkspaceName(value) {
    var raw = String(value == null ? "" : value)
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return Array.from(raw).slice(0, 32).join("");
  }

  function getStoredWorkspaceName() {
    var raw = readStorage(STORAGE_KEYS.workspaceName);
    if (raw == null) return null;
    var normalized = normalizeWorkspaceName(raw);
    return normalized ? normalized : null;
  }

  function applyWorkspaceIdentity() {
    if (!els["workspace-identity"]) return;
    var name = normalizeWorkspaceName(state.workspaceName) || text("workspaceNameDefault");
    state.workspaceName = name;
    els["workspace-identity"].textContent = name;
    els["workspace-identity"].title = name;
    els["workspace-identity"].setAttribute("aria-label", text("workspaceNameTitle") + ": " + name);
  }

  function updateWorkspaceNameControls() {
    if (!els["workspace-name-input"]) return;
    var value = normalizeWorkspaceName(els["workspace-name-input"].value);
    var saved = normalizeWorkspaceName(state.workspaceName);
    var length = Array.from(value).length;
    var valid = length >= 1 && length <= 32;
    els["workspace-name-input"].value = value;
    els["workspace-name-count"].textContent = length + " / 32";
    els["workspace-name-input"].setAttribute("aria-invalid", String(!valid));
    els["workspace-name-save"].disabled = !valid || value === saved;
    els["workspace-name-save"].setAttribute("aria-disabled", String(!valid || value === saved));
    els["workspace-name-status-dot"].classList.toggle("is-active", valid && value === saved);
    if (!valid) {
      els["workspace-name-status-text"].textContent = text("workspaceNameInvalid");
    } else if (value !== saved) {
      els["workspace-name-status-text"].textContent = text("workspaceNameSave");
    } else {
      els["workspace-name-status-text"].textContent = text("workspaceNameSaved");
    }
  }

  function saveWorkspaceName() {
    var value = normalizeWorkspaceName(els["workspace-name-input"].value);
    var length = Array.from(value).length;
    if (length < 1 || length > 32) {
      showNotice(text("workspaceNameInvalid"), "error");
      updateWorkspaceNameControls();
      els["workspace-name-input"].focus({ preventScroll: true });
      return;
    }
    state.workspaceName = value;
    writeStorage(STORAGE_KEYS.workspaceName, value);
    applyWorkspaceIdentity();
    updateWorkspaceNameControls();
    showNotice(text("workspaceNameSaved"), "ok");
  }

  function resetWorkspaceName() {
    state.workspaceName = text("workspaceNameDefault");
    removeStorage(STORAGE_KEYS.workspaceName);
    els["workspace-name-input"].value = state.workspaceName;
    applyWorkspaceIdentity();
    updateWorkspaceNameControls();
    showNotice(text("workspaceNameSaved"), "ok");
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

  function clampNumber(value, min, max, fallback) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
  }

  function normalizeHex(value, fallback) {
    var normalized = String(value == null ? "" : value).trim().toLowerCase();
    return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback;
  }

  function hexToRgbChannels(hex) {
    var normalized = normalizeHex(hex, "#000000").slice(1);
    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16)
    ].join(", ");
  }

  function getThemeBasePalette(theme) {
    return THEME_PALETTES[theme] || THEME_PALETTES.dark;
  }

  function normalizeThemeCreator(raw) {
    var base = getThemeBasePalette(state.appearanceTheme);
    var value = raw && typeof raw === "object" ? raw : {};
    return {
      enabled: value.enabled === true,
      primary: normalizeHex(value.primary, base.primary),
      secondary: normalizeHex(value.secondary, base.secondary),
      glow: Math.round(clampNumber(value.glow, 0, 100, THEME_CREATOR_DEFAULTS.glow)),
      radius: Math.round(clampNumber(value.radius, 10, 28, THEME_CREATOR_DEFAULTS.radius)),
      background: Math.round(clampNumber(value.background, 0, 100, THEME_CREATOR_DEFAULTS.background))
    };
  }

  function getThemeCreatorStorage() {
    var raw = readStorage(STORAGE_KEYS.themeCreator);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? normalizeThemeCreator(parsed) : null;
    } catch (_) {
      removeStorage(STORAGE_KEYS.themeCreator);
      return null;
    }
  }

  function saveThemeCreator() {
    var normalized = normalizeThemeCreator(state.themeCreator);
    state.themeCreator = normalized;
    writeStorage(STORAGE_KEYS.themeCreator, JSON.stringify(normalized));
  }

  function applyThemeCreatorStyles() {
    var root = document.documentElement;
    var custom = normalizeThemeCreator(state.themeCreator);
    state.themeCreator = custom;

    if (!custom.enabled) {
      root.setAttribute("data-custom-theme", "off");
      [
        "--creator-accent",
        "--creator-secondary",
        "--creator-accent-rgb",
        "--creator-secondary-rgb",
        "--creator-glow-1",
        "--creator-glow-2",
        "--creator-shadow-alpha",
        "--creator-bg-1",
        "--creator-bg-2",
        "--creator-surface-glow",
        "--radius-xl",
        "--radius-lg",
        "--radius-md"
      ].forEach(function (property) {
        root.style.removeProperty(property);
      });
      return;
    }

    var glowRatio = custom.glow / 100;
    var backgroundRatio = custom.background / 100;
    root.setAttribute("data-custom-theme", "on");
    root.style.setProperty("--creator-accent", custom.primary);
    root.style.setProperty("--creator-secondary", custom.secondary);
    root.style.setProperty("--creator-accent-rgb", hexToRgbChannels(custom.primary));
    root.style.setProperty("--creator-secondary-rgb", hexToRgbChannels(custom.secondary));
    root.style.setProperty("--creator-glow-1", (0.035 + glowRatio * 0.135).toFixed(3));
    root.style.setProperty("--creator-glow-2", (0.03 + glowRatio * 0.12).toFixed(3));
    root.style.setProperty("--creator-shadow-alpha", (0.08 + glowRatio * 0.22).toFixed(3));
    root.style.setProperty("--creator-bg-1", (0.015 + backgroundRatio * 0.125).toFixed(3));
    root.style.setProperty("--creator-bg-2", (0.012 + backgroundRatio * 0.11).toFixed(3));
    root.style.setProperty("--creator-surface-glow", (0.025 + glowRatio * 0.09).toFixed(3));

    var radius = custom.radius;
    root.style.setProperty("--radius-xl", (radius + 6) + "px");
    root.style.setProperty("--radius-lg", radius + "px");
    root.style.setProperty("--radius-md", Math.max(8, radius - 4) + "px");
  }

  function applyAppearancePreferences() {
    var root = document.documentElement;
    var activeWallpaper = state.wallpaper;

    if (activeWallpaper === "custom" && !state.customWallpaper) {
      activeWallpaper = "default";
      state.wallpaper = "default";
      writeStorage(STORAGE_KEYS.wallpaper, "default");
    }

    root.setAttribute("data-theme", state.appearanceTheme);
    root.setAttribute("data-wallpaper", activeWallpaper);
    root.setAttribute("data-background-effect", state.backgroundEffect);
    root.setAttribute("data-background-effect-intensity", state.backgroundEffectIntensity);
    if (state.customWallpaper) {
      root.style.setProperty("--z28-custom-wallpaper", "url(" + state.customWallpaper + ")");
    } else {
      root.style.removeProperty("--z28-custom-wallpaper");
    }
    root.setAttribute("data-animations", state.animationsEnabled ? "on" : "off");
    root.setAttribute("data-compact", state.compactMode ? "on" : "off");
    root.setAttribute("data-text-size", ["standard","large","extra-large"].indexOf(state.textSize) >= 0 ? state.textSize : "standard");
    root.setAttribute("data-high-contrast", state.highContrast ? "on" : "off");
    applyThemeCreatorStyles();
    updateAppearanceControls();
    updateBackgroundEffectControls();
    syncBackgroundEffectEngine();
  }

  function updateThemeCreatorControls() {
    if (!els["theme-creator-primary"]) return;

    var custom = normalizeThemeCreator(state.themeCreator);
    var base = getThemeBasePalette(state.appearanceTheme);
    var palette = custom.enabled
      ? custom
      : Object.assign({}, custom, base);

    els["theme-creator-primary"].value = normalizeHex(palette.primary, THEME_CREATOR_DEFAULTS.primary);
    els["theme-creator-secondary"].value = normalizeHex(palette.secondary, THEME_CREATOR_DEFAULTS.secondary);
    els["theme-creator-glow"].value = String(custom.glow);
    els["theme-creator-radius"].value = String(custom.radius);
    els["theme-creator-background"].value = String(custom.background);

    els["theme-creator-primary-value"].textContent = els["theme-creator-primary"].value.toUpperCase();
    els["theme-creator-secondary-value"].textContent = els["theme-creator-secondary"].value.toUpperCase();
    els["theme-creator-glow-value"].textContent = custom.glow + "%";
    els["theme-creator-radius-value"].textContent = custom.radius + "px";
    els["theme-creator-background-value"].textContent = custom.background + "%";

    els["theme-creator-primary-swatch"].style.background = palette.primary;
    els["theme-creator-secondary-swatch"].style.background = palette.secondary;

    els["theme-creator-save-state"].textContent = custom.enabled
      ? text("themeCreatorActive")
      : text("themeCreatorInactive");
    els["theme-creator-save-dot"].classList.toggle("is-active", custom.enabled);
    els["theme-creator-badge"].textContent = custom.enabled
      ? text("themeCreatorCustom")
      : text("themeCreatorDeviceOnly");

    els["theme-creator-preview"].style.setProperty("--preview-primary", palette.primary);
    els["theme-creator-preview"].style.setProperty("--preview-secondary", palette.secondary);
    els["theme-creator-preview"].style.setProperty("--preview-primary-rgb", hexToRgbChannels(palette.primary));
    els["theme-creator-preview"].style.setProperty("--preview-secondary-rgb", hexToRgbChannels(palette.secondary));
    els["theme-creator-preview"].style.setProperty("--preview-glow", String(0.08 + (custom.glow / 100) * 0.28));
    els["theme-creator-preview"].style.setProperty("--preview-radius", custom.radius + "px");
    els["theme-creator-preview-status"].textContent = custom.enabled
      ? text("themeCreatorCustom").toUpperCase()
      : text("themeCreator").toUpperCase();
  }

  function setThemeCreatorField(field, value) {
    var custom = normalizeThemeCreator(state.themeCreator);
    if (field === "primary" || field === "secondary") {
      custom[field] = normalizeHex(value, custom[field]);
    } else if (field === "glow") {
      custom.glow = Math.round(clampNumber(value, 0, 100, custom.glow));
    } else if (field === "radius") {
      custom.radius = Math.round(clampNumber(value, 10, 28, custom.radius));
    } else if (field === "background") {
      custom.background = Math.round(clampNumber(value, 0, 100, custom.background));
    } else {
      return;
    }
    custom.enabled = true;
    state.themeCreator = custom;
    saveThemeCreator();
    applyAppearancePreferences();
  }

  function applyThemePalette(palette) {
    var selected = THEME_PALETTES[palette];
    if (!selected) return;

    var custom = normalizeThemeCreator(state.themeCreator);
    custom.enabled = true;
    custom.primary = selected.primary;
    custom.secondary = selected.secondary;
    state.themeCreator = custom;
    saveThemeCreator();
    applyAppearancePreferences();
  }

  function resetThemeCreator() {
    var base = getThemeBasePalette(state.appearanceTheme);
    state.themeCreator = {
      enabled: false,
      primary: base.primary,
      secondary: base.secondary,
      glow: THEME_CREATOR_DEFAULTS.glow,
      radius: THEME_CREATOR_DEFAULTS.radius,
      background: THEME_CREATOR_DEFAULTS.background
    };
    removeStorage(STORAGE_KEYS.themeCreator);
    applyAppearancePreferences();
  }

  function updateOnboardingVisibility() {
    if (!els["user-onboarding"]) return;
    var canShow =
      state.onboardingVisible &&
      Boolean(state.dashboard && state.dashboard.selectedGroup) &&
      !state.groupPickerOpen &&
      !state.aboutOpen &&
      !state.supportOpen &&
      !state.toolsOpen &&
      !state.appearanceOpen;
    els["user-onboarding"].hidden = !canShow;
  }

  function completeOnboarding() {
    if (!state.onboardingVisible) return;
    state.onboardingVisible = false;
    writeStorage(STORAGE_KEYS.onboarding, "1");
    updateOnboardingVisibility();
  }

  function openOnboardingDestination(tab) {
    completeOnboarding();
    setDashboardTab(tab);
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
      var selectedWallpaper = input.value === state.wallpaper &&
        (input.value !== "custom" || Boolean(state.customWallpaper));
      input.checked = selectedWallpaper;
      var wallpaperOption = input.closest(".appearance-wallpaper-option");
      if (wallpaperOption) wallpaperOption.classList.toggle("is-selected", selectedWallpaper);
    });

    if (els["appearance-wallpaper-custom-preview"]) {
      els["appearance-wallpaper-custom-preview"].style.backgroundImage = state.customWallpaper
        ? "url(" + state.customWallpaper + ")"
        : "";
      els["appearance-wallpaper-custom-preview"].classList.toggle("has-image", Boolean(state.customWallpaper));
    }
    if (els["appearance-wallpaper-upload"]) {
      els["appearance-wallpaper-upload"].textContent = text("wallpaperUpload");
    }
    if (els["appearance-wallpaper-remove"]) {
      els["appearance-wallpaper-remove"].textContent = text("wallpaperRemove");
      els["appearance-wallpaper-remove"].disabled = !state.customWallpaper;
    }
    if (els["appearance-wallpaper-status"]) {
      els["appearance-wallpaper-status"].textContent = state.customWallpaper
        ? text("wallpaperCustomSaved")
        : text("wallpaperCustomEmpty");
    }

    els["appearance-animations-toggle"].setAttribute("aria-checked", String(state.animationsEnabled));
    els["appearance-animations-toggle"].classList.toggle("is-enabled", state.animationsEnabled);
    els["user-appearance-animations-state"].textContent =      state.animationsEnabled ? text("appearanceOn") : text("appearanceOff");

    els["appearance-compact-toggle"].setAttribute("aria-checked", String(state.compactMode));
    els["appearance-compact-toggle"].classList.toggle("is-enabled", state.compactMode);
    els["user-appearance-compact-state"].textContent =
      state.compactMode ? text("appearanceOn") : text("appearanceOff");

    document.querySelectorAll("[data-text-size-option]").forEach(function (button) {
      var selected = button.getAttribute("data-text-size-option") === state.textSize;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    if (els["user-accessibility-text-size-value"]) els["user-accessibility-text-size-value"].textContent = state.textSize === "large" ? text("textSizeLarge") : state.textSize === "extra-large" ? text("textSizeExtraLarge") : text("textSizeStandard");
    els["appearance-high-contrast-toggle"].setAttribute("aria-checked", String(state.highContrast));
    els["appearance-high-contrast-toggle"].classList.toggle("is-enabled", state.highContrast);
    els["user-accessibility-contrast-state"].textContent = state.highContrast ? text("appearanceOn") : text("appearanceOff");

    updateThemeCreatorControls();
    updateBackgroundEffectControls();
  }

  function setAppearanceTheme(theme) {
    if (["dark","midnight","amoled","light","white"].indexOf(theme) === -1) return;
    state.appearanceTheme = theme;
    if (!state.themeCreator || !state.themeCreator.enabled) {
      var base = getThemeBasePalette(theme);
      state.themeCreator = Object.assign({}, normalizeThemeCreator(state.themeCreator), {
        enabled: false,
        primary: base.primary,
        secondary: base.secondary
      });
    }
    writeStorage(STORAGE_KEYS.appearanceTheme, theme);
    applyAppearancePreferences();
  }

  function setWallpaper(wallpaper) {
    var allowed = ["default","aurora","grid","nebula","ocean","violet","custom"];
    if (allowed.indexOf(wallpaper) === -1) return;
    if (wallpaper === "custom" && !state.customWallpaper) return;
    state.wallpaper = wallpaper;
    writeStorage(STORAGE_KEYS.wallpaper, wallpaper);
    applyAppearancePreferences();
  }

  function setBackgroundEffect(effect) {
    if (BACKGROUND_EFFECTS.indexOf(effect) === -1) return;
    state.backgroundEffect = effect;
    writeStorage(STORAGE_KEYS.backgroundEffect, effect);
    applyAppearancePreferences();
  }
  function setBackgroundEffectIntensity(intensity) {
    if (BACKGROUND_EFFECT_INTENSITIES.indexOf(intensity) === -1) return;
    state.backgroundEffectIntensity = intensity;
    writeStorage(STORAGE_KEYS.backgroundEffectIntensity, intensity);
    applyAppearancePreferences();
  }

  function getStoredCustomWallpaper() {
    var raw = readStorage(STORAGE_KEYS.wallpaperCustom);
    if (!raw) return null;
    if (
      raw.length > 1800000 ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(raw)
    ) {
      removeStorage(STORAGE_KEYS.wallpaperCustom);
      return null;
    }
    return raw;
  }

  function writeStorageChecked(key, value) {
    try {
      localStorage.setItem(key, value);
      return localStorage.getItem(key) === value;
    } catch (_) {
      return false;
    }
  }

  function restoreStorageValue(key, value) {
    if (value == null) removeStorage(key);
    else writeStorage(key, value);
  }

  function compressWallpaperImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || ["image/jpeg","image/png","image/webp"].indexOf(file.type) === -1) {
        reject(new Error("wallpaperInvalidType"));
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        reject(new Error("wallpaperInvalidSize"));
        return;
      }

      var image = new Image();
      var objectUrl = null;
      var cleanup = function () {
        if (objectUrl && window.URL && typeof window.URL.revokeObjectURL === "function") {
          window.URL.revokeObjectURL(objectUrl);
        }
        objectUrl = null;
      };

      image.onerror = function () {
        cleanup();
        reject(new Error("wallpaperInvalidType"));
      };

      image.onload = function () {
        try {
          var maxSides = [1600,1400,1200,1000,900];
          var qualities = [0.78,0.68,0.58,0.50];
          var width = Number(image.naturalWidth || image.width);
          var height = Number(image.naturalHeight || image.height);
          if (!width || !height) throw new Error("wallpaperInvalidType");

          for (var s = 0; s < maxSides.length; s += 1) {
            var scale = Math.min(1, maxSides[s] / Math.max(width, height));
            var canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(width * scale));
            canvas.height = Math.max(1, Math.round(height * scale));
            var context = canvas.getContext("2d");
            if (!context) continue;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            for (var q = 0; q < qualities.length; q += 1) {
              var dataUrl = canvas.toDataURL("image/jpeg", qualities[q]);
              if (dataUrl.length <= 1800000) {
                cleanup();
                resolve(dataUrl);
                return;
              }
            }
          }
          cleanup();
          reject(new Error("wallpaperInvalidSize"));
        } catch (_) {
          cleanup();
          reject(new Error("wallpaperInvalidSize"));
        }
      };

      if (window.URL && typeof window.URL.createObjectURL === "function") {
        objectUrl = window.URL.createObjectURL(file);
        image.src = objectUrl;
        return;
      }

      var reader = new FileReader();
      reader.onerror = function () {
        reject(new Error("wallpaperInvalidType"));
      };
      reader.onload = function () {
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleCustomWallpaperFile(file) {
    if (!file || !els["appearance-wallpaper-file"]) return;

    els["appearance-wallpaper-file"].disabled = true;
    if (els["appearance-wallpaper-upload"]) {
      els["appearance-wallpaper-upload"].classList.add("is-busy");
      els["appearance-wallpaper-upload"].setAttribute("aria-disabled", "true");
    }
    showNotice(text("wallpaperProcessing"), "ok");

    var previousCustomStorage = readStorage(STORAGE_KEYS.wallpaperCustom);
    var previousWallpaperStorage = readStorage(STORAGE_KEYS.wallpaper);
    var previousCustomState = state.customWallpaper;
    var previousWallpaperState = state.wallpaper;

    try {
      var dataUrl = await compressWallpaperImage(file);
      if (!writeStorageChecked(STORAGE_KEYS.wallpaperCustom, dataUrl)) {
        throw new Error("wallpaperStorageFailed");
      }
      if (!writeStorageChecked(STORAGE_KEYS.wallpaper, "custom")) {
        restoreStorageValue(STORAGE_KEYS.wallpaperCustom, previousCustomStorage);
        restoreStorageValue(STORAGE_KEYS.wallpaper, previousWallpaperStorage);
        throw new Error("wallpaperStorageFailed");
      }

      state.customWallpaper = dataUrl;
      state.wallpaper = "custom";
      applyAppearancePreferences();
      showNotice(text("wallpaperSaved"), "ok");
    } catch (error) {
      state.customWallpaper = previousCustomState;
      state.wallpaper = previousWallpaperState;
      showNotice(text(error && TEXT[state.language] && TEXT[state.language][error.message]
        ? error.message
        : "wallpaperStorageFailed"), "error");
    } finally {
      els["appearance-wallpaper-file"].value = "";
      els["appearance-wallpaper-file"].disabled = false;
      if (els["appearance-wallpaper-upload"]) {
        els["appearance-wallpaper-upload"].classList.remove("is-busy");
        els["appearance-wallpaper-upload"].removeAttribute("aria-disabled");
      }
      updateAppearanceControls();
    }
  }

  function removeCustomWallpaper() {
    if (!state.customWallpaper) return;

    var previousCustomStorage = readStorage(STORAGE_KEYS.wallpaperCustom);
    var previousWallpaperStorage = readStorage(STORAGE_KEYS.wallpaper);

    removeStorage(STORAGE_KEYS.wallpaperCustom);
    if (!writeStorageChecked(STORAGE_KEYS.wallpaper, "default")) {
      restoreStorageValue(STORAGE_KEYS.wallpaperCustom, previousCustomStorage);
      restoreStorageValue(STORAGE_KEYS.wallpaper, previousWallpaperStorage);
      showNotice(text("wallpaperStorageFailed"), "error");
      return;
    }

    state.customWallpaper = null;
    state.wallpaper = "default";
    applyAppearancePreferences();
    showNotice(text("wallpaperRemoved"), "ok");
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

  function setTextSize(size) {
    if (["standard","large","extra-large"].indexOf(size) === -1) return;
    state.textSize = size;
    writeStorage(STORAGE_KEYS.textSize, size);
    applyAppearancePreferences();
  }

  function toggleHighContrast() {
    state.highContrast = !state.highContrast;
    writeStorage(STORAGE_KEYS.highContrast, state.highContrast ? "1" : "0");
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
    var editors = document.querySelectorAll(".setting-editor, .activity-name-editor");
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
    if (state.aboutOpen) {
      els.title.textContent = text("about");
    } else if (state.supportOpen) {
      els.title.textContent = text("helpSupport");
    } else if (state.toolsOpen) {
      els.title.textContent = text("tools");
    } else if (state.appearanceOpen) {
      els.title.textContent = text("appearance");
    } else {
      els.title.textContent = state.normalUserMode ? text("noGroup") : text("title");
    }
    els.identity.textContent = state.verifiedUserId ? userGreeting() : text("startup");
    applyWorkspaceIdentity();
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
    els["user-no-group-connect"].querySelector(".button-label").textContent = text("noGroupConnect");
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
    els["user-tools-category-kicker"].textContent = text("toolsCategoryKicker");
    els["user-tools-category-title"].textContent = text("toolsCategoryTitle");
    els["user-tools-category-sub"].textContent = text("toolsCategorySub");

    els["user-tools-directory-kicker"].textContent = text("toolsDirectoryKicker");
    els["user-tools-directory-title"].textContent = text("toolsDirectoryTitle");
    els["user-tools-directory-sub"].textContent = text("toolsDirectorySub");
    els["user-tools-active-group-label"].textContent = text("toolsCurrentGroup");
    els["user-tool-connection-kicker"].textContent = text("toolConnectionKicker");
    els["user-tool-connection-title"].textContent = text("connectTitle");
    els["user-tool-connection-sub"].textContent = text("connectSub");
    els["user-tool-replies-kicker"].textContent = text("toolRepliesKicker");
    els["user-tool-replies-title"].textContent = text("replyMessagesTitle");
    els["user-tool-replies-sub"].textContent = text("replyMessagesSub");
    els["user-tool-detail-back-label"].textContent = text("toolBack");
    els["user-tool-detail-kicker"].textContent = text("toolDetailKicker");
    if (state.toolDetail === "connection") {
      els["user-tool-detail-title"].textContent = text("connectTitle");
      els["user-tool-detail-sub"].textContent = text("connectSub");
    } else if (state.toolDetail === "replies") {
      els["user-tool-detail-title"].textContent = text("replyMessagesTitle");
      els["user-tool-detail-sub"].textContent = text("replyMessagesSub");
    } else {
      els["user-tool-detail-title"].textContent = text("toolsDirectoryTitle");
      els["user-tool-detail-sub"].textContent = text("toolsDirectorySub");
    }
    els["user-reply-messages-kicker"].textContent = text("replyMessagesKicker");
    els["user-reply-messages-title"].textContent = text("replyMessagesTitle");
    els["user-reply-messages-sub"].textContent = text("replyMessagesSub");
    els["user-reply-messages-group-label"].textContent = text("replyMessagesGroupLabel");
    els["user-reply-messages-note"].textContent = text("replyMessagesNote");
    els["user-reply-messages-language-title"].textContent = text("replyMessagesLanguageTitle");
    els["user-reply-messages-language-sub"].textContent = text("replyMessagesLanguageSub");
    els["user-reply-locale-en"].textContent = "English";
    els["user-reply-locale-mm"].textContent = "Burmese";
    els["user-reply-locale-zh"].textContent = "中文";
    var replySaveLabel = els["user-reply-save"].querySelector(".button-label");
    var replyDiscardLabel = els["user-reply-discard"].querySelector(".button-label");
    var replyResetLanguageLabel = els["user-reply-reset-language"].querySelector(".button-label");
    if (replySaveLabel) replySaveLabel.textContent = state.replySaving ? text("replySaving") : text("replySave");
    if (replyDiscardLabel) replyDiscardLabel.textContent = text("replyDiscard");
    if (replyResetLanguageLabel) replyResetLanguageLabel.textContent = text("replyResetLanguage");
    if (state.replyEditorData && state.toolsOpen) renderActivityReplyEditor();
    els["user-connect-title"].textContent = text("connectTitle");
    els["user-connect-sub"].textContent = text("connectSub");
    els["user-connect-source-label"].textContent = text("connectSource");
    els["user-connect-source-sub"].textContent = text("connectSourceSub");
    els["user-connect-target-label"].textContent = text("connectTarget");
    els["user-connect-target-sub"].textContent = text("connectTargetSub");
    els["user-connect-note"].textContent = text("connectInstalledOnly");
    els["user-connect-guide-kicker"].textContent = text("connectGuideKicker");
    els["user-connect-guide-title"].textContent = text("connectGuideTitle");
    els["user-connect-guide-sub"].textContent = text("connectGuideSub");
    els["user-connect-guide-step1-title"].textContent = text("connectGuideStep1Title");
    els["user-connect-guide-step1-copy"].textContent = text("connectGuideStep1Copy");
    els["user-connect-guide-step2-title"].textContent = text("connectGuideStep2Title");
    els["user-connect-guide-step2-copy"].textContent = text("connectGuideStep2Copy");
    els["user-connect-guide-step3-title"].textContent = text("connectGuideStep3Title");
    els["user-connect-guide-step3-copy"].textContent = text("connectGuideStep3Copy");
    els["user-connect-guide-step4-title"].textContent = text("connectGuideStep4Title");
    els["user-connect-guide-step4-copy"].textContent = text("connectGuideStep4Copy");
    els["user-connect-guide-rule1"].textContent = text("connectGuideRule1");
    els["user-connect-guide-rule2"].textContent = text("connectGuideRule2");
    els["user-connect-guide-rule3"].textContent = text("connectGuideRule3");
    els["user-connect-flow-kicker"].textContent = text("connectFlowKicker");
    els["user-connect-flow-title"].textContent = text("connectFlowTitle");
    els["user-connect-flow-sub"].textContent = text("connectFlowSub");
    els["user-connect-flow-step1-title"].textContent = text("connectFlowStep1Title");
    els["user-connect-flow-step1-copy"].textContent = text("connectFlowStep1Copy");
    els["user-connect-flow-step2-title"].textContent = text("connectFlowStep2Title");
    els["user-connect-flow-step2-copy"].textContent = text("connectFlowStep2Copy");
    els["user-connect-flow-step3-title"].textContent = text("connectFlowStep3Title");
    els["user-connect-flow-step3-copy"].textContent = text("connectFlowStep3Copy");
    els["user-connect-flow-step4-title"].textContent = text("connectFlowStep4Title");
    els["user-connect-flow-step4-copy"].textContent = text("connectFlowStep4Copy");
    els["user-connect-flow-step5-title"].textContent = text("connectFlowStep5Title");
    els["user-connect-flow-step5-copy"].textContent = text("connectFlowStep5Copy");
    els["user-connect-flow-example-label"].textContent = text("connectFlowExampleLabel");
    els["user-connect-flow-example"].textContent = text("connectFlowExample");
    els["user-connect-flow-important1"].textContent = text("connectFlowImportant1");
    els["user-connect-flow-important2"].textContent = text("connectFlowImportant2");
    els["user-connect-status-title"].textContent = text("connectStatus");
    applyConnectGuideVisibility();
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
    els["user-appearance-theme-light-title"].textContent = text("themeLight");
    els["user-appearance-theme-light-sub"].textContent = text("themeLightSub");
    els["user-appearance-theme-white-title"].textContent = text("themeWhite");
    els["user-appearance-theme-white-sub"].textContent = text("themeWhiteSub");
    els["user-appearance-wallpaper-title"].textContent = text("wallpaperTitle");
    els["user-appearance-wallpaper-sub"].textContent = text("wallpaperSub");
    els["user-appearance-wallpaper-default"].textContent = text("wallpaperDefault");
    els["user-appearance-wallpaper-aurora"].textContent = text("wallpaperAurora");
    els["user-appearance-wallpaper-grid"].textContent = text("wallpaperGrid");
    els["user-appearance-wallpaper-nebula"].textContent = text("wallpaperNebula");
    els["user-appearance-wallpaper-ocean"].textContent = text("wallpaperOcean");
    els["user-appearance-wallpaper-violet"].textContent = text("wallpaperViolet");
    els["user-appearance-wallpaper-custom"].textContent = text("wallpaperCustom");
    els["user-appearance-effects-title"].textContent = text("backgroundEffects");
    els["user-appearance-effects-sub"].textContent = text("backgroundEffectsSub");
    els["user-background-effect-none"].textContent = text("backgroundEffectNone");
    els["user-background-effect-none-sub"].textContent = text("backgroundEffectNoneSub");
    els["user-background-effect-dollar"].textContent = text("backgroundEffectDollar");
    els["user-background-effect-dollar-sub"].textContent = text("backgroundEffectDollarSub");
    els["user-background-effect-coins"].textContent = text("backgroundEffectCoins");
    els["user-background-effect-coins-sub"].textContent = text("backgroundEffectCoinsSub");
    els["user-background-effect-hacker"].textContent = text("backgroundEffectHacker");
    els["user-background-effect-hacker-sub"].textContent = text("backgroundEffectHackerSub");
    els["user-appearance-effects-intensity"].textContent = text("backgroundEffectIntensity");
    els["user-appearance-effects-intensity-sub"].textContent = text("backgroundEffectIntensitySub");
    els["user-background-intensity-low"].textContent = text("backgroundEffectLow");
    els["user-background-intensity-medium"].textContent = text("backgroundEffectMedium");
    els["user-background-intensity-high"].textContent = text("backgroundEffectHigh");
    els["user-appearance-animations-title"].textContent = text("animations");
    els["user-appearance-animations-sub"].textContent = text("animationsSub");
    els["user-appearance-compact-title"].textContent = text("compactMode");
    els["user-appearance-compact-sub"].textContent = text("compactModeSub");
    els["user-appearance-accessibility-title"].textContent = text("accessibilityTitle");
    els["user-appearance-accessibility-sub"].textContent = text("accessibilitySub");
    els["user-accessibility-text-size-title"].textContent = text("textSize");
    els["user-accessibility-text-size-sub"].textContent = text("textSizeSub");
    els["user-accessibility-text-standard"].textContent = text("textSizeStandard");
    els["user-accessibility-text-standard-sub"].textContent = text("textSizeStandardSub");
    els["user-accessibility-text-large"].textContent = text("textSizeLarge");
    els["user-accessibility-text-large-sub"].textContent = text("textSizeLargeSub");
    els["user-accessibility-text-extra-large"].textContent = text("textSizeExtraLarge");
    els["user-accessibility-text-extra-large-sub"].textContent = text("textSizeExtraLargeSub");
    els["user-accessibility-contrast-title"].textContent = text("highContrast");
    els["user-accessibility-contrast-sub"].textContent = text("highContrastSub");
    els["workspace-name-kicker"].textContent = text("workspaceIdentity");
    els["workspace-name-title"].textContent = text("workspaceNameTitle");
    els["workspace-name-sub"].textContent = text("workspaceNameSub");
    els["workspace-name-input"].placeholder = text("workspaceNamePlaceholder");
    els["workspace-name-hint"].textContent = text("workspaceNameHint");
    els["workspace-name-save-label"].textContent = text("workspaceNameSave");
    els["workspace-name-reset-label"].textContent = text("workspaceNameReset");
    els["workspace-name-badge"].textContent = text("workspaceNameDeviceOnly");
    els["theme-creator-title"].textContent = text("themeCreator");
    els["theme-creator-sub"].textContent = text("themeCreatorSub");
    els["theme-creator-presets-title"].textContent = text("themeCreatorPresets");
    els["theme-creator-presets-sub"].textContent = text("themeCreatorPresetsSub");
    els["theme-palette-ocean-label"].textContent = text("themePaletteOcean");
    els["theme-palette-violet-label"].textContent = text("themePaletteViolet");
    els["theme-palette-mint-label"].textContent = text("themePaletteMint");
    els["theme-palette-sunset-label"].textContent = text("themePaletteSunset");
    els["theme-creator-primary-label"].textContent = text("themeCreatorPrimary");
    els["theme-creator-secondary-label"].textContent = text("themeCreatorSecondary");
    els["theme-creator-glow-label"].textContent = text("themeCreatorGlow");
    els["theme-creator-radius-label"].textContent = text("themeCreatorRadius");
    els["theme-creator-background-label"].textContent = text("themeCreatorBackground");
    els["theme-creator-reset-label"].textContent = text("themeCreatorReset");
    els["theme-creator-save-state"].textContent = state.themeCreator && state.themeCreator.enabled
      ? text("themeCreatorActive")
      : text("themeCreatorInactive");
    els["theme-creator-badge"].textContent = state.themeCreator && state.themeCreator.enabled
      ? text("themeCreatorCustom")
      : text("themeCreatorDeviceOnly");
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

    updateUserTabAccess();
    updateSupportAvailability();
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
    state.normalUserMode = false;
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

  function showNoGroup(data) {
    state.normalUserMode = true;
    state.groupPickerOpen = false;
    state.aboutOpen = false;
    state.supportOpen = false;
    state.toolsOpen = false;
    state.appearanceOpen = false;
    state.dashboard = data && typeof data === "object" ? data : {
      hasGroups: false,
      selectionRequired: false,
      groups: [],
    };
    state.selectedGroupId = null;
    saveDashboardState({ groupId: null, tab: "dashboard" });
    hideAllPrimaryScreens();

    // The tab bar lives inside the dashboard shell, so keep the shell visible.
    els["user-dashboard"].hidden = false;
    els["user-group-options"].hidden = true;
    els["user-selected-dashboard"].hidden = true;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
    els["user-tools-page"].hidden = true;
    els["user-appearance-page"].hidden = true;
    els["user-no-group-screen"].hidden = false;
    els["user-tabbar"].hidden = false;

    els.title.textContent = text("noGroup");
    els.identity.textContent = userGreeting();
    setDashboardControls(false);
    updateUserTabAccess();
    updateSupportAvailability();

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === "dashboard";
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

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
      updateAutoRefreshControl();      scheduleAutoRefresh();
    }
  }

  function userGreeting() {
    return text("hello") + ", " + displayName();
  }

  function updateReportContext() {
    if (!els["user-report-context-value"]) return;
    var group = state.dashboard && state.dashboard.selectedGroup;
    els["user-report-context-value"].textContent =
      group && group.title ? group.title : text("reportNoGroup");
  }

  function updateReportCharacterCount() {
    if (!els["user-report-message"] || !els["user-report-count"]) return;
    var length = els["user-report-message"].value.length;
    els["user-report-count"].textContent = length + " / 1200";
    els["user-report-count"].classList.toggle("is-near-limit", length >= 1050);
  }

  async function submitProblemReport(event) {
    event.preventDefault();
    if (!els["user-report-submit"] || els["user-report-submit"].disabled) return;

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

  function normalizeActivityNameInput(value) {
    return String(value == null ? "" : value)
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function activityNameDisplay(kind, values) {
    var custom = normalizeActivityNameInput(values && values[kind]);
    return custom || text(kind);
  }

  function renderActivityNamesCard(values, groupId) {
    var kinds = [
      ["eat", text("eat")],
      ["wc", text("wc")],
      ["smoke", text("smoke")],
      ["wcd", text("wcd")]
    ];
    var safeValues = values || {};

    var preview = kinds.map(function (row) {
      return '<div class="setting-value"><span class="setting-value-label">' +
        escapeHtml(row[1]) + '</span><strong class="setting-value-number">' +
        escapeHtml(activityNameDisplay(row[0], safeValues)) + '</strong></div>';
    }).join("");

    var editors = kinds.map(function (row) {
      var value = normalizeActivityNameInput(safeValues[row[0]]);
      return '<div class="editor-row">' +
        '<div><span class="editor-label">' + escapeHtml(row[1]) + '</span>' +
        '<span class="editor-hint">' + escapeHtml(text("activityNamesHint")) + '</span></div>' +
        '<input class="activity-name-input" data-activity-name-kind="' + row[0] +
        '" type="text" maxlength="32" autocomplete="off" spellcheck="false" value="' +
        escapeHtml(value) + '" data-original-value="' + escapeHtml(value) + '">' +
        '</div>';
    }).join("");

    return '<div class="setting-head"><span class="setting-icon">' + settingIcon("duration") +
      '</span><div><div class="setting-title">' + escapeHtml(text("activityNamesTitle")) +
      '</div><div class="setting-sub">' + escapeHtml(text("activityNamesSub")) + '</div></div></div>' +
      '<div class="setting-view"><div class="setting-grid">' + preview +
      '</div><button type="button" class="setting-edit activity-name-edit">' +
      escapeHtml(text("edit")) + '</button></div>' +
      '<div class="setting-editor activity-name-editor" hidden>' +
      '<div class="activity-name-grid">' + editors + '</div>' +
      '<div class="editor-footer">' +
      '<div class="editor-status" hidden><span class="editor-status-dot"></span><span>' +
      escapeHtml(text("unsavedChanges")) + '</span></div>' +
      '<div class="change-summary" hidden aria-live="polite"></div>' +
      '<div class="editor-error" hidden role="alert"></div>' +
      '<div class="editor-actions"><button type="button" class="setting-cancel activity-name-cancel">' +
      escapeHtml(text("cancel")) + '</button><button type="button" class="activity-name-reset">' +
      escapeHtml(text("resetActivityNames")) + '</button><button type="button" class="setting-save activity-name-save">' +
      '<span class="button-label">' + escapeHtml(text("saveActivityNames")) + '</span></button></div>' +
      '</div></div>';
  }

  function validateActivityNameEditor(editor, revealError) {
    var invalid = false;
    var dirty = false;
    editor.querySelectorAll(".activity-name-input").forEach(function (input) {
      var value = normalizeActivityNameInput(input.value);
      var fieldInvalid = Array.from(value).length > 32;
      input.classList.toggle("is-invalid", fieldInvalid);
      input.setAttribute("aria-invalid", String(fieldInvalid));
      if (fieldInvalid) invalid = true;
      if (value !== normalizeActivityNameInput(input.getAttribute("data-original-value"))) dirty = true;
    });

    var status = editor.querySelector(".editor-status");
    if (status) status.hidden = !dirty;
    var error = editor.querySelector(".editor-error");
    if (error) {
      error.hidden = !(revealError && invalid);
      error.textContent = invalid
        ? text("activityNamesHint")
        : "";
    }

    var saveButton = editor.querySelector(".activity-name-save");
    if (saveButton && !state.settingsSaving) saveButton.disabled = invalid || !dirty;
    var resetButton = editor.querySelector(".activity-name-reset");
    if (resetButton && !state.settingsSaving) resetButton.disabled = !dirty;

    var summary = editor.querySelector(".change-summary");
    if (summary) {
      if (!dirty) {
        summary.hidden = true;
        summary.textContent = "";
      } else {
        var changes = [];
        editor.querySelectorAll(".activity-name-input").forEach(function (input) {
          var value = normalizeActivityNameInput(input.value);
          var original = normalizeActivityNameInput(input.getAttribute("data-original-value"));
          if (value === original) return;
          var kind = input.getAttribute("data-activity-name-kind");
          changes.push("<strong>" + escapeHtml(text(kind)) + "</strong> " +
            escapeHtml(original || text(kind)) + " → " +
            escapeHtml(value || text(kind)));
        });
        summary.hidden = false;
        summary.classList.remove("is-error");
        summary.innerHTML = "<span>" + escapeHtml(text("changesToSave")) +
          ":</span> " + changes.join(", ");
      }
    }

    return !invalid;
  }

  function bindActivityNamesEditor() {
    var card = els["user-settings-names-card"];
    if (!card) return;

    var edit = card.querySelector(".activity-name-edit");
    var view = card.querySelector(".setting-view");
    var editor = card.querySelector(".activity-name-editor");
    if (!edit || !view || !editor) return;

    edit.onclick = function () {
      view.hidden = true;
      editor.hidden = false;
      validateActivityNameEditor(editor, false);
      var input = editor.querySelector(".activity-name-input");
      if (input) input.focus();
    };

    editor.querySelectorAll(".activity-name-input").forEach(function (input) {
      input.oninput = function () {
        if (state.settingsSaving) return;
        validateActivityNameEditor(editor, true);
      };
      input.onkeydown = function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          var cancel = editor.querySelector(".activity-name-cancel");
          if (cancel) cancel.click();
        }
      };
    });

    var cancel = editor.querySelector(".activity-name-cancel");
    if (cancel) cancel.onclick = function () {
      editor.querySelectorAll(".activity-name-input").forEach(function (input) {
        input.value = input.getAttribute("data-original-value") || "";
        input.classList.remove("is-invalid");
        input.setAttribute("aria-invalid", "false");
      });
      var error = editor.querySelector(".editor-error");
      if (error) error.hidden = true;
      var summary = editor.querySelector(".change-summary");
      if (summary) summary.hidden = true;
      editor.hidden = true;
      view.hidden = false;
      scheduleAutoRefresh();
    };

    var reset = editor.querySelector(".activity-name-reset");
    if (reset) reset.onclick = function () {
      if (state.settingsSaving) return;
      editor.querySelectorAll(".activity-name-input").forEach(function (input) {
        input.value = "";
      });
      validateActivityNameEditor(editor, true);
    };

    var save = editor.querySelector(".activity-name-save");
    if (save) save.onclick = function () {
      saveActivityNames(save);
    };
  }

  async function saveActivityNames(button) {
    if (state.settingsSaving) return;
    var editor = button.closest(".activity-name-editor");
    if (!editor) return;
    if (!validateActivityNameEditor(editor, true)) {
      showNotice(text("activityNamesSaveFailed"), "error");
      return;
    }

    var names = {};
    editor.querySelectorAll(".activity-name-input").forEach(function (input) {
      names[input.getAttribute("data-activity-name-kind")] =
        normalizeActivityNameInput(input.value);
    });

    var groupId = state.selectedGroupId;
    if (!Number.isSafeInteger(groupId) || groupId >= 0) {
      showNotice("Invalid group.", "error");
      return;
    }

    state.settingsSaving = true;
    button.disabled = true;
    button.classList.add("is-saving");
    setButton(button, "loading", text("saving") + "…");

    try {
      var data = await apiUserActivityNamesSave(groupId, names);
      if (!data || !data.names) throw new Error(text("activityNamesSaveFailed"));
      showNotice(text("activityNamesSaved"), "ok");
      editor.hidden = true;
      editor.closest(".settings-card").querySelector(".setting-view").hidden = false;
      await loadUserDashboard(false, groupId);
    } catch (error) {
      showNotice(
        error && error.message ? error.message : text("activityNamesSaveFailed"),
        "error"
      );
      validateActivityNameEditor(editor, true);
      button.disabled = false;
      button.classList.remove("is-saving");
      setButton(button, "idle", text("saveActivityNames"));
    } finally {
      state.settingsSaving = false;
      if (!editor.hidden) validateActivityNameEditor(editor, true);
      else button.classList.remove("is-saving");
    }
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
        body: JSON.stringify(Object.assign({
          category: category,
          message: message
        }, Number.isSafeInteger(Number(groupId)) && Number(groupId) < 0
          ? { groupId: Number(groupId) }
          : {}))
      },
      "Report"
    );
  }

  async function apiUserActivityReplies(groupId) {
     if (!initData) throw new Error("Telegram session data is missing.");
     return fetchJson(
       "/api/user/activity-replies?groupId=" + encodeURIComponent(String(groupId)),
       {
         method: "GET",
         headers: {
           "X-Telegram-Init-Data": initData,
           "Accept": "application/json"
         }
       },
       "Activity Reply Messages"
     );
   }

   async function apiUserActivityRepliesSave(groupId, messages) {
     if (!initData) throw new Error("Telegram session data is missing.");
     return fetchJson(
       "/api/user/activity-replies",
       {
         method: "PUT",
         headers: {
           "X-Telegram-Init-Data": initData,
           "Accept": "application/json",
           "Content-Type": "application/json"
         },
         body: JSON.stringify({
           groupId: Number(groupId),
           messages: messages
         })
       },
       "Activity Reply Messages"
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

   async function apiUserActivityNames(groupId) {
    if (!initData) throw new Error("Telegram session data is missing.");
    return fetchJson(
      "/api/user/activity-names?groupId=" + encodeURIComponent(String(groupId)),
      {
        method: "GET",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json"
        }
      },
      "Activity Names"
    );
  }

  async function apiUserActivityNamesSave(groupId, names) {
    if (!initData) throw new Error("Telegram session data is missing.");
    return fetchJson(
      "/api/user/activity-names",
      {
        method: "PUT",
        headers: {
          "X-Telegram-Init-Data": initData,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          groupId: Number(groupId),
          names: names
        })
      },
      "Activity Names"
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

    state.normalUserMode = false;
    state.dashboard = data;
    state.selectedGroupId = Number(group.id);
    saveDashboardState({ groupId: state.selectedGroupId });

    if (languageOnly && (state.aboutOpen || state.supportOpen || state.appearanceOpen)) return;

    els["user-no-group-screen"].hidden = true;
    els["user-group-options"].hidden = true;
    els["user-selected-dashboard"].hidden = false;
    els["user-dashboard"].hidden = false;
    els["user-about-page"].hidden = true;
    els["user-support-page"].hidden = true;
    els["user-tools-page"].hidden = true;
    els["user-appearance-page"].hidden = true;
    els["user-tabbar"].hidden = false;
    resetToolDetailState();

    els.title.textContent = text("title");
    els.identity.textContent = userGreeting();
    els["user-dashboard-sub"].textContent = text("dashboardEyebrow");
    els["user-onboarding-title"].textContent = text("onboardingTitle");
    els["user-onboarding-sub"].textContent = text("onboardingSub");
    els["user-onboarding-step1-title"].textContent = text("onboardingStep1Title");
    els["user-onboarding-step1-copy"].textContent = text("onboardingStep1Copy");
    els["user-onboarding-step2-title"].textContent = text("onboardingStep2Title");
    els["user-onboarding-step2-copy"].textContent = text("onboardingStep2Copy");
    els["user-onboarding-step3-title"].textContent = text("onboardingStep3Title");
    els["user-onboarding-step3-copy"].textContent = text("onboardingStep3Copy");
    els["user-onboarding-tools"].textContent = text("onboardingTools");
    els["user-onboarding-appearance"].textContent = text("onboardingAppearance");
    els["user-onboarding-dismiss"].textContent = text("onboardingDismiss");
    els["user-selected-group-title"].querySelector(".group-dashboard-name").textContent =
      group.title || String(group.id);
    els["user-selected-group-title"].querySelector(".group-dashboard-suffix").textContent =
      text("title");
    updateMetrics(group);

    els["user-settings-limits-card"].innerHTML =
      renderSettingCard("duration", data.activityLimits || DEFAULTS.duration, group.id);
    els["user-settings-counts-card"].innerHTML =
      renderSettingCard("count", data.countLimits || DEFAULTS.count, group.id);
    els["user-settings-names-card"].innerHTML =
      renderActivityNamesCard(data.activityNames || {}, group.id);

    bindSettingEditors();
    bindActivityNamesEditor();

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === "dashboard";
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    setDashboardControls(true);
    updateAutoRefreshControl();
    scheduleAutoRefresh();
    updateUserTabAccess();
    updateSupportAvailability();
    updateBackButton();

    if (languageOnly) return;  }

  function renderDashboard(data) {
    if (!data || typeof data !== "object") {
      throw new Error(text("invalidResponse"));
    }
    if (!data.hasGroups) {
      state.dashboard = data;
      showNoGroup(data);
      return false;
    }

    state.normalUserMode = false;
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

  function activityReplyKeys() {
    return [
      "noActive",
      "alreadyActive",
      "started",
      "settled",
      "dailyCountLimitReached",
      "timeoutReminder",
      "groupTimeoutNotification"
    ];
  }

  function activityReplyLabelSet() {
    return {
      noActive: { title: text("replyNoActiveTitle"), sub: text("replyNoActiveSub") },
      alreadyActive: { title: text("replyAlreadyActiveTitle"), sub: text("replyAlreadyActiveSub") },
      started: { title: text("replyStartedTitle"), sub: text("replyStartedSub") },
      settled: { title: text("replySettledTitle"), sub: text("replySettledSub") },
      dailyCountLimitReached: { title: text("replyDailyCountTitle"), sub: text("replyDailyCountSub") },
      timeoutReminder: { title: text("replyTimeoutReminderTitle"), sub: text("replyTimeoutReminderSub") },
      groupTimeoutNotification: { title: text("replyTimeoutNotificationTitle"), sub: text("replyTimeoutNotificationSub") }
    };
  }

  function replySnapshot(data) {
    if (!data) return "";
    var output = {};
    ["en", "mm", "zh"].forEach(function (locale) {
      output[locale] = {};
      activityReplyKeys().forEach(function (key) {
        var item = data[locale] && data[locale][key];
        output[locale][key] = item ? String(item.value || "") : "";
      });
    });
    return JSON.stringify(output);
  }

  function updateActivityReplyState() {
    var clean = !state.replyEditorData ||
      state.replyOriginalSnapshot === replySnapshot(state.replyEditorData);
    state.replyDirty = !clean;
    if (els["user-reply-save"]) els["user-reply-save"].disabled =
      !state.replyEditorData || state.replyLoading || state.replySaving || !state.replyDirty;
    if (els["user-reply-discard"]) els["user-reply-discard"].disabled =
      !state.replyEditorData || state.replyLoading || state.replySaving || !state.replyDirty;
    if (els["user-reply-reset-language"]) els["user-reply-reset-language"].disabled =
      !state.replyEditorData || state.replyLoading || state.replySaving;
  }

  function setActivityReplyStatus(kind, message) {
    if (!els["user-reply-status-text"] || !els["user-reply-status-dot"]) return;
    els["user-reply-status-text"].textContent = message;
    els["user-reply-status-dot"].classList.toggle("is-dirty", kind === "dirty");
    els["user-reply-status-dot"].classList.toggle("is-saved", kind === "saved");
    els["user-reply-status-dot"].classList.toggle("is-error", kind === "error");
  }

  function renderActivityReplyEditor() {
    if (!els["user-reply-messages-list"] || !state.replyEditorData) return;
    var locale = state.replyLocale === "zh" ? "zh" : (state.replyLocale === "mm" ? "mm" : "en");
    var labels = activityReplyLabelSet();
    var localeData = state.replyEditorData[locale] || {};
    var keys = activityReplyKeys();
    var group = state.dashboard && state.dashboard.selectedGroup;

    if (els["user-reply-messages-group"]) {
      els["user-reply-messages-group"].textContent = group
        ? (group.title || String(group.id))
        : "—";
    }
    if (els["user-reply-messages-role"]) {
      els["user-reply-messages-role"].textContent =
        group && group.memberStatus === "creator" ? "OWNER" : "ADMIN";
    }

    [["user-reply-locale-en", "en"], ["user-reply-locale-mm", "mm"], ["user-reply-locale-zh", "zh"]].forEach(function (entry) {
      var button = els[entry[0]];
      if (!button) return;
      var active = locale === entry[1];
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.disabled = state.replyLoading || state.replySaving;
    });

    els["user-reply-messages-list"].innerHTML = keys.map(function (key, index) {
      var item = localeData[key];
      if (!item) return "";
      var variableHtml = (item.variables || []).map(function (variable) {
        var token = "{" + variable + "}";
        return '<button type="button" class="reply-variable-chip" data-reply-variable="' +
          escapeHtml(token) + '" aria-label="' +
          escapeHtml(text("replyInsertVariable") + " " + token) + '">' +
          escapeHtml(token) + '</button>';
      }).join("");
      var customBadge = item.value !== item.defaultValue
        ? '<span class="reply-custom-badge">' + escapeHtml(text("replyCustomBadge")) + '</span>'
        : "";
      return '<article class="reply-message-editor" data-reply-key="' + escapeHtml(key) + '">' +
        '<div class="reply-message-editor-head">' +
          '<div class="reply-message-editor-index">' + String(index + 1).padStart(2, "0") + '</div>' +
          '<div class="reply-message-editor-copy">' +
            '<div class="reply-message-editor-title-row"><h4>' + escapeHtml(labels[key].title) + '</h4>' +
              customBadge + '</div>' +
            '<p>' + escapeHtml(labels[key].sub) + '</p>' +
          '</div>' +
          '<button type="button" class="secondary-button reply-reset-button" data-reply-reset="' + escapeHtml(key) + '">' +
            '<span class="button-label">' + escapeHtml(text("replyReset")) + '</span>' +
          '</button>' +
        '</div>' +
        '<textarea class="reply-message-textarea" data-reply-input="' + escapeHtml(key) + '" maxlength="1200" spellcheck="false">' +
          escapeHtml(item.value) +
        '</textarea>' +
        '<div class="reply-message-meta"><span>' + escapeHtml(text("replyPlainTextOnly")) + '</span>' +
          '<span class="reply-character-count" data-reply-count="' + escapeHtml(key) + '">' +
            String(item.value.length) + ' / 1200</span>' +
        '</div>' +
        '<div class="reply-variable-row"><span class="reply-variable-label">' +
          escapeHtml(text("replyVariables")) + '</span><div class="reply-variable-chips">' +
          variableHtml + '</div></div>' +
      '</article>';
    }).join("");

    els["user-reply-messages-list"].querySelectorAll("[data-reply-input]").forEach(function (input) {
      input.oninput = function () {
        var key = input.getAttribute("data-reply-input");
        var item = state.replyEditorData[locale] && state.replyEditorData[locale][key];
        if (!key || !item) return;
        item.value = input.value;
        item.customized = input.value.trim() !== item.defaultValue.trim();

        var count = els["user-reply-messages-list"].querySelector(
          '[data-reply-count="' + key + '"]'
        );
        if (count) count.textContent = String(input.value.length) + " / 1200";

        var card = input.closest(".reply-message-editor");
        var titleRow = card && card.querySelector(".reply-message-editor-title-row");
        var badge = card && card.querySelector(".reply-custom-badge");
        if (badge) badge.hidden = !item.customized;
        else if (item.customized && titleRow) {
          titleRow.insertAdjacentHTML(
            "beforeend",
            '<span class="reply-custom-badge">' + escapeHtml(text("replyCustomBadge")) + '</span>'
          );
        }
        updateActivityReplyState();
        setActivityReplyStatus(
          state.replyDirty ? "dirty" : "saved",
          state.replyDirty ? text("replyUnsaved") : text("replyDefaultActive")
        );
      };
    });

    els["user-reply-messages-list"].querySelectorAll("[data-reply-reset]").forEach(function (button) {
      button.onclick = function () {
        var key = button.getAttribute("data-reply-reset");
        var item = state.replyEditorData[locale] && state.replyEditorData[locale][key];
        if (!item) return;
        item.value = item.defaultValue;
        item.customized = false;
        renderActivityReplyEditor();
        setActivityReplyStatus(
          state.replyDirty ? "dirty" : "saved",
          state.replyDirty ? text("replyUnsaved") : text("replyDefaultActive")
        );
      };
    });

    els["user-reply-messages-list"].querySelectorAll("[data-reply-variable]").forEach(function (button) {
      button.onclick = function () {
        var token = button.getAttribute("data-reply-variable");
        var key = button.closest(".reply-message-editor")?.getAttribute("data-reply-key");
        if (!token || !key) return;
        var input = els["user-reply-messages-list"].querySelector(
          '[data-reply-input="' + key + '"]'
        );
        var item = state.replyEditorData[locale] && state.replyEditorData[locale][key];
        if (!input || !item) return;
        var start = input.selectionStart || 0;
        var end = input.selectionEnd || start;
        var value = input.value;
        input.value = value.slice(0, start) + token + value.slice(end);
        input.focus();
        input.selectionStart = input.selectionEnd = start + token.length;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
    });

    updateActivityReplyState();
  }

  async function loadActivityReplyMessages() {
    if (!state.toolsOpen || !Number.isSafeInteger(state.selectedGroupId) || state.selectedGroupId >= 0) return;
    var groupId = state.selectedGroupId;
    var requestId = ++state.replyRequestId;
    state.replyEditorData = null;
    state.replyOriginalSnapshot = "";
    state.replyDirty = false;
    state.replyLoading = true;
    updateActivityReplyState();

    if (!state.replyEditorData) {
      els["user-reply-messages-list"].innerHTML =
        '<div class="reply-messages-loading">' + escapeHtml(text("refreshing")) + '</div>';
    }

    try {
      var data = await apiUserActivityReplies(groupId);
      if (requestId !== state.replyRequestId || !state.toolsOpen || state.selectedGroupId !== groupId) return;
      if (!data || !data.messages || !data.messages.en || !data.messages.mm || !data.messages.zh) {
        throw new Error(text("replyLoadFailed"));
      }
      state.replyEditorData = data.messages;
      state.replyLocale = state.replyLocale === "zh" ? "zh" : (state.replyLocale === "mm" ? "mm" : "en");
      state.replyOriginalSnapshot = replySnapshot(state.replyEditorData);
      state.replyDirty = false;
      renderActivityReplyEditor();

      var hasCustom = ["en", "mm", "zh"].some(function (locale) {
        return state.replyEditorData[locale] &&
          Object.values(state.replyEditorData[locale]).some(function (item) {
            return item && item.customized;
          });
      });
      setActivityReplyStatus("saved", hasCustom ? text("replyCustomActive") : text("replyDefaultActive"));
    } catch (error) {
      if (requestId !== state.replyRequestId || !state.toolsOpen) return;
      setActivityReplyStatus("error", error && error.message ? error.message : text("replyLoadFailed"));
    } finally {
      if (requestId !== state.replyRequestId) return;
      state.replyLoading = false;
      updateActivityReplyState();
      renderActivityReplyEditor();
    }
  }

  async function saveActivityReplyMessages() {
    if (
      state.replySaving ||
      state.replyLoading ||
      !state.replyEditorData ||
      !Number.isSafeInteger(state.selectedGroupId) ||
      state.selectedGroupId >= 0 ||
      !state.replyDirty
    ) return;
    var groupId = state.selectedGroupId;
    var requestId = state.replyRequestId;
    state.replySaving = true;
    updateActivityReplyState();

    var saveLabel = els["user-reply-save"]?.querySelector(".button-label");
    if (saveLabel) saveLabel.textContent = text("replySaving");

    var messages = { en: {}, mm: {}, zh: {} };
    ["en", "mm", "zh"].forEach(function (locale) {
      activityReplyKeys().forEach(function (key) {
        var item = state.replyEditorData[locale] && state.replyEditorData[locale][key];
        if (item) messages[locale][key] = item.value;
      });
    });

    try {
      var result = await apiUserActivityRepliesSave(groupId, messages);
      if (requestId !== state.replyRequestId || !state.toolsOpen || state.selectedGroupId !== groupId) return;
      if (!result || !result.messages) throw new Error(text("replySaveFailed"));
      state.replyEditorData = result.messages;
      state.replyOriginalSnapshot = replySnapshot(state.replyEditorData);
      state.replyDirty = false;
      renderActivityReplyEditor();
      setActivityReplyStatus("saved", text("replySaved"));
      showNotice(text("replySaved"), "ok");
    } catch (error) {
      if (requestId !== state.replyRequestId || !state.toolsOpen) return;
      setActivityReplyStatus("error", error && error.message ? error.message : text("replySaveFailed"));
      showNotice(error && error.message ? error.message : text("replySaveFailed"), "error");
    } finally {
      if (requestId !== state.replyRequestId) return;
      state.replySaving = false;
      updateActivityReplyState();
      var label = els["user-reply-save"]?.querySelector(".button-label");
      if (label) label.textContent = text("replySave");
    }
  }

  function discardActivityReplyChanges() {
    if (!state.replyDirty || state.replyLoading || state.replySaving) return;
    if (!window.confirm(text("replyConfirmDiscard"))) return;
    void loadActivityReplyMessages();
  }

  function resetActivityReplyLanguage() {
    if (!state.replyEditorData || state.replyLoading || state.replySaving) return;
    if (!window.confirm(text("replyResetConfirm"))) return;
    var locale = state.replyLocale;
    activityReplyKeys().forEach(function (key) {
      var item = state.replyEditorData[locale] && state.replyEditorData[locale][key];
      if (!item) return;
      item.value = item.defaultValue;
      item.customized = false;
    });
    renderActivityReplyEditor();
    setActivityReplyStatus("dirty", text("replyUnsaved"));
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

  function getSourceConnection() {
    var sourceId = els["user-connect-source"]
      ? String(els["user-connect-source"].value || "")
      : "";
    return sourceId && state.connectConnections
      ? state.connectConnections[sourceId]
      : null;
  }

  function applyConnectGuideVisibility() {
    if (!els["user-connect-help"] || !els["user-connect-guide-toggle"]) return;
    var visible = state.connectGuideVisible !== false;
    els["user-connect-help"].hidden = !visible;
    els["user-connect-guide-toggle"].setAttribute("aria-expanded", String(visible));
    var label = els["user-connect-guide-toggle"].querySelector(".button-label");
    if (label) label.textContent = visible ? text("connectGuideHide") : text("connectGuideShow");
  }

  function updateConnectStatus() {
    if (!els["user-connect-status-value"] || !els["user-connect-status-meta"]) return;

    var sourceValue = String(els["user-connect-source"] && els["user-connect-source"].value || "");
    var targetValue = String(els["user-connect-target"] && els["user-connect-target"].value || "");
    var sourceGroup = getConnectGroupById(sourceValue);
    var targetGroup = getConnectGroupById(targetValue);
    var connection = state.connectConnections && state.connectConnections[sourceValue];
    var sameGroup = Boolean(sourceValue && targetValue && sourceValue === targetValue);
    var connectionOverview = els["user-connect-status-value"].closest(".connection-overview");
    var statusIcon = connectionOverview
      ? connectionOverview.querySelector(".connection-overview-icon")
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
    var canInteract = Boolean(
      state.connectEditMode &&
      !state.connectLoading &&
      !state.connectSaving
    );

    els["user-connect-submit"].disabled = !canInteract;
    els["user-connect-submit"].setAttribute("aria-disabled", String(!canInteract));
    els["user-connect-submit"].classList.toggle("is-ready", canSubmit);
    els["user-connect-submit"].classList.toggle(
      "needs-selection",
      canInteract && !canSubmit
    );
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
    if (!state.toolsOpen || state.connectLoading || state.connectSaving) return;

    var requestId = ++state.connectRequestId;
    state.connectLoading = true;
    state.connectEditMode = false;
    state.connectEditSnapshot = null;
    els["user-connect-submit"].disabled = true;
    els["user-connect-change"].disabled = true;
    els["user-connect-source"].setAttribute("aria-busy", "true");
    els["user-connect-target"].setAttribute("aria-busy", "true");

    try {
      var data = await apiUserConnectGroups();
      if (requestId !== state.connectRequestId || !state.toolsOpen) return;

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
      if (requestId !== state.connectRequestId || !state.toolsOpen) return;
      showNotice(
        error && error.message ? error.message : text("connectLoadFailed"),
        "error"
      );
    } finally {
      if (requestId !== state.connectRequestId) return;
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

    var sourceValue = String(els["user-connect-source"].value || "");
    var targetValue = String(els["user-connect-target"].value || "");

    if (!sourceValue || !targetValue) {
      showNotice(text("connectSelectBoth"), "error");
      if (!sourceValue) {
        els["user-connect-source"].focus({ preventScroll: true });
      } else {
        els["user-connect-target"].focus({ preventScroll: true });
      }
      return;
    }

    var sourceId = Number(sourceValue);
    var targetId = Number(targetValue);

    if (!Number.isSafeInteger(sourceId) || sourceId >= 0 || !Number.isSafeInteger(targetId) || targetId >= 0) {
      showNotice(text("connectFailed"), "error");
      return;
    }

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

  function resetToolDetailState() {
    var detail = state.toolDetail;
    state.toolDetail = null;

    if (detail === "connection") {
      ++state.connectRequestId;
      state.connectLoading = false;
      state.connectSaving = false;
      if (els["user-connect-source"]) els["user-connect-source"].removeAttribute("aria-busy");
      if (els["user-connect-target"]) els["user-connect-target"].removeAttribute("aria-busy");
    }

    if (detail === "replies") {
      ++state.replyRequestId;
      state.replyLoading = false;
      state.replySaving = false;
      state.replyEditorData = null;
      state.replyOriginalSnapshot = "";
      state.replyDirty = false;
    }

    updateActivityReplyState();
  }

  function updateToolsWorkspaceContext() {
    var group = state.dashboard && state.dashboard.selectedGroup;
    if (els["user-tools-active-group-label"]) {
      els["user-tools-active-group-label"].textContent = group
        ? text("toolsCurrentGroup")
        : text("noGroupEyebrow");
    }
    if (els["user-tools-active-group"]) {
      els["user-tools-active-group"].textContent = group
        ? (group.title || String(group.id))
        : text("noGroupStatus");
    }
    if (els["user-tools-active-role"]) {
      els["user-tools-active-role"].textContent = group
        ? (group.memberStatus === "creator"
            ? text("toolsWorkspaceRoleOwner")
            : text("toolsWorkspaceRoleAdmin"))
        : text("toolsWorkspacePersonal");
    }
  }

  function updateToolsWorkspaceView() {
    var hasDetail = Boolean(state.toolDetail);
    var toolsHead = els["user-tools-page"] && els["user-tools-page"].querySelector(".tools-head");
    var toolsCategory = els["user-tools-page"] && els["user-tools-page"].querySelector(".tools-category");
    if (toolsHead) toolsHead.hidden = hasDetail;
    if (toolsCategory) toolsCategory.hidden = hasDetail;
    if (els["user-tools-directory"]) els["user-tools-directory"].hidden = hasDetail;
    if (els["user-tool-detail"]) els["user-tool-detail"].hidden = !hasDetail;
    if (els["user-tool-detail-replies"]) {
      els["user-tool-detail-replies"].hidden = state.toolDetail !== "replies";
    }
    if (els["user-tool-detail-connection"]) {
      els["user-tool-detail-connection"].hidden = state.toolDetail !== "connection";
    }

    updateToolsWorkspaceContext();

    document.querySelectorAll("[data-user-tool]").forEach(function (button) {
      var tool = button.getAttribute("data-user-tool");
      var unavailable = state.normalUserMode && tool === "replies";
      button.disabled = unavailable;
      button.setAttribute("aria-disabled", unavailable ? "true" : "false");
      button.title = unavailable ? text("toolRequiresGroup") : "";
    });

    if (state.toolDetail === "connection") {
      els["user-tool-detail-title"].textContent = text("connectTitle");
      els["user-tool-detail-sub"].textContent = text("connectSub");
    } else if (state.toolDetail === "replies") {
      els["user-tool-detail-title"].textContent = text("replyMessagesTitle");
      els["user-tool-detail-sub"].textContent = text("replyMessagesSub");
    } else {
      els["user-tool-detail-title"].textContent = text("toolsDirectoryTitle");
      els["user-tool-detail-sub"].textContent = text("toolsDirectorySub");
    }

    els["user-tool-detail-back-label"].textContent = text("toolBack");
    els["user-tool-detail-back"].setAttribute("aria-label", text("toolBack"));
  }

  function updateUserTabAccess() {
    if (!els["user-tools-tab-label"]) return;
    var toolsButton = els["user-tools-tab-label"].closest(".tab-button");
    if (toolsButton) toolsButton.hidden = false;
  }

  function updateSupportAvailability() {
    var form = els["user-report-form"];
    if (!form) return;
    var card = form.closest(".support-card");
    if (card) card.hidden = false;
  }

  function openUserTool(tool) {
    if (!state.toolsOpen || state.groupPickerOpen) return;
    if (tool !== "connection" && tool !== "replies") return;
    if (state.normalUserMode && tool === "replies") {
      showNotice(text("toolRequiresGroup"), "error");
      return;
    }

    if (state.toolDetail === "replies" && tool !== "replies" && state.replyDirty) {
      showNotice(text("replyUnsaved"), "error");
      return;
    }

    if (state.toolDetail && state.toolDetail !== tool) {
      resetToolDetailState();
    }

    state.toolDetail = tool;
    updateToolsWorkspaceView();

    window.requestAnimationFrame(function () {
      if (els["user-tool-detail"]) {
        els["user-tool-detail"].scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (els["user-tool-detail-back"]) {
        els["user-tool-detail-back"].focus({ preventScroll: true });
      }
    });

    if (tool === "connection") {
      void loadConnectGroups();
    } else {
      void loadActivityReplyMessages();
    }
    updateBackButton();
  }

  function closeUserTool() {
    if (!state.toolDetail) return;

    if (state.toolDetail === "replies" && state.replyDirty) {
      showNotice(text("replyUnsaved"), "error");
      return;
    }

    resetToolDetailState();
    updateToolsWorkspaceView();
    updateBackButton();

    window.requestAnimationFrame(function () {
      if (els["user-tools-directory"]) {
        els["user-tools-directory"].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function setDashboardTab(tab) {
    if ((!state.dashboard && !state.normalUserMode) || !els["user-tabbar"] || els["user-tabbar"].hidden) return;
    if (state.groupPickerOpen) return;

    tab = tab === "about" || tab === "support" || tab === "tools" || tab === "appearance" ? tab : "dashboard";
    if (state.toolsOpen && tab !== "tools" && state.replyDirty) {
      showNotice(text("replyUnsaved"), "error");
      return;
    }
    var activityNameEditor = document.querySelector(".activity-name-editor");
    if (tab !== "dashboard" && activityNameEditor && !activityNameEditor.hidden &&
        !validateActivityNameEditor(activityNameEditor, false)) {
      return;
    }
    if (tab !== "dashboard" && activityNameEditor && !activityNameEditor.hidden) {
      var nameEditorDirty = false;
      activityNameEditor.querySelectorAll(".activity-name-input").forEach(function (input) {
        if (normalizeActivityNameInput(input.value) !== normalizeActivityNameInput(input.getAttribute("data-original-value"))) {
          nameEditorDirty = true;
        }
      });
      if (nameEditorDirty) {
        showNotice(text("unsavedChanges"), "error");
        return;
      }
    }
    var wasToolsOpen = state.toolsOpen;
    state.aboutOpen = tab === "about";
    state.supportOpen = tab === "support";
    state.toolsOpen = tab === "tools";
    state.appearanceOpen = tab === "appearance";
    if (!state.toolsOpen) resetToolDetailState();
    saveDashboardState({ tab: tab });

    ++state.requestId;

    if (state.aboutOpen) {
      els["user-no-group-screen"].hidden = true;
      els["user-selected-dashboard"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-tools-page"].hidden = true;
      els["user-appearance-page"].hidden = true;
      els["user-about-page"].hidden = false;
      els.title.textContent = text("about");
      els.identity.textContent = userGreeting();
      setDashboardControls(false);
    } else if (state.supportOpen) {
      els["user-no-group-screen"].hidden = true;
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
      els["user-no-group-screen"].hidden = true;
      els["user-selected-dashboard"].hidden = true;
      els["user-about-page"].hidden = true;
      els["user-support-page"].hidden = true;
      els["user-appearance-page"].hidden = true;
      els["user-tools-page"].hidden = false;
      els.title.textContent = text("tools");
      els.identity.textContent = userGreeting();
      setDashboardControls(false);
      resetToolDetailState();
      updateToolsWorkspaceView();
    } else if (state.appearanceOpen) {
      els["user-no-group-screen"].hidden = true;
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
      if (state.normalUserMode) {
        els["user-selected-dashboard"].hidden = true;
        els["user-no-group-screen"].hidden = false;
        els.title.textContent = text("noGroup");
        els.identity.textContent = userGreeting();
        setDashboardControls(false);
      } else {
        els["user-no-group-screen"].hidden = true;
        els["user-selected-dashboard"].hidden = false;
        els.title.textContent = text("title");
        els.identity.textContent = userGreeting();
        setDashboardControls(true);
        if (state.dashboard) renderSelectedDashboard(state.dashboard, true);
      }
    }

    document.querySelectorAll("[data-user-tab]").forEach(function (button) {
      var active = button.getAttribute("data-user-tab") === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    updateOnboardingVisibility();
    if (state.toolsOpen && state.replyEditorData) renderActivityReplyEditor();
    updateBackButton();
  }

  async function openGroupPicker() {
    if (!state.dashboard || state.aboutOpen || state.supportOpen || state.toolsOpen || state.appearanceOpen || state.groupPickerOpen || state.settingsSaving || state.refreshInProgress) return;
    var hasUnsaved = false;
    document.querySelectorAll(".editor-input[data-original-value]").forEach(function (input) {
      if (input.value !== input.getAttribute("data-original-value")) hasUnsaved = true;
    });
    document.querySelectorAll(".activity-name-input[data-original-value]").forEach(function (input) {
      if (normalizeActivityNameInput(input.value) !== normalizeActivityNameInput(input.getAttribute("data-original-value"))) {
        hasUnsaved = true;
      }
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
    if (state.toolsOpen && state.toolDetail) {
      closeUserTool();
      return;
    }
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

    document.querySelectorAll("[data-user-tool]").forEach(function (button) {
      button.onclick = function () {
        openUserTool(button.getAttribute("data-user-tool"));
      };
    });
    els["user-tool-detail-back"].onclick = closeUserTool;

    if (els["user-reply-locale-en"] && els["user-reply-locale-mm"] && els["user-reply-locale-zh"]) {
      els["user-reply-locale-en"].onclick = function () {
        if (state.replySaving || state.replyLoading) return;
        state.replyLocale = "en";
        renderActivityReplyEditor();
      };
      els["user-reply-locale-mm"].onclick = function () {
        if (state.replySaving || state.replyLoading) return;
        state.replyLocale = "mm";
        renderActivityReplyEditor();
      };
      els["user-reply-locale-zh"].onclick = function () {
        if (state.replySaving || state.replyLoading) return;
        state.replyLocale = "zh";
        renderActivityReplyEditor();
      };
      els["user-reply-save"].onclick = saveActivityReplyMessages;
      els["user-reply-discard"].onclick = discardActivityReplyChanges;
      els["user-reply-reset-language"].onclick = resetActivityReplyLanguage;
    }

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
      els["user-connect-guide-toggle"].onclick = function () {
        state.connectGuideVisible = !state.connectGuideVisible;
        writeStorage(STORAGE_KEYS.connectGuide, state.connectGuideVisible ? "1" : "0");
        applyConnectGuideVisibility();
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

    if (els["appearance-wallpaper-file"]) {
      els["appearance-wallpaper-file"].onchange = function () {
        var file = els["appearance-wallpaper-file"].files && els["appearance-wallpaper-file"].files[0];
        handleCustomWallpaperFile(file);
      };
    }
    if (els["appearance-wallpaper-remove"]) {
      els["appearance-wallpaper-remove"].onclick = removeCustomWallpaper;
    }

    document.querySelectorAll('input[name="background-effect"]').forEach(function (input) {
      input.onchange = function () { setBackgroundEffect(input.value); };
    });
    document.querySelectorAll('input[name="background-effect-intensity"]').forEach(function (input) {
      input.onchange = function () {
        if (!input.disabled) setBackgroundEffectIntensity(input.value);
      };
    });

    els["appearance-animations-toggle"].onclick = toggleAnimations;
    els["appearance-compact-toggle"].onclick = toggleCompactMode;
    document.querySelectorAll("[data-text-size-option]").forEach(function (button) { button.onclick = function () { setTextSize(button.getAttribute("data-text-size-option")); }; });
    els["appearance-high-contrast-toggle"].onclick = toggleHighContrast;
    els["workspace-name-input"].oninput = function () {
      updateWorkspaceNameControls();
    };
    els["workspace-name-input"].onkeydown = function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        if (!els["workspace-name-save"].disabled) saveWorkspaceName();
      }
    };
    els["workspace-name-save"].onclick = saveWorkspaceName;
    els["workspace-name-reset"].onclick = resetWorkspaceName;



    if (els["theme-creator-primary"]) {
      els["theme-creator-primary"].oninput = function () {
        setThemeCreatorField("primary", els["theme-creator-primary"].value);
      };
      els["theme-creator-secondary"].oninput = function () {
        setThemeCreatorField("secondary", els["theme-creator-secondary"].value);
      };
      els["theme-creator-glow"].oninput = function () {
        setThemeCreatorField("glow", els["theme-creator-glow"].value);
      };
      els["theme-creator-radius"].oninput = function () {
        setThemeCreatorField("radius", els["theme-creator-radius"].value);
      };
      els["theme-creator-background"].oninput = function () {
        setThemeCreatorField("background", els["theme-creator-background"].value);
      };

      document.querySelectorAll("[data-theme-palette]").forEach(function (button) {
        button.onclick = function () {
          applyThemePalette(button.getAttribute("data-theme-palette"));
        };
      });

      els["theme-creator-reset"].onclick = resetThemeCreator;
    }

    els["user-no-group-connect"].onclick = function () {
      if (state.refreshInProgress) return;
      setDashboardTab("tools");
    };

    els["user-no-group-back"].onclick = function () {
      if (state.refreshInProgress) return;
      state.refreshInProgress = true;
      setButton(els["user-no-group-back"], "loading", text("refreshing") + "…");
      loadUserDashboard(true, undefined)
        .catch(function (error) {
          showNotice(error && error.message ? error.message : text("dashboardError"), "error");
        })
        .finally(function () {
          state.refreshInProgress = false;
          if (!els["user-no-group-screen"].hidden) {
            setButton(els["user-no-group-back"], "idle", text("noGroupBack"));
          }
        });
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
      if (document.hidden) {
        stopAutoRefresh();
        syncBackgroundEffectEngine();
      } else {
        scheduleAutoRefresh();
        syncBackgroundEffectEngine();
      }
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

    if (els["user-onboarding-tools"]) {
      els["user-onboarding-tools"].onclick = function () {
        openOnboardingDestination("tools");
      };
      els["user-onboarding-appearance"].onclick = function () {
        openOnboardingDestination("appearance");
      };
      els["user-onboarding-dismiss"].onclick = completeOnboarding;
    }

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

    var savedConnectGuide = readStorage(STORAGE_KEYS.connectGuide);
    state.connectGuideVisible = savedConnectGuide !== "0";

    var savedAutoRefresh = readStorage(STORAGE_KEYS.autoRefresh);
    state.autoRefreshEnabled = savedAutoRefresh === "1";
    state.onboardingVisible = readStorage(STORAGE_KEYS.onboarding) !== "1";

    var storedTheme = readStorage(STORAGE_KEYS.appearanceTheme);
    state.appearanceTheme =
      ["midnight","amoled","light","white"].indexOf(storedTheme) >= 0 ? storedTheme : "dark";

    state.customWallpaper = getStoredCustomWallpaper();

    var storedBackgroundEffect = readStorage(STORAGE_KEYS.backgroundEffect);
    if (storedBackgroundEffect === "dragon") removeStorage(STORAGE_KEYS.backgroundEffect);
    state.backgroundEffect = BACKGROUND_EFFECTS.indexOf(storedBackgroundEffect) >= 0 ? storedBackgroundEffect : "none";

    var storedBackgroundEffectIntensity = readStorage(STORAGE_KEYS.backgroundEffectIntensity);
    state.backgroundEffectIntensity =
      BACKGROUND_EFFECT_INTENSITIES.indexOf(storedBackgroundEffectIntensity) >= 0
        ? storedBackgroundEffectIntensity
        : "medium";

    var storedWallpaper = readStorage(STORAGE_KEYS.wallpaper);
    state.wallpaper =
      ["default","aurora","grid","nebula","ocean","violet"].indexOf(storedWallpaper) >= 0
        ? storedWallpaper
        : storedWallpaper === "custom" && state.customWallpaper
          ? "custom"
          : "default";

    if (storedWallpaper === "custom" && !state.customWallpaper) {
      removeStorage(STORAGE_KEYS.wallpaper);
    }

    var storedAnimations = readStorage(STORAGE_KEYS.animations);
    state.animationsEnabled = storedAnimations !== "0";

    var storedCompact = readStorage(STORAGE_KEYS.compactMode);
    state.compactMode = storedCompact === "1";

    var storedTextSize = readStorage(STORAGE_KEYS.textSize);
    state.textSize = ["standard","large","extra-large"].indexOf(storedTextSize) >= 0 ? storedTextSize : "standard";
    var storedHighContrast = readStorage(STORAGE_KEYS.highContrast);
    state.highContrast = storedHighContrast === "1";

    var storedWorkspaceName = getStoredWorkspaceName();
    state.workspaceName = storedWorkspaceName || text("workspaceNameDefault");

    var storedThemeCreator = getThemeCreatorStorage();
    if (storedThemeCreator) {
      state.themeCreator = storedThemeCreator;
    } else {
      var base = getThemeBasePalette(state.appearanceTheme);
      state.themeCreator = Object.assign({}, THEME_CREATOR_DEFAULTS, {
        primary: base.primary,
        secondary: base.secondary
      });
    }

    applyAppearancePreferences();
    applyWorkspaceIdentity();
    if (els["workspace-name-input"]) {
      els["workspace-name-input"].value = state.workspaceName;
      updateWorkspaceNameControls();
    }
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
    if (state.appReady) {
      console.error("Z28 Mini App runtime error:", error);
      return;
    }
    var message = error && error.message ? error.message : "Unable to start the Mini App.";
    if (!els.identity) return;
    els.identity.textContent = message;
    showNotice(message, "error");
    hideSplash();
  }

  async function initialize() {
    cacheElements();
    initializeBackgroundEffectEngine();

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

    state.appReady = true;
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