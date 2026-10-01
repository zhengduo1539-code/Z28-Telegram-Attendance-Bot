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
      --bg: #f4f6f8;
      --card: #ffffff;
      --text: #18212f;
      --muted: #687386;
      --line: #dde3ea;
      --accent: #2481cc;
      --danger: #d94a4a;
      --ok: #18875a;
      --radius: 18px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right))
        max(22px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
      background: var(--tg-theme-bg-color, var(--bg));
      color: var(--tg-theme-text-color, var(--text));
      font: 16px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    .wrap { max-width: 760px; margin: 0 auto; }
    .top {
      display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;
      margin: 2px 0 16px;
    }
    h1 { margin: 0; font-size: 25px; }
    .sub { color: var(--tg-theme-hint-color, var(--muted)); margin-top: 4px; }
    .refresh {
      min-height: 44px; border: 0; border-radius: 12px; padding: 0 14px;
      background: var(--tg-theme-secondary-bg-color, #e9eef3);
      color: var(--tg-theme-text-color, var(--text)); font-weight: 700;
    }
    .card {
      background: var(--tg-theme-secondary-bg-color, var(--card));
      border: 1px solid var(--tg-theme-section-bg-color, var(--line));
      border-radius: var(--radius); padding: 16px; margin-bottom: 14px;
    }
    .card h2 { margin: 0 0 12px; font-size: 18px; }
    .stats { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
    .stat { background: var(--tg-theme-bg-color,#f7f8fa); border-radius: 14px; padding: 14px; }
    .stat-label { color: var(--tg-theme-hint-color,var(--muted)); font-size: 13px; }
    .stat-value { font-size: 28px; font-weight: 800; margin-top: 4px; }
    .rows { display: grid; gap: 10px; }
    .row {
      display: grid; grid-template-columns: minmax(0,1fr) 120px; gap: 12px; align-items: center;
      padding: 6px 0;
    }
    label { font-weight: 650; }
    .hint { display: block; color: var(--tg-theme-hint-color,var(--muted)); font-size: 12px; margin-top: 2px; }
    input[type="number"], input[type="text"] {
      width: 100%; min-height: 44px; padding: 9px 10px; border-radius: 11px;
      border: 1px solid var(--line); background: var(--tg-theme-bg-color,#fff); color: inherit;
      font-size: 16px;
    }
    input:disabled { opacity: .6; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    button.save {
      min-height: 44px; border: 0; border-radius: 12px; padding: 0 16px;
      background: var(--accent); color: white; font-weight: 750;
    }
    button:disabled { opacity: .55; }
    .toggle {
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      min-height: 44px;
    }
    .toggle input { width: 22px; height: 22px; }
    .notice { padding: 11px 13px; border-radius: 12px; margin-bottom: 14px; display: none; }
    .notice.show { display: block; }
    .notice.error { background: rgba(217,74,74,.12); color: var(--danger); }
    .notice.ok { background: rgba(24,135,90,.12); color: var(--ok); }
    .panel-only-group { display: none; }
    .panel-only-private { display: none; }
    .visible { display: block; }
    .connection {
      padding: 11px 13px; border-radius: 12px;
      background: var(--tg-theme-bg-color,#f7f8fa); margin-bottom: 12px;
    }
    .connection strong { display: block; margin-bottom: 3px; }
    @media (max-width: 480px) {
      .row { grid-template-columns: minmax(0,1fr) 102px; }
      .stats { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
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
      var identity = document.getElementById("identity");
      var title = document.getElementById("title");
      var app = document.getElementById("app");
      var notice = document.getElementById("notice");
      if (!tg || !tg.initData) {
        identity.textContent = "Open this page inside Telegram.";
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
        }
      }

      function escapeHtml(value) {
        var text = String(value);
        return text.replace(/[&<>"']/g, function (char) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", """: "&quot;", "'": "&#39;" }[char];
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