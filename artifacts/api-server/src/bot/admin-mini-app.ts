export const adminMiniAppHtml = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <title>Admin Panel</title>
  <script src="https://telegram.org/js/telegram-web-app.js?63"></script>
  <style>
    :root {
      --bg: #050914;
      --surface: rgba(9, 17, 31, 0.78);
      --text: #f7f9fc;
      --muted: #9ca9bb;
      --line: rgba(91, 155, 255, 0.22);
      --accent: #1677ff;
      --danger: #ff6b6b;
      --ok: #55d89b;
      --radius: 20px;
    }

    * { box-sizing: border-box; }
    html, body { min-height: 100%; }

    body {
      margin: 0;
      padding: max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right))
        max(22px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
      background:
        radial-gradient(circle at 12% 12%, rgba(23, 119, 255, 0.22), transparent 28%),
        radial-gradient(circle at 86% 8%, rgba(0, 198, 255, 0.14), transparent 24%),
        linear-gradient(145deg, #02040a 0%, #061126 46%, #02050e 100%);
      color: var(--text);
      font: 16px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      overflow-x: hidden;
    }

    body::before,
    body::after {
      content: "";
      position: fixed;
      z-index: 0;
      pointer-events: none;
      border-radius: 42% 58% 60% 40% / 46% 38% 62% 54%;
      filter: blur(42px);
      opacity: 0.65;
      transform: rotate(-18deg);
    }

    body::before {
      width: 280px;
      height: 280px;
      left: -110px;
      top: 24%;
      background: rgba(15, 103, 255, 0.38);
    }

    body::after {
      width: 320px;
      height: 320px;
      right: -140px;
      bottom: 8%;
      background: rgba(0, 166, 255, 0.28);
    }

    #splash {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      transition: opacity 0.45s ease, visibility 0.45s ease;
    }

    #splash.hide {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    #splash-title {
      margin: 0;
      padding: 0 24px;
      text-align: center;
      font-size: clamp(24px, 7vw, 34px);
      font-weight: 800;
      letter-spacing: 0.02em;
      color: transparent;
      background: linear-gradient(
        110deg,
        #111827 10%,
        #6b7280 30%,
        #111827 44%,
        #a7adb7 54%,
        #111827 70%
      );
      background-size: 250% auto;
      background-clip: text;
      -webkit-background-clip: text;
      animation: welcomeShine 1.55s linear infinite;
    }

    @keyframes welcomeShine {
      to { background-position: -250% center; }
    }

    .wrap {
      position: relative;
      z-index: 1;
      max-width: 760px;
      margin: 0 auto;
    }

    .top {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      margin: 4px 0 16px;
      padding: 4px 2px;
    }

    h1 {
      margin: 0;
      font-size: clamp(25px, 6vw, 31px);
      font-weight: 850;
      letter-spacing: -0.02em;
      color: transparent;
      background: linear-gradient(
        90deg,
        #ff3b30,
        #ff9f0a,
        #ffd60a,
        #34c759,
        #00c7be,
        #0a84ff,
        #5e5ce6,
        #bf5af2,
        #ff2d55,
        #ff3b30
      );
      background-size: 220% auto;
      background-clip: text;
      -webkit-background-clip: text;
      animation: rainbowFlow 5s linear infinite;
    }

    @keyframes rainbowFlow {
      to { background-position: 220% center; }
    }

    .sub {
      color: #93a4ba;
      margin-top: 5px;
    }

    .refresh {
      min-height: 44px;
      border: 1px solid rgba(130, 191, 255, 0.35);
      border-radius: 13px;
      padding: 0 15px;
      background: #1677ff;
      color: #ffffff;
      font-weight: 750;
      box-shadow: 0 8px 22px rgba(22, 119, 255, 0.24);
      cursor: pointer;
    }

    .refresh:active,
    button.save:active {
      transform: translateY(1px);
    }

    .card {
      background: linear-gradient(145deg, rgba(8, 16, 30, 0.88), rgba(7, 29, 58, 0.72));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 16px;
      margin-bottom: 14px;
      box-shadow:
        0 16px 34px rgba(0, 0, 0, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.035);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    .card h2 { margin: 0 0 12px; font-size: 18px; }

    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .stat {
      background: linear-gradient(145deg, rgba(16, 39, 72, 0.76), rgba(5, 18, 36, 0.85));
      border: 1px solid rgba(85, 154, 255, 0.14);
      border-radius: 15px;
      padding: 14px;
    }

    .stat-label,
    .hint { color: var(--muted); }

    .stat-label { font-size: 13px; }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      margin-top: 4px;
      color: #ffffff;
    }

    .rows { display: grid; gap: 10px; }

    .row {
      display: grid;
      grid-template-columns: minmax(0,1fr) 120px;
      gap: 12px;
      align-items: center;
      padding: 6px 0;
    }

    label { font-weight: 650; }

    .hint {
      display: block;
      font-size: 12px;
      margin-top: 2px;
    }

    input[type="number"],
    input[type="text"] {
      width: 100%;
      min-height: 44px;
      padding: 9px 10px;
      border-radius: 11px;
      border: 1px solid rgba(97, 161, 255, 0.24);
      background: rgba(2, 9, 20, 0.82);
      color: #ffffff;
      font-size: 16px;
      outline: none;
    }

    input[type="number"]:focus,
    input[type="text"]:focus {
      border-color: rgba(72, 157, 255, 0.72);
      box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.14);
    }

    input::placeholder { color: #6f8198; }
    input:disabled { opacity: .58; }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }

    button.save {
      min-height: 44px;
      border: 1px solid rgba(130, 191, 255, 0.32);
      border-radius: 12px;
      padding: 0 16px;
      background: linear-gradient(180deg, #2b8cff, #1268e6);
      color: #ffffff;
      font-weight: 750;
      box-shadow: 0 8px 20px rgba(18, 104, 230, 0.25);
      cursor: pointer;
    }

    button:disabled {
      opacity: .55;
      cursor: default;
    }

    .toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 44px;
    }

    .toggle input { width: 22px; height: 22px; }

    .notice {
      padding: 11px 13px;
      border-radius: 12px;
      margin-bottom: 14px;
      display: none;
      background: rgba(6, 15, 29, 0.9);
      border: 1px solid rgba(104, 166, 255, 0.18);
    }

    .notice.show { display: block; }

    .notice.error {
      background: rgba(217,74,74,.12);
      color: #ff8787;
      border-color: rgba(255,107,107,.2);
    }

    .notice.ok {
      background: rgba(24,135,90,.12);
      color: #6ee7b7;
      border-color: rgba(85,216,155,.2);
    }

    .panel-only-group,
    .panel-only-private { display: none; }

    .visible { display: block; }

    .connection {
      padding: 11px 13px;
      border-radius: 12px;
      background: rgba(2, 11, 24, 0.65);
      border: 1px solid rgba(92, 156, 255, 0.13);
      margin-bottom: 12px;
    }

    .connection strong {
      display: block;
      margin-bottom: 3px;
      color: #ffffff;
    }

    @media (max-width: 480px) {
      .row { grid-template-columns: minmax(0,1fr) 102px; }
      .stats { grid-template-columns: 1fr 1fr; }
      .top { align-items: center; }
      .refresh { padding: 0 13px; }
    }
  </style>
</head>
<body>
  <div id="splash" aria-label="Loading">
    <h1 id="splash-title">Welcome from Zheng Duo</h1>
  </div>

  <main class="wrap" id="app">
    <div class="top">
      <div>
        <h1 id="title">⚙️ Admin Panel</h1>
        <div class="sub" id="identity">Checking access…</div>
      </div>
      <button class="refresh" id="refresh" type="button">Refresh</button>
    </div>

    <div id="notice" class="notice" role="status" aria-live="polite"></div>

    <section class="card panel-only-private" id="stats-card">
      <h2>📊 Bot Statistics</h2>
      <div class="stats">
        <div class="stat"><div class="stat-label">Users (PM)</div><div class="stat-value" id="users">—</div></div>
        <div class="stat"><div class="stat-label">Groups</div><div class="stat-value" id="groups">—</div></div>
      </div>
    </section>

    <section class="card" id="limits-card">
      <h2>⏱ Activity Limits</h2>
      <div class="hint" id="limits-scope"></div>
      <div class="rows">
        <div class="row"><div><label for="limit-eat">Eat</label><span class="hint">minutes</span></div><input id="limit-eat" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="limit-wc">WC</label><span class="hint">minutes</span></div><input id="limit-wc" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="limit-smoke">Smoke</label><span class="hint">minutes</span></div><input id="limit-smoke" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="limit-wcd">WCD</label><span class="hint">minutes</span></div><input id="limit-wcd" type="number" min="1" step="1"></div>
      </div>
      <div class="actions"><button class="save" id="save-limits" type="button">Save Limits</button></div>
    </section>

    <section class="card" id="counts-card">
      <h2>🔢 Daily Count Limits</h2>
      <div class="rows">
        <div class="row"><div><label for="count-eat">Eat</label><span class="hint">unlimited by default</span></div><input id="count-eat" type="number" min="1" step="1" disabled></div>
        <div class="row"><div><label for="count-wc">WC</label><span class="hint">times per day</span></div><input id="count-wc" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="count-smoke">Smoke</label><span class="hint">times per day</span></div><input id="count-smoke" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="count-wcd">WCD</label><span class="hint">times per day</span></div><input id="count-wcd" type="number" min="1" step="1"></div>
      </div>
      <div class="actions"><button class="save" id="save-counts" type="button">Save Count Limits</button></div>
    </section>

    <section class="card panel-only-private" id="reminder-card">
      <h2>🔔 Overdue Reminder</h2>
      <div class="toggle">
        <div><label for="reminder">Reminder</label><span class="hint">45-second grace period</span></div>
        <input id="reminder" type="checkbox">
      </div>
      <div class="actions"><button class="save" id="save-reminder" type="button">Save Reminder</button></div>
    </section>

    <section class="card panel-only-group" id="connect-card">
      <h2>🔗 Group Connection</h2>
      <div class="connection" id="connection">Loading connection…</div>
      <div>
        <label for="target">Target notification group</label>
        <span class="hint">Group ID such as -1001234567890 or a public t.me group link</span>
        <input id="target" type="text" inputmode="text" placeholder="-1001234567890">
      </div>
      <div class="actions"><button class="save" id="save-connect" type="button">Save Connection</button></div>
    </section>
  </main>

  <script>
    (function () {
      var tg = window.Telegram && window.Telegram.WebApp;
      var splash = document.getElementById("splash");
      var splashStartedAt = Date.now();
      var identity = document.getElementById("identity");
      var title = document.getElementById("title");
      var app = document.getElementById("app");
      var notice = document.getElementById("notice");
      function hideSplash() {
        var elapsed = Date.now() - splashStartedAt;
        var remaining = Math.max(0, 850 - elapsed);
        window.setTimeout(function () {
          splash.classList.add("hide");
        }, remaining);
      }

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
      var apiBase = groupMode ? "/api/group-admin" : "/api/admin";

      document.querySelectorAll(".panel-only-group").forEach(function (element) {
        element.classList.toggle("visible", groupMode);
      });
      document.querySelectorAll(".panel-only-private").forEach(function (element) {
        element.classList.toggle("visible", !groupMode);
      });
      title.textContent = groupMode ? "⚙️ Group Admin Panel" : "⚙️ Admin Panel";
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

      async function api(path, options) {
        var requestOptions = options || {};
        var headers = new Headers(requestOptions.headers || {});
        headers.set("X-Telegram-Init-Data", initData);
        if (startParam) headers.set("X-Telegram-Start-Param", startParam);
        headers.set("Accept", "application/json");
        if (requestOptions.body) headers.set("Content-Type", "application/json");
        var response = await fetch(apiBase + path, Object.assign({}, requestOptions, { headers: headers }));
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          var message = typeof data.error === "string" ? data.error : "Request failed.";
          throw new Error(message);
        }
        return data;
      }

      function positiveInteger(id) {
        var number = Number(document.getElementById(id).value);
        return Number.isSafeInteger(number) && number > 0 ? number : undefined;
      }

      async function load() {
        setBusy(true);
        try {
          var data = await api("/summary");
          if (groupMode) {
            identity.textContent =
              (data.group.title || "Group") + " · Telegram ID " + data.group.id;
            document.getElementById("connection").innerHTML = data.connection
              ? "<strong>Connected target</strong>" + escapeHtml(data.connection.targetGroupName) + " (" + escapeHtml(String(data.connection.targetChatId)) + ")"
              : "<strong>No target connected</strong>Timeout notifications are not connected to a target group.";
            document.getElementById("target").value = data.connection
              ? String(data.connection.targetChatId)
              : "";
          } else {
            identity.textContent =
              (data.user.first_name || "Admin") + " · Telegram ID " + data.user.id;
            document.getElementById("users").textContent = String(data.stats.privateUsers);
            document.getElementById("groups").textContent = String(data.stats.groups);
            document.getElementById("reminder").checked = data.reminderEnabled;
          }

          document.getElementById("limit-eat").value = data.activityLimits.eat;
          document.getElementById("limit-wc").value = data.activityLimits.wc;
          document.getElementById("limit-smoke").value = data.activityLimits.smoke;
          document.getElementById("limit-wcd").value = data.activityLimits.wcd;

          document.getElementById("count-wc").value = data.countLimits.wc;
          document.getElementById("count-smoke").value = data.countLimits.smoke;
          document.getElementById("count-wcd").value = data.countLimits.wcd;
        } catch (error) {
          showNotice(error && error.message ? error.message : "Unable to load admin data.", "error");
        } finally {
          setBusy(false);
          hideSplash();
        }
      }

      function escapeHtml(value) {
        var text = String(value);
        return text.replace(/[&<>"']/g, function (char) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
        });
      }

      document.getElementById("refresh").addEventListener("click", load);

      document.getElementById("save-limits").addEventListener("click", function () {
        var operations = [
          ["eat", "limit-eat"],
          ["wc", "limit-wc"],
          ["smoke", "limit-smoke"],
          ["wcd", "limit-wcd"]
        ];
        (async function () {
          setBusy(true);
          try {
            for (var i = 0; i < operations.length; i += 1) {
              var minutes = positiveInteger(operations[i][1]);
              if (minutes === undefined) throw new Error("Enter positive integers for all activity limits.");
              await api("/activity-limits", {
                method: "PUT",
                body: JSON.stringify({ kind: operations[i][0], minutes: minutes })
              });
            }
            showNotice("Activity limits saved.", "ok");
          } catch (error) {
            showNotice(error && error.message ? error.message : "Save failed.", "error");
          } finally {
            setBusy(false);
            load();
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
          setBusy(true);
          try {
            for (var i = 0; i < operations.length; i += 1) {
              var count = positiveInteger(operations[i][1]);
              if (count === undefined) throw new Error("Enter positive integers for all count limits.");
              await api("/count-limits", {
                method: "PUT",
                body: JSON.stringify({ kind: operations[i][0], count: count })
              });
            }
            showNotice("Daily count limits saved.", "ok");
          } catch (error) {
            showNotice(error && error.message ? error.message : "Save failed.", "error");
          } finally {
            setBusy(false);
            load();
          }
        })();
      });

      if (!groupMode) {
        document.getElementById("save-reminder").addEventListener("click", function () {
          (async function () {
            setBusy(true);
            try {
              var data = await api("/reminder", {
                method: "PUT",
                body: JSON.stringify({ enabled: document.getElementById("reminder").checked })
              });
              document.getElementById("reminder").checked = data.reminderEnabled;
              showNotice("Reminder setting saved.", "ok");
            } catch (error) {
              showNotice(error && error.message ? error.message : "Save failed.", "error");
            } finally {
              setBusy(false);
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

      load();
    })();
  </script>
</body>
</html>`;