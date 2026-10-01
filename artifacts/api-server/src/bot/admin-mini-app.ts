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

    .credit-marquee {
      position: relative;
      width: min(440px, 68vw);
      margin-top: 4px;
      overflow: hidden;
      white-space: nowrap;
      mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
      -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    }

    .credit-track {
      display: inline-flex;
      width: max-content;
      min-width: max-content;
      will-change: transform;
      animation: creditScroll 13s linear infinite;
    }

    .credit-text {
      display: inline-block;
      padding-right: 90px;
      color: #8395ad;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.035em;
    }

    .credit-text strong {
      color: #b3c3d8;
      font-weight: 700;
    }

    @keyframes creditScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
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

    .card {
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #42a5ff, #1677ff, #6f5cff);
      opacity: 0.9;
    }

    .card h2 {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 14px;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .section-icon {
      position: relative;
      width: 46px;
      height: 46px;
      flex: 0 0 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
      color: #9fd4ff;
      background: linear-gradient(145deg, rgba(36, 134, 255, 0.22), rgba(8, 34, 66, 0.82));
      border: 1px solid rgba(103, 178, 255, 0.30);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 10px 24px rgba(0, 96, 220, 0.16);
    }

    .section-icon::after {
      content: "";
      position: absolute;
      inset: 5px;
      border-radius: 11px;
      border: 1px solid rgba(132, 198, 255, 0.10);
      pointer-events: none;
    }

    .section-icon svg {
      width: 24px;
      height: 24px;
      position: relative;
      z-index: 1;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .stats-icon {
      color: #73d2ff;
      background: linear-gradient(145deg, rgba(25, 160, 255, 0.24), rgba(8, 53, 82, 0.88));
    }

    .stats-icon::before {
      content: "";
      position: absolute;
      width: 9px;
      height: 9px;
      right: 6px;
      top: 6px;
      border-radius: 50%;
      background: #6fe7ff;
      box-shadow: 0 0 12px rgba(111, 231, 255, 0.7);
      animation: statsPulse 1.8s ease-in-out infinite;
    }

    @keyframes statsPulse {
      0%, 100% { opacity: 0.45; transform: scale(0.82); }
      50% { opacity: 1; transform: scale(1); }
    }

    .activity-icon {
      color: #54b4ff;
      background: linear-gradient(145deg, rgba(38, 150, 255, 0.24), rgba(9, 43, 82, 0.88));
    }

    .activity-icon .clock-ring {
      transform-origin: 12px 13px;
      animation: clockPulse 2.4s ease-in-out infinite;
    }

    .activity-icon .clock-hand {
      transform-box: fill-box;
      transform-origin: center;
      animation: clockHand 3.2s linear infinite;
    }

    @keyframes clockHand {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes clockPulse {
      0%, 100% { opacity: 0.88; }
      50% { opacity: 1; }
    }

    .counts-icon {
      color: #9c8cff;
      background: linear-gradient(145deg, rgba(112, 93, 255, 0.24), rgba(31, 26, 80, 0.88));
    }

    .counts-icon .count-bar {
      transform-box: fill-box;
      transform-origin: center bottom;
    }

    .counts-icon .count-bar-1 {
      animation: countBar 1.6s ease-in-out infinite;
    }

    .counts-icon .count-bar-2 {
      animation: countBar 1.6s ease-in-out 0.18s infinite;
    }

    .counts-icon .count-bar-3 {
      animation: countBar 1.6s ease-in-out 0.36s infinite;
    }

    .counts-icon .count-trend {
      stroke-dasharray: 28;
      stroke-dashoffset: 28;
      animation: trendDraw 2.4s ease-in-out infinite;
    }

    @keyframes countBar {
      0%, 100% { transform: scaleY(0.78); opacity: 0.72; }
      50% { transform: scaleY(1.08); opacity: 1; }
    }

    @keyframes trendDraw {
      0% { stroke-dashoffset: 28; opacity: 0.35; }
      35%, 70% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: -28; opacity: 0.35; }
    }

    .reminder-icon {
      color: #ffd166;
      background: linear-gradient(145deg, rgba(255, 180, 45, 0.22), rgba(77, 46, 8, 0.88));
    }

    .reminder-icon::before {
      content: "";
      position: absolute;
      inset: -5px;
      border-radius: 19px;
      border: 1px solid rgba(255, 209, 102, 0.10);
      animation: reminderPulse 2.2s ease-in-out infinite;
    }

    .reminder-icon .bell-shape {
      transform-box: fill-box;
      transform-origin: center 30%;
      animation: bellSwing 2.8s ease-in-out infinite;
    }

    .reminder-icon .ring-wave {
      transform-box: fill-box;
      transform-origin: center;
      opacity: 0;
      animation: bellWave 2.8s ease-out infinite;
    }

    .reminder-icon .ring-wave-2 {
      animation-delay: 0.32s;
    }

    @keyframes bellSwing {
      0%, 100% { transform: rotate(0deg); }
      8% { transform: rotate(-7deg); }
      16% { transform: rotate(6deg); }
      24% { transform: rotate(-4deg); }
      32% { transform: rotate(2deg); }
      40%, 100% { transform: rotate(0deg); }
    }

    @keyframes bellWave {
      0%, 42%, 100% { opacity: 0; transform: scale(0.72); }
      18% { opacity: 0.8; transform: scale(0.92); }
      30% { opacity: 0; transform: scale(1.12); }
    }

    @keyframes reminderPulse {
      0%, 100% { transform: scale(0.92); opacity: 0.28; }
      50% { transform: scale(1.08); opacity: 0.72; }
    }

    @media (prefers-reduced-motion: reduce) {
      .activity-icon .clock-ring,
      .activity-icon .clock-hand,
      .counts-icon .count-bar,
      .counts-icon .count-trend,
      .reminder-icon::before,
      .reminder-icon .bell-shape,
      .reminder-icon .ring-wave {
        animation: none !important;
      }
    }

    .card[data-section="stats"]::before {
      background: linear-gradient(180deg, #58d8ff, #1476e8);
    }

    .card[data-section="activity"]::before {
      background: linear-gradient(180deg, #35a8ff, #1677ff);
    }

    .card[data-section="counts"]::before {
      background: linear-gradient(180deg, #8b7cff, #4f62ff);
    }

    .card[data-section="reminder"]::before {
      background: linear-gradient(180deg, #ffd166, #ff9f0a);
    }

    .rows {
      display: grid;
      gap: 0;
      overflow: hidden;
      border: 1px solid rgba(91, 155, 255, 0.13);
      border-radius: 15px;
      background: rgba(2, 9, 20, 0.28);
    }

    .row {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0,1fr) 120px;
      gap: 12px;
      align-items: center;
      padding: 12px 12px 12px 14px;
      border-bottom: 1px solid rgba(91, 155, 255, 0.10);
    }

    .row:last-child { border-bottom: 0; }

    .row:hover {
      background: rgba(36, 122, 255, 0.055);
    }

    .row > div:first-child {
      min-width: 0;
    }

    .row label {
      display: inline-block;
      font-weight: 750;
      color: #eef4ff;
    }

    .row .hint {
      color: #8294ab;
    }

    .section-caption {
      margin: -5px 0 12px;
      color: #8497b0;
      font-size: 12px;
    }

    .save-limits,
    .save-counts,
    .save-reminder {
      min-width: 150px;
    }

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
      gap: 16px;
      min-height: 54px;
      padding: 12px 13px;
      border: 1px solid rgba(255, 191, 72, 0.12);
      border-radius: 15px;
      background: rgba(18, 18, 12, 0.34);
    }

    .toggle-copy {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 54px;
      height: 30px;
      flex: 0 0 54px;
      cursor: pointer;
    }

    .switch input {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
      pointer-events: none;
    }

    .switch-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: #1b2432;
      border: 1px solid rgba(144, 169, 198, 0.25);
      box-shadow: inset 0 2px 5px rgba(0,0,0,0.28);
      transition: background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }

    .switch-thumb {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #b8c4d4;
      box-shadow: 0 3px 8px rgba(0,0,0,0.34);
      transition: transform 0.22s ease, background 0.22s ease;
    }

    .switch input:checked + .switch-track {
      background: linear-gradient(90deg, #c88918, #ffb52e);
      border-color: rgba(255, 209, 102, 0.55);
      box-shadow: 0 0 16px rgba(255, 171, 44, 0.22);
    }

    .switch input:checked + .switch-track .switch-thumb {
      transform: translateX(24px);
      background: #fff7db;
    }

    .switch input:focus-visible + .switch-track {
      outline: 3px solid rgba(255, 190, 64, 0.18);
      outline-offset: 2px;
    }

    .action-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      overflow: hidden;
    }

    .action-button .button-content {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 0.16s ease;
    }

    .action-button.is-loading .button-content {
      opacity: 0.98;
    }

    .button-spinner {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.32);
      border-top-color: #ffffff;
      animation: buttonSpin 0.75s linear infinite;
    }

    @keyframes buttonSpin {
      to { transform: rotate(360deg); }
    }

    .success-badge[hidden] { display: none !important; }

    .success-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 9px 12px;
      border-radius: 12px;
      margin-left: auto;
      background: rgba(63, 220, 149, 0.10);
      border: 1px solid rgba(85, 216, 155, 0.22);
      color: #7cf2bc;
      font-size: 13px;
      font-weight: 750;
      animation: successIn 0.28s ease-out;
    }

    .success-badge svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @keyframes successIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

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

    .notice.warning {
      background: rgba(77,46,8,.22);
      color: #ffd98a;
      border-color: rgba(255,180,45,.24);
    }

    /* Nothing is visible until the Mini App mode is resolved. */
    .panel-only-private,
    .panel-only-group,
    .panel-only-user,
    .panel-only-admin-verify {
      display: none !important;
    }

    .panel-only-admin-verify.visible {
      display: block !important;
    }

    .panel-only-private.visible,
    .panel-only-group.visible,
    .panel-only-user.visible {
      display: block !important;
    }

    /* Regular users have two distinct screens: verification first, dashboard after verification. */
    .user-mode .panel-only-private,
    .user-mode .panel-only-group,
    .user-mode .user-dashboard,
    .user-mode .user-no-group-screen {
      display: none !important;
    }

    .user-mode .user-card#user-verify-card {
      display: none;
    }

    .user-mode.user-verification-page .user-card#user-verify-card {
      display: block;
    }

    .user-mode.user-dashboard-page {
      min-height: 100vh;
    }

    .user-mode.user-verification-page .top { display:none !important; }
    .admin-verification-page .top { display:none !important; }
    .user-mode.user-dashboard-page .top { display:flex; }
    .user-dashboard-page .top .sub { display:none; }
    .user-mode.user-dashboard-page .top .credit-marquee { display:block; }

    .user-mode.user-dashboard-page .user-card#user-verify-card {
      display: none !important;
    }

    .admin-verification-page .panel-only-admin-verify {
      display: block !important;
    }

    .admin-verification-page .user-card#user-verify-card {
      display: block !important;
    }

    .admin-verification-page .wrap {
      min-height: calc(100vh - max(36px, env(safe-area-inset-top) + env(safe-area-inset-bottom)));
      display: flex;
      align-items: center;
    }

    .admin-verification-page .panel-only-admin-verify {
      width: 100%;
    }

    .user-mode.user-dashboard-page .panel-only-user#user-dashboard,
    .user-mode.user-dashboard-page .panel-only-user#user-dashboard.visible {
      display: block !important;
    }

    .user-mode.user-dashboard-page #notice {
      position: fixed;
      top: max(12px, env(safe-area-inset-top));
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      width: min(680px, calc(100% - 28px));
    }

    .user-mode {
      background:
        radial-gradient(circle at 10% 10%, rgba(23, 119, 255, 0.22), transparent 28%),
        radial-gradient(circle at 88% 8%, rgba(0, 198, 255, 0.14), transparent 24%),
        linear-gradient(145deg, #02040a 0%, #061126 46%, #02050e 100%);
      color: #f7f9fc;
    }

    .user-mode h1 {
      color: transparent;
      background: linear-gradient(
        90deg,
        #ff3b30,#ff9f0a,#ffd60a,#34c759,#00c7be,#0a84ff,#5e5ce6,#bf5af2,#ff2d55,#ff3b30
      );
      background-size: 220% auto;
      background-clip: text;
      -webkit-background-clip: text;
      animation: rainbowFlow 5s linear infinite;
      font-size: clamp(25px, 6vw, 31px);
    }

    .user-mode .sub { color: #93a4ba; }
    .user-mode .refresh {
      background: #1677ff;
      color: #fff;
      border-color: rgba(130, 191, 255, 0.35);
      box-shadow: 0 8px 22px rgba(22,119,255,.24);
    }

    .user-card {
      background: linear-gradient(145deg, rgba(8, 16, 30, 0.94), rgba(7, 29, 58, 0.82));
      border: 1px solid rgba(91,155,255,.22);
      border-radius: 20px;
      box-shadow: 0 16px 34px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.035);
    }

    .user-card::before { display: none; }

    .user-mode.user-verification-page .wrap {
      min-height: calc(100vh - max(36px, env(safe-area-inset-top) + env(safe-area-inset-bottom)));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px 0;
    }

    .user-mode.user-verification-page .user-card#user-verify-card {
      position: relative;
      width: min(520px, 100%);
      margin: 0;
    }

    .user-language-switcher {
      position: absolute;
      top: 13px;
      right: 13px;
      z-index: 10;
    }

    /* Keep the verification heading clear of the top-right language button. */
    .user-card#user-verify-card > h2 {
      padding-right: 58px;
      min-width: 0;
    }

    .user-card#user-verify-card > h2 .section-title {
      min-width: 0;
    }

    .user-card#user-verify-card > h2 .section-title > span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .user-language-button {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid rgba(111, 196, 255, 0.38);
      background: linear-gradient(145deg, rgba(25, 126, 255, 0.26), rgba(8, 34, 66, 0.92));
      color: #9fd4ff;
      cursor: pointer;
      box-shadow: 0 0 0 0 rgba(53, 166, 255, 0.32), 0 8px 22px rgba(0, 86, 190, 0.22);
      animation: globePulse 2.1s ease-in-out infinite;
    }

    .user-language-button svg {
      width: 23px;
      height: 23px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: globeSpin 6s linear infinite;
    }

    @keyframes globePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(53,166,255,0), 0 8px 22px rgba(0,86,190,.22); }
      50% { box-shadow: 0 0 0 7px rgba(53,166,255,.08), 0 10px 26px rgba(0,126,255,.30); }
    }

    @keyframes globeSpin {
      to { transform: rotate(360deg); }
    }

    .user-language-menu {
      position: absolute;
      top: 49px;
      right: 0;
      width: 178px;
      padding: 6px;
      border: 1px solid rgba(91,155,255,.25);
      border-radius: 15px;
      background: rgba(4,12,25,.96);
      box-shadow: 0 18px 38px rgba(0,0,0,.38);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    .user-language-menu[hidden] { display: none; }

    .user-language-option {
      width: 100%;
      min-height: 40px;
      border: 0;
      border-radius: 10px;
      background: transparent;
      color: #dbeafe;
      text-align: left;
      padding: 0 11px;
      font-weight: 700;
      cursor: pointer;
    }

    .user-language-option:hover,
    .user-language-option.active {
      background: rgba(36,127,255,.18);
      color: #fff;
    }

    @media (prefers-reduced-motion: reduce) {
      .user-language-button,
      .user-language-button svg { animation: none !important; }
    }

    .user-lead {
      margin: 0 0 15px;
      color: #93a4ba;
      font-size: 13px;
    }

    .user-id-wrap { display: grid; gap: 8px; }

    .user-id-input {
      width: 100%;
      min-height: 50px;
      padding: 11px 14px;
      border-radius: 14px;
      border: 1px solid rgba(97,161,255,.28);
      background: rgba(2,9,20,.82);
      color: #fff;
      font-size: 17px;
      outline: none;
    }

    .user-id-input:focus {
      border-color: rgba(72,157,255,.72);
      box-shadow: 0 0 0 4px rgba(22,119,255,.12);
    }

    .user-id-hint { color: #7f92aa; font-size: 11px; }

    .user-confirm {
      width: 100%;
      min-height: 48px;
      margin-top: 14px;
      border: 0;
      border-radius: 14px;
      background: #303b4b;
      color: #8f9bab;
      font-weight: 800;
      transition: background .2s ease, color .2s ease, box-shadow .2s ease;
    }

    .user-confirm.ready {
      background: linear-gradient(180deg,#2f8cff,#1268e6);
      color: #fff;
      box-shadow: 0 10px 24px rgba(37,99,235,.24);
      cursor: pointer;
    }

    .user-dashboard { display: none; }
    .user-dashboard.visible { display: block; }

    .user-page-head {
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:12px;
      margin: 4px 0 14px;
    }

    .user-page-title {
      margin:0;
      font-size: 23px;
      font-weight: 850;
      color:#f7f9fc;
    }

    .user-page-sub {
      margin-top:4px;
      color:#8497b0;
      font-size:11px;
    }

    .user-group-box {
      padding: 16px;
      margin-bottom: 14px;
      border: 1px solid rgba(91,155,255,.25);
      border-radius: 20px;
      background: linear-gradient(145deg, rgba(8,16,30,.90), rgba(7,29,58,.72));
      box-shadow: 0 16px 34px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.035);
      position:relative;
      overflow:hidden;
    }

    .user-group-box::before {
      content:"";
      position:absolute;
      inset:0 auto 0 0;
      width:4px;
      background:linear-gradient(180deg,#42a5ff,#1677ff,#6f5cff);
    }

    .user-group-box-title {
      display:flex;
      align-items:center;
      gap:9px;
      color:#fff;
      font-size:17px;
      font-weight:850;
      margin-bottom:13px;
    }

    #user-settings-tab .user-group-box {
      margin-bottom: 14px;
    }

    .user-group-box-title::before {
      content:"";
      width:9px;
      height:9px;
      border-radius:50%;
      background:#54b4ff;
      box-shadow:0 0 14px rgba(84,180,255,.75);
      animation: userLivePulse 1.5s ease-in-out infinite;
    }

    @keyframes userLivePulse {
      0%,100% { transform:scale(.75); opacity:.55; }
      50% { transform:scale(1); opacity:1; }
    }

    .user-group-name {
      color:#9fd4ff;
      font-size:12px;
      margin-top:-8px;
      margin-bottom:12px;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .user-group-metrics {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
    }

    .user-live-metric {
      padding:13px;
      border-radius:15px;
      border:1px solid rgba(85,154,255,.14);
      background:linear-gradient(145deg,rgba(16,39,72,.76),rgba(5,18,36,.85));
    }

    .user-live-label {
      color:#8497b0;
      font-size:11px;
      font-weight:700;
    }

    .user-live-value {
      margin-top:4px;
      color:#fff;
      font-size:27px;
      line-height:1.1;
      font-weight:850;
    }

    .user-live-value {
      transition: transform .25s ease, opacity .25s ease;
    }

    .user-live-value.metric-updated {
      animation: metricUpdate .42s ease-out;
    }

    @keyframes metricUpdate {
      0% { transform: scale(.94); opacity:.55; }
      55% { transform: scale(1.06); opacity:1; }
      100% { transform: scale(1); opacity:1; }
    }

    .user-live-value.active {
      color:#55d89b;
      text-shadow:0 0 16px rgba(85,216,155,.22);
    }

    .user-tab-shell {
      position:relative;
      padding-bottom:82px;
    }

    #user-selected-dashboard .user-page-head {
      position: relative;
      padding-right: 54px;
    }

    #user-selected-dashboard .user-page-head > div:first-child {
      min-width: 0;
    }

    #user-selected-dashboard .user-page-title {
      overflow-wrap: anywhere;
    }

    #user-selected-dashboard .dashboard-language-switcher {
      top: 0;
      right: 0;
    }

    .user-tab-panel { display:none; }
    .user-tab-panel.active { display:block; }

    .user-dashboard-section-label {
      margin: 0 0 10px;
      color: #dce8f8;
      font-size: 12px;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .user-dashboard-section-label.warning {
      color: #ffd98a;
    }

    .user-setting-card {
      position:relative;
      overflow:hidden;
      padding:16px;
      margin-bottom:14px;
      border-radius:20px;
      background:linear-gradient(145deg,rgba(8,16,30,.88),rgba(7,29,58,.72));
      border:1px solid rgba(91,155,255,.22);
      box-shadow:0 16px 34px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035);
    }

    .user-setting-card::before {
      content:"";
      position:absolute;
      left:0;
      top:0;
      width:4px;
      height:100%;
      background:linear-gradient(180deg,#42a5ff,#1677ff,#6f5cff);
    }

    .user-setting-card.counts::before {
      background:linear-gradient(180deg,#8b7cff,#4f62ff);
    }

    .user-setting-head {
      display:flex;
      align-items:center;
      gap:10px;
      margin-bottom:14px;
    }

    .user-setting-icon {
      width:44px;
      height:44px;
      flex:0 0 44px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:14px;
      color:#9fd4ff;
      background:linear-gradient(145deg,rgba(36,134,255,.22),rgba(8,34,66,.82));
      border:1px solid rgba(103,178,255,.30);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 10px 24px rgba(0,96,220,.16);
    }

    .user-setting-card.counts .user-setting-icon {
      color:#9c8cff;
      background:linear-gradient(145deg,rgba(112,93,255,.24),rgba(31,26,80,.88));
    }

    .user-setting-icon svg {
      width:23px;
      height:23px;
      stroke:currentColor;
      fill:none;
      stroke-width:1.9;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    .user-setting-card .clock-hand {
      transform-box:fill-box;
      transform-origin:center;
      animation:clockHand 3.2s linear infinite;
    }

    .user-setting-card .count-bar {
      transform-box:fill-box;
      transform-origin:center bottom;
    }

    .user-setting-card .count-bar-1 { animation:countBar 1.6s ease-in-out infinite; }
    .user-setting-card .count-bar-2 { animation:countBar 1.6s ease-in-out .18s infinite; }
    .user-setting-card .count-bar-3 { animation:countBar 1.6s ease-in-out .36s infinite; }

    .user-setting-title {
      color:#f4f8ff;
      font-size:16px;
      font-weight:800;
    }

    .user-setting-sub {
      margin-top:2px;
      color:#8294ab;
      font-size:11px;
    }

    .user-setting-grid {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:8px;
    }

    .user-setting-value {
      padding:10px 11px;
      border-radius:13px;
      border:1px solid rgba(91,155,255,.12);
      background:rgba(2,9,20,.36);
    }

    .user-setting-value-label {
      color:#8294ab;
      font-size:10px;
    }

    .user-setting-value-number {
      margin-top:2px;
      color:#fff;
      font-size:18px;
      font-weight:850;
    }

    .user-tabbar {
      position:fixed;
      z-index:20;
      left:50%;
      bottom:max(10px,env(safe-area-inset-bottom));
      transform:translateX(-50%);
      width:min(730px,calc(100% - 28px));
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:7px;
      padding:7px;
      border:1px solid rgba(91,155,255,.24);
      border-radius:18px;
      background:rgba(4,11,23,.88);
      backdrop-filter:blur(18px);
      -webkit-backdrop-filter:blur(18px);
      box-shadow:0 16px 35px rgba(0,0,0,.36);
    }

    .user-tab {
      min-height:46px;
      border:0;
      border-radius:13px;
      color:#8497b0;
      background:transparent;
      font-weight:800;
      cursor:pointer;
      transition:background .2s ease,color .2s ease,box-shadow .2s ease;
    }

    .user-tab.active {
      color:#fff;
      background:linear-gradient(180deg,#247fff,#1268e6);
      box-shadow:0 8px 20px rgba(22,119,255,.25);
    }

    .user-warning {
      padding:14px;
      margin-bottom:14px;
      border:1px solid rgba(255,180,45,.20);
      border-radius:16px;
      background:rgba(77,46,8,.20);
      color:#ffd98a;
      font-size:11px;
      line-height:1.55;
    }

    .user-warning strong { color:#fff0c4; }

    .user-empty {
      padding:26px 18px;
      text-align:center;
      border-radius:18px;
      border:1px dashed rgba(255,180,45,.35);
      background:rgba(77,46,8,.18);
      color:#ffd98a;
    }

    .user-empty strong {
      display:block;
      margin-bottom:7px;
      color:#fff0c4;
      font-size:16px;
    }

    .user-empty p {
      margin:0 auto;
      max-width:460px;
      color:#d5b77a;
      font-size:12px;
      line-height:1.65;
    }

    .user-group-options {
      padding-bottom: 78px;
    }
    .user-group-option {
      width: 100%; min-height: 64px; display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin-bottom: 10px; padding: 14px 16px; border: 1px solid rgba(91,155,255,.24);
      border-radius: 17px; background: linear-gradient(145deg,rgba(8,16,30,.90),rgba(7,29,58,.72));
      color:#fff; text-align:left; font-weight:800; cursor:pointer; box-shadow:0 12px 26px rgba(0,0,0,.22);
    }
    .user-group-option span:last-child { color:#72b8ff; font-size:22px; }
    .user-setting-editor { display:grid; gap:9px; }
    .user-setting-editor .editor-row {
      display:grid; grid-template-columns:minmax(0,1fr) 110px; align-items:center; gap:10px;
      padding:9px; border-radius:13px; background:rgba(2,9,20,.34); border:1px solid rgba(91,155,255,.11);
    }
    .user-setting-editor label { color:#dce8f8; font-size:12px; font-weight:750; }
    .user-setting-editor input { min-height:40px; text-align:center; }
    .user-setting-save {
      min-height:42px; margin-top:3px; border:1px solid rgba(130,191,255,.32); border-radius:12px;
      padding:0 15px; background:linear-gradient(180deg,#2b8cff,#1268e6); color:#fff; font-weight:750; cursor:pointer;
    }
    .user-warning-feed {
      min-height:220px; max-height:none; overflow:auto; padding:12px;
      border:1px solid rgba(255,180,45,.22); border-radius:18px; background:rgba(26,18,6,.45);
    }

    .user-warning-tab-panel {
      min-height: calc(100vh - 150px);
      padding: 8px 2px 96px;
    }

    .user-warning-tab-panel .user-warning-feed {
      min-height: calc(100vh - 210px);
      padding: 6px 0;
      background: transparent;
      border: 0;
      overflow: visible;
    }

    .user-warning-tab-panel .user-warning-item {
      padding: 4px 2px 20px;
      margin: 0 0 20px;
      border: 0;
      border-bottom: 1px solid rgba(255,180,45,.12);
      border-radius: 0;
      background: transparent;
    }

    .user-warning-tab-panel .user-warning-item:last-child {
      margin-bottom: 0;
      border-bottom: 0;
    }

    .user-warning-tab-panel .user-warning-item-message {
      margin: 0;
      color: #fff0c4;
      font-size: 13px;
      line-height: 1.75;
    }

    .user-warning-tab-panel .user-warning-item-message b {
      color: #fff3cf;
      font-weight: 850;
    }

    .user-warning-tab-panel .user-warning-item-message code {
      padding: 2px 5px;
      border-radius: 6px;
      background: rgba(255,255,255,.07);
      color: #ffd98a;
      font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;
      font-size: .92em;
    }

    .user-warning-tab-panel .user-warning-item-message a {
      color: #82baff;
      text-decoration: none;
    }

    .user-no-group-screen {
      display: none;
    }

    /* No-group warning is intentionally a blank page: message only, no card, icon, border or controls. */
    .user-no-group-message {
      margin: 0 auto;
      max-width: 640px;
      padding: 0 18px;
      text-align: center;
      color: #dfc58e;
      font-size: 14px;
      line-height: 1.75;
    }

    .user-no-group-message strong {
      display: block;
      margin-bottom: 8px;
      color: #fff3cf;
      font-size: clamp(20px, 5vw, 27px);
      font-weight: 850;
    }

    .user-no-group-message span {
      display: inline;
      color: #d5b77a;
      font-size: 13px;
    }

    .user-mode.user-no-group-page .top,
    .user-mode.user-no-group-page #notice,
    .user-mode.user-no-group-page .user-card#user-verify-card,
    .user-mode.user-no-group-page .user-dashboard {
      display: none !important;
    }

    .user-mode.user-no-group-page .wrap {
      min-height: calc(100vh - max(36px, env(safe-area-inset-top) + env(safe-area-inset-bottom)));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px 0;
    }

    .user-mode.user-no-group-page .user-no-group-screen {
      display: flex !important;
      min-height: calc(100vh - max(36px, env(safe-area-inset-top) + env(safe-area-inset-bottom)));
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 18px 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .user-no-group-icon { animation: none !important; }
    }
    .user-warning-item { padding:12px; margin-bottom:9px; border-radius:14px; border:1px solid rgba(255,180,45,.17); background:rgba(77,46,8,.22); }
    .user-warning-item:last-child { margin-bottom:0; }
    .user-warning-item-head {
      display:flex;
      align-items:baseline;
      justify-content:space-between;
      gap:10px;
      color:#ffd98a;
      font-size:12px;
      font-weight:850;
    }
    .user-warning-item-head strong { color:#fff3cf; }
    .user-warning-item-head span { color:#b99a5e; font-size:10px; white-space:nowrap; }
    .user-warning-details {
      display:grid;
      gap:6px;
      margin-top:10px;
      padding-top:9px;
      border-top:1px solid rgba(255,180,45,.12);
    }
    .user-warning-details > div {
      display:grid;
      grid-template-columns:86px minmax(0,1fr);
      gap:8px;
      align-items:baseline;
      font-size:11px;
    }
    .user-warning-details > div span {
      color:#9e8352;
      font-weight:700;
    }
    .user-warning-details > div strong {
      color:#fff0c4;
      font-weight:800;
      overflow-wrap:anywhere;
    }
    .user-warning-item-message { margin-top:6px; color:#fff0c4; font-size:12px; line-height:1.55; }
    .user-warning-empty { min-height:190px; display:flex; align-items:center; justify-content:center; text-align:center; color:#d5b77a; font-size:12px; }
    .switch-group {
      min-height:44px; border:1px solid rgba(130,191,255,.35); border-radius:13px; padding:0 15px;
      background:rgba(12,38,72,.86); color:#fff; font-weight:750; box-shadow:0 8px 22px rgba(22,119,255,.16); cursor:pointer;
    }
    .user-loading {
      position:fixed;
      inset:0;
      z-index:10000;
      display:none;
      align-items:center;
      justify-content:center;
      background:rgba(2,7,17,.72);
      backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px);
    }

    .user-loading.visible { display:flex; }

    @keyframes userSpin { to { transform:rotate(360deg); } }

    .user-loader {
      width:48px;
      height:48px;
      border-radius:50%;
      border:4px solid rgba(126,171,232,.20);
      border-top-color:#2f8cff;
      animation:userSpin .8s linear infinite;
      box-shadow:0 0 22px rgba(37,99,235,.20);
    }

    @media (prefers-reduced-motion: reduce) {
      .user-group-box-title::before,
      .user-setting-card .clock-hand,
      .user-setting-card .count-bar {
        animation:none !important;
      }
    }

    /* Structured warning cards */
    .user-warning-feed { display:grid; gap:12px; min-height:220px; max-height:none; overflow:visible; padding:0; border:0; background:transparent; }
    .user-warning-tab-panel .user-warning-feed { min-height:calc(100vh - 210px); padding:2px 0 96px; }
    .user-warning-item { position:relative; padding:14px 14px 15px 16px; margin:0; border:1px solid rgba(255,180,45,.22); border-radius:18px; background:linear-gradient(145deg,rgba(42,27,8,.82),rgba(17,17,20,.88)); box-shadow:0 14px 30px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.035); overflow:hidden; }
    .user-warning-item::before { content:""; position:absolute; left:0; top:0; bottom:0; width:4px; background:linear-gradient(180deg,#ffd166,#ff9f0a); box-shadow:0 0 18px rgba(255,180,45,.16); }
    .user-warning-item-head { display:flex; align-items:center; justify-content:space-between; gap:12px; min-width:0; padding-bottom:11px; border-bottom:1px solid rgba(255,180,45,.12); }
    .user-warning-item-title { display:inline-flex; align-items:center; gap:8px; min-width:0; color:#fff3cf; font-size:14px; font-weight:850; }
    .user-warning-item-title .warning-symbol { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; flex:0 0 24px; border-radius:8px; background:rgba(255,180,45,.13); border:1px solid rgba(255,209,102,.18); color:#ffd166; font-size:13px; box-shadow:0 0 14px rgba(255,180,45,.10); }
    .user-warning-item-time { flex:0 0 auto; color:#b99a5e; font-size:10px; font-weight:750; white-space:nowrap; }
    .user-warning-details { display:grid; gap:0; margin:10px 0 0; }
    .user-warning-detail { display:grid; grid-template-columns:86px minmax(0,1fr); gap:10px; align-items:baseline; min-width:0; padding:8px 0; }
    .user-warning-detail + .user-warning-detail { border-top:1px solid rgba(255,180,45,.08); }
    .user-warning-detail-label { color:#9e8352; font-size:10px; font-weight:800; letter-spacing:.035em; text-transform:uppercase; }
    .user-warning-detail-value { min-width:0; color:#fff0c4; font-size:12px; font-weight:750; line-height:1.45; overflow-wrap:anywhere; }
    .user-warning-detail-value .warning-meta { display:block; margin-top:2px; color:#9f8759; font-size:10px; font-weight:650; }
    .user-warning-detail.overtime .user-warning-detail-value { color:#ffd166; font-weight:850; text-shadow:0 0 12px rgba(255,180,45,.12); }
    .user-warning-item-message { display:none !important; }
    @media (max-width:480px) { .user-warning-item { padding:13px 12px 14px 14px; } .user-warning-item-head { align-items:flex-start; } .user-warning-item-title { font-size:13px; } .user-warning-detail { grid-template-columns:72px minmax(0,1fr); gap:8px; } }

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


    /* Neon admin dashboard theme. Scoped to admin mode only. */
    body.admin-mode {
      color-scheme: dark;
      background:
        radial-gradient(circle at 12% 8%, rgba(0,229,255,.13), transparent 25%),
        radial-gradient(circle at 90% 14%, rgba(168,85,247,.15), transparent 28%),
        radial-gradient(circle at 50% 100%, rgba(59,130,246,.10), transparent 34%),
        #030712;
      color:#e8f7ff;
    }
    body.admin-mode .admin-shell { background:transparent; color:#e8f7ff; }
    body.admin-mode .admin-sidebar {
      width:252px; flex-basis:252px; padding:20px 14px;
      background:rgba(3,7,18,.88);
      border-right:1px solid rgba(34,211,238,.16);
      box-shadow:18px 0 45px rgba(0,0,0,.34), inset -1px 0 0 rgba(168,85,247,.08);
      backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
    }
    body.admin-mode .admin-brand-mark {
      background:linear-gradient(135deg,#06b6d4,#2563eb 52%,#a855f7);
      box-shadow:0 0 24px rgba(34,211,238,.22),0 0 36px rgba(168,85,247,.12);
    }
    body.admin-mode .admin-brand-title { color:#f0fdff; }
    body.admin-mode .admin-brand-sub { color:#6e8da5; }
    body.admin-mode .admin-nav { gap:7px; }
    body.admin-mode .admin-nav-label { color:#46677e; }
    body.admin-mode .admin-nav-item {
      min-height:46px; border:1px solid transparent; border-radius:13px;
      color:#7594aa; background:rgba(7,15,30,.44);
    }
    body.admin-mode .admin-nav-item:hover {
      color:#d9fbff; border-color:rgba(34,211,238,.20);
      background:rgba(34,211,238,.055); box-shadow:0 0 20px rgba(34,211,238,.05);
    }
    body.admin-mode .admin-nav-item.active {
      color:#eaffff; border-color:rgba(34,211,238,.32);
      background:linear-gradient(100deg,rgba(6,182,212,.17),rgba(59,130,246,.10),rgba(168,85,247,.12));
      box-shadow:inset 3px 0 0 #22d3ee,0 0 24px rgba(34,211,238,.08);
    }
    body.admin-mode .admin-nav-icon { color:#5ddcf1; }
    body.admin-mode .admin-sidebar-footer { border-color:rgba(34,211,238,.13); background:rgba(8,18,34,.58); }
    body.admin-mode .admin-secure-line { color:#a9d8e7; }
    body.admin-mode .admin-role-caption { color:#5e7b90; }
    body.admin-mode .admin-main { padding:24px clamp(16px,3vw,38px) 42px; }
    body.admin-mode .admin-eyebrow { color:#35cfe6; }
    body.admin-mode .admin-heading { color:#ecfeff; text-shadow:0 0 22px rgba(34,211,238,.12); }
    body.admin-mode .admin-heading-sub { color:#6f8ba0; }

    .admin-folder-strip {
      display:flex; gap:8px; overflow-x:auto; padding:5px; margin:0 0 18px;
      border:1px solid rgba(34,211,238,.14); border-radius:15px;
      background:rgba(3,10,23,.66); box-shadow:0 12px 30px rgba(0,0,0,.20);
      scrollbar-width:thin;
    }
    .admin-folder-tab {
      min-height:40px; flex:1 0 auto; padding:0 15px; border:1px solid transparent;
      border-radius:11px; background:transparent; color:#648399;
      font-size:11px; font-weight:850; cursor:pointer; transition:.18s ease;
    }
    .admin-folder-tab:hover { color:#c9faff; background:rgba(34,211,238,.05); }
    .admin-folder-tab.active {
      color:#eaffff; border-color:rgba(34,211,238,.30);
      background:linear-gradient(100deg,rgba(6,182,212,.16),rgba(59,130,246,.10),rgba(168,85,247,.13));
      box-shadow:0 0 18px rgba(34,211,238,.08);
    }
    .admin-folder-tab span { pointer-events:none; }

    body.admin-mode .admin-section { display:none; scroll-margin-top:18px; }
    body.admin-mode .admin-section.admin-folder-visible { display:block; }
    body.admin-mode .admin-kpi,
    body.admin-mode .admin-panel {
      color:#e6f7ff; border-color:rgba(76,201,240,.16);
      background:linear-gradient(145deg,rgba(7,17,33,.90),rgba(5,13,28,.82));
      box-shadow:0 16px 34px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.035),0 0 24px rgba(34,211,238,.025);
      backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
    }
    body.admin-mode .admin-kpi::after { background:rgba(34,211,238,.045); }
    body.admin-mode .admin-kpi-icon,
    body.admin-mode .admin-control-icon,
    body.admin-mode .admin-automation-icon {
      background:rgba(6,182,212,.08); color:#67e8f9; border:1px solid rgba(34,211,238,.14);
    }
    body.admin-mode .admin-kpi[data-tone="indigo"] .admin-kpi-icon { background:rgba(139,92,246,.10); color:#c4b5fd; }
    body.admin-mode .admin-kpi[data-tone="green"] .admin-kpi-icon { background:rgba(34,197,94,.10); color:#86efac; }
    body.admin-mode .admin-kpi[data-tone="amber"] .admin-kpi-icon { background:rgba(245,158,11,.10); color:#fcd34d; }
    body.admin-mode .admin-kpi-label,
    body.admin-mode .admin-panel-sub,
    body.admin-mode .admin-kpi-note,
    body.admin-mode .admin-control-hint,
    body.admin-mode .admin-empty-note { color:#668196; }
    body.admin-mode .admin-kpi-value,
    body.admin-mode .admin-panel-title,
    body.admin-mode .admin-control-name,
    body.admin-mode .admin-automation-title { color:#ecfeff; }
    body.admin-mode .admin-panel-head { border-bottom-color:rgba(76,201,240,.10); }
    body.admin-mode .admin-control { border-color:rgba(76,201,240,.12); background:rgba(7,20,37,.66); }
    body.admin-mode .admin-field {
      border-color:rgba(76,201,240,.16); background:rgba(2,8,20,.80); color:#eaffff;
    }
    body.admin-mode .admin-field:focus {
      border-color:rgba(34,211,238,.65);
      box-shadow:0 0 0 3px rgba(34,211,238,.10),0 0 20px rgba(34,211,238,.07);
    }
    body.admin-mode .admin-action-bar { border-top-color:rgba(76,201,240,.10); }
    body.admin-mode .admin-save {
      background:linear-gradient(100deg,#0891b2,#2563eb 52%,#7c3aed);
      box-shadow:0 10px 25px rgba(37,99,235,.20),0 0 18px rgba(34,211,238,.08);
    }
    body.admin-mode .admin-save.secondary,
    body.admin-mode .admin-refresh {
      color:#bdeaf4; background:rgba(8,18,34,.78); border-color:rgba(76,201,240,.16);
    }
    body.admin-mode .admin-refresh:hover { border-color:rgba(34,211,238,.34); color:#eaffff; }
    body.admin-mode .admin-automation { border-color:rgba(76,201,240,.12); background:rgba(7,20,37,.60); }
    body.admin-mode .admin-switch-track { background:#152536; }
    body.admin-mode .admin-switch input:checked + .admin-switch-track {
      background:linear-gradient(90deg,#06b6d4,#2563eb,#8b5cf6);
      box-shadow:0 0 18px rgba(34,211,238,.20);
    }
    body.admin-mode .admin-status-pill {
      background:rgba(34,197,94,.08); border-color:rgba(34,197,94,.18); color:#86efac;
    }
    body.admin-mode .admin-session {
      border-color:rgba(76,201,240,.14); background:rgba(7,18,34,.78); box-shadow:0 10px 26px rgba(0,0,0,.22);
    }
    body.admin-mode .admin-session-name { color:#eaffff; }
    body.admin-mode .admin-session-role { color:#668196; }
    body.admin-mode .admin-avatar {
      background:linear-gradient(145deg,rgba(6,182,212,.18),rgba(124,58,237,.18));
      color:#a5f3fc; border:1px solid rgba(34,211,238,.18);
    }
    body.admin-mode .admin-users-search,
    body.admin-mode .admin-users-filter {
      border-color:rgba(76,201,240,.15); background:rgba(2,9,20,.72); color:#dffbff;
    }
    body.admin-mode .admin-users-search:focus {
      border-color:rgba(34,211,238,.55); box-shadow:0 0 0 3px rgba(34,211,238,.08);
    }
    body.admin-mode .admin-users-table-wrap,
    body.admin-mode .admin-analytics-card,
    body.admin-mode .admin-health-card,
    body.admin-mode .admin-health-meta-card,
    body.admin-mode .admin-health-result {
      border-color:rgba(76,201,240,.13); background:rgba(4,13,27,.72); color:#dffbff;
    }
    body.admin-mode .admin-users-table th { background:rgba(8,24,43,.88); color:#6e9ab0; border-bottom-color:rgba(76,201,240,.11); }
    body.admin-mode .admin-users-table td { color:#b9d4df; border-bottom-color:rgba(76,201,240,.08); }
    body.admin-mode .admin-user-name,
    body.admin-mode .admin-user-primary,
    body.admin-mode .admin-health-result-title { color:#eaffff; }
    body.admin-mode .admin-users-page,
    body.admin-mode .admin-health-button {
      border-color:rgba(76,201,240,.15); background:rgba(7,18,34,.80); color:#a9d8e7;
    }
    body.admin-mode .admin-users-page:hover,
    body.admin-mode .admin-health-button:hover { border-color:rgba(34,211,238,.34); color:#eaffff; }
    body.admin-mode .admin-broadcast-textarea,
    body.admin-mode .admin-maintenance-box,
    body.admin-mode .admin-backup-box {
      border-color:rgba(76,201,240,.14); background:rgba(5,15,29,.72); color:#eaffff;
    }
    @media (max-width:980px) {
      body.admin-mode .admin-sidebar { width:220px; flex-basis:220px; }
      body.admin-mode .admin-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
    }
    @media (max-width:700px) {
      body.admin-mode .admin-sidebar { width:100%; height:auto; padding:9px 10px; flex-direction:row; }
      body.admin-mode .admin-brand { flex:0 0 auto; }
      body.admin-mode .admin-nav { overflow-x:auto; flex:1; justify-content:flex-start; }
      body.admin-mode .admin-nav-label { display:none; }
      body.admin-mode .admin-nav-item { width:auto; min-width:44px; min-height:38px; padding:0 10px; justify-content:center; }
      body.admin-mode .admin-nav-item span:not(.admin-nav-icon) { display:none; }
      body.admin-mode .admin-nav-icon { width:18px; }
      body.admin-mode .admin-main { padding:14px 10px 28px; }
      .admin-folder-strip { margin-bottom:14px; }
      .admin-folder-tab { min-height:38px; padding:0 12px; }
      body.admin-mode .admin-kpis { grid-template-columns:1fr 1fr; }
    }
    @media (max-width:420px) {
      body.admin-mode .admin-kpis { grid-template-columns:1fr; }
      body.admin-mode .admin-folder-tab { padding:0 10px; }
    }

    /* Professional global admin dashboard. User Dashboard styles intentionally remain separate. */
    .admin-shell {
      display: none;
      min-height: 100vh;
      width: 100%;
      gap: 0;
      color: #0f172a;
      background:
        radial-gradient(circle at 88% 4%, rgba(59,130,246,.12), transparent 23%),
        radial-gradient(circle at 8% 78%, rgba(99,102,241,.08), transparent 28%),
        #f5f7fb;
    }

    .admin-sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 238px;
      flex: 0 0 238px;
      padding: 22px 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      background: rgba(15,23,42,.97);
      color: #e5edf8;
      border-right: 1px solid rgba(148,163,184,.16);
      box-shadow: 14px 0 36px rgba(15,23,42,.08);
      z-index: 30;
    }

    .admin-brand {
      display:flex;
      align-items:center;
      gap:11px;
      padding: 4px 7px 0;
    }

    .admin-brand-mark {
      width:40px;
      height:40px;
      display:grid;
      place-items:center;
      border-radius:13px;
      background: linear-gradient(145deg,#2563eb,#4f46e5);
      color:#fff;
      font-weight:900;
      box-shadow: 0 10px 24px rgba(37,99,235,.28);
      letter-spacing:-.05em;
    }

    .admin-brand-copy { min-width:0; }
    .admin-brand-title {
      font-size:15px;
      font-weight:850;
      letter-spacing:.01em;
      color:#fff;
    }
    .admin-brand-sub {
      margin-top:2px;
      font-size:10px;
      color:#94a3b8;
      letter-spacing:.06em;
      text-transform:uppercase;
    }

    .admin-nav {
      display:grid;
      gap:5px;
    }

    .admin-nav-label {
      padding:0 10px 5px;
      font-size:9px;
      font-weight:800;
      color:#64748b;
      letter-spacing:.11em;
      text-transform:uppercase;
    }

    .admin-nav-item {
      appearance:none;
      width:100%;
      min-height:43px;
      display:flex;
      align-items:center;
      gap:11px;
      border:1px solid transparent;
      border-radius:11px;
      padding:0 11px;
      background:transparent;
      color:#aab7ca;
      text-align:left;
      font-size:13px;
      font-weight:750;
      cursor:pointer;
      transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease;
    }
    .admin-nav-item:hover {
      background:rgba(59,130,246,.10);
      color:#eaf2ff;
    }
    .admin-nav-item.active {
      background:linear-gradient(90deg,rgba(37,99,235,.25),rgba(79,70,229,.15));
      border-color:rgba(96,165,250,.20);
      color:#fff;
      box-shadow: inset 3px 0 0 #60a5fa;
    }
    .admin-nav-icon {
      width:18px;
      height:18px;
      display:grid;
      place-items:center;
      color:currentColor;
      flex:0 0 18px;
    }
    .admin-nav-icon svg {
      width:18px;
      height:18px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    .admin-sidebar-footer {
      margin-top:auto;
      padding:12px;
      border:1px solid rgba(148,163,184,.12);
      border-radius:14px;
      background:rgba(255,255,255,.035);
    }
    .admin-secure-line {
      display:flex;
      align-items:center;
      gap:7px;
      color:#b9c7da;
      font-size:10px;
      font-weight:700;
    }
    .admin-secure-dot {
      width:8px;
      height:8px;
      border-radius:50%;
      background:#34d399;
      box-shadow:0 0 0 4px rgba(52,211,153,.10), 0 0 12px rgba(52,211,153,.46);
    }
    .admin-role-caption {
      margin-top:6px;
      color:#738198;
      font-size:10px;
      line-height:1.4;
    }

    .admin-main {
      min-width:0;
      flex:1;
      padding: 26px clamp(18px,3vw,40px) 40px;
    }

    .admin-header {
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:18px;
      margin-bottom:24px;
    }
    .admin-header-copy { min-width:0; }
    .admin-eyebrow {
      margin-bottom:6px;
      color:#64748b;
      font-size:10px;
      font-weight:850;
      letter-spacing:.12em;
      text-transform:uppercase;
    }
    .admin-heading {
      margin:0;
      color:#0f172a;
      font-size:clamp(26px,4vw,34px);
      line-height:1.05;
      font-weight:900;
      letter-spacing:-.035em;
    }
    .admin-heading-sub {
      margin-top:7px;
      color:#64748b;
      font-size:12px;
      line-height:1.45;
    }
    .admin-header-actions {
      display:flex;
      align-items:center;
      gap:9px;
      flex:0 0 auto;
    }
    .admin-session {
      display:flex;
      align-items:center;
      gap:9px;
      padding:8px 10px 8px 8px;
      border:1px solid #e2e8f0;
      border-radius:13px;
      background:rgba(255,255,255,.82);
      box-shadow:0 7px 20px rgba(15,23,42,.05);
    }
    .admin-avatar {
      width:34px;
      height:34px;
      display:grid;
      place-items:center;
      border-radius:11px;
      background:linear-gradient(145deg,#dbeafe,#e0e7ff);
      color:#1e3a8a;
      font-size:12px;
      font-weight:900;
    }
    .admin-session-name {
      color:#0f172a;
      font-size:11px;
      font-weight:850;
      max-width:150px;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    .admin-session-role {
      margin-top:2px;
      color:#64748b;
      font-size:9px;
    }
    .admin-refresh {
      min-height:48px;
      min-width:48px;
      display:grid;
      place-items:center;
      border:1px solid #dbe3ee;
      border-radius:13px;
      background:#fff;
      color:#334155;
      cursor:pointer;
      box-shadow:0 7px 20px rgba(15,23,42,.05);
    }
    .admin-refresh svg {
      width:18px;
      height:18px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.9;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    .admin-section { scroll-margin-top: 18px; }
    .admin-section + .admin-section { margin-top:24px; }

    .admin-kpis {
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:12px;
    }
    .admin-kpi {
      position:relative;
      overflow:hidden;
      min-height:128px;
      padding:17px 17px 15px;
      border:1px solid #e2e8f0;
      border-radius:18px;
      background:rgba(255,255,255,.88);
      box-shadow:0 12px 28px rgba(15,23,42,.055);
    }
    .admin-kpi::after {
      content:"";
      position:absolute;
      width:100px;
      height:100px;
      right:-36px;
      top:-38px;
      border-radius:50%;
      background:rgba(59,130,246,.06);
    }
    .admin-kpi-icon {
      width:36px;
      height:36px;
      display:grid;
      place-items:center;
      margin-bottom:12px;
      border-radius:11px;
      background:#eff6ff;
      color:#2563eb;
    }
    .admin-kpi-icon svg {
      width:18px;
      height:18px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
    .admin-kpi-label {
      color:#64748b;
      font-size:10px;
      font-weight:800;
      letter-spacing:.04em;
      text-transform:uppercase;
    }
    .admin-kpi-value {
      margin-top:3px;
      color:#0f172a;
      font-size:26px;
      font-weight:900;
      letter-spacing:-.03em;
    }
    .admin-kpi-note {
      margin-top:2px;
      color:#94a3b8;
      font-size:10px;
    }
    .admin-kpi[data-tone="indigo"] .admin-kpi-icon { background:#eef2ff; color:#4f46e5; }
    .admin-kpi[data-tone="green"] .admin-kpi-icon { background:#ecfdf5; color:#059669; }
    .admin-kpi[data-tone="amber"] .admin-kpi-icon { background:#fffbeb; color:#d97706; }

    .admin-panel {
      border:1px solid #e2e8f0;
      border-radius:20px;
      background:rgba(255,255,255,.91);
      box-shadow:0 12px 32px rgba(15,23,42,.055);
      overflow:hidden;
    }
    .admin-panel-head {
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:14px;
      padding:19px 20px 16px;
      border-bottom:1px solid #edf1f6;
    }
    .admin-panel-title {
      margin:0;
      color:#0f172a;
      font-size:15px;
      font-weight:880;
      letter-spacing:-.015em;
    }
    .admin-panel-sub {
      margin-top:4px;
      color:#7b8798;
      font-size:10px;
      line-height:1.45;
    }
    .admin-status-pill {
      display:inline-flex;
      align-items:center;
      gap:6px;
      min-height:28px;
      padding:0 10px;
      border-radius:999px;
      background:#f0fdf4;
      border:1px solid #dcfce7;
      color:#15803d;
      font-size:9px;
      font-weight:850;
      text-transform:uppercase;
      letter-spacing:.05em;
      white-space:nowrap;
    }
    .admin-status-pill::before {
      content:"";
      width:6px;
      height:6px;
      border-radius:50%;
      background:#22c55e;
    }

    .admin-panel-body { padding:18px 20px 20px; }

    .admin-control-grid {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:12px;
    }
    .admin-control {
      padding:15px;
      border:1px solid #e7edf5;
      border-radius:16px;
      background:#fbfcfe;
    }
    .admin-control-head {
      display:flex;
      align-items:center;
      gap:10px;
      margin-bottom:13px;
    }
    .admin-control-icon {
      width:38px;
      height:38px;
      display:grid;
      place-items:center;
      flex:0 0 38px;
      border-radius:12px;
      background:#eff6ff;
      color:#2563eb;
    }
    .admin-control-icon svg {
      width:18px;
      height:18px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
    .admin-control-name {
      color:#0f172a;
      font-size:12px;
      font-weight:850;
    }
    .admin-control-hint {
      margin-top:2px;
      color:#8a96a8;
      font-size:9px;
    }
    .admin-field-label {
      display:block;
      margin-bottom:6px;
      color:#64748b;
      font-size:9px;
      font-weight:800;
      letter-spacing:.05em;
      text-transform:uppercase;
    }
    .admin-field {
      width:100%;
      min-height:44px;
      padding:0 12px;
      border:1px solid #dce4ee;
      border-radius:11px;
      outline:none;
      background:#fff;
      color:#0f172a;
      font-size:15px;
      font-weight:750;
      transition:border-color .18s ease, box-shadow .18s ease;
    }
    .admin-field:focus {
      border-color:#7aa7ff;
      box-shadow:0 0 0 3px rgba(37,99,235,.10);
    }
    .admin-field-suffix {
      position:relative;
    }
    .admin-field-unit {
      position:absolute;
      right:12px;
      top:50%;
      transform:translateY(-50%);
      color:#94a3b8;
      font-size:9px;
      font-weight:800;
      text-transform:uppercase;
    }
    .admin-field-suffix .admin-field { padding-right:65px; }

    .admin-action-bar {
      display:flex;
      align-items:center;
      justify-content:flex-end;
      gap:10px;
      margin-top:15px;
      padding-top:15px;
      border-top:1px solid #edf1f6;
    }
    .admin-save {
      min-height:43px;
      padding:0 16px;
      border:0;
      border-radius:11px;
      background:linear-gradient(180deg,#2563eb,#1d4ed8);
      color:#fff;
      font-size:11px;
      font-weight:850;
      cursor:pointer;
      box-shadow:0 9px 20px rgba(37,99,235,.18);
    }
    .admin-save:hover { filter:brightness(1.03); }
    .admin-save:active { transform:translateY(1px); }
    .admin-save.secondary {
      background:#f8fafc;
      color:#334155;
      border:1px solid #dce4ee;
      box-shadow:none;
    }

    .admin-automation {
      display:grid;
      grid-template-columns:minmax(0,1fr) auto;
      align-items:center;
      gap:20px;
      padding:16px;
      border:1px solid #e5ebf3;
      border-radius:16px;
      background:linear-gradient(145deg,#fcfdff,#f8fafc);
    }
    .admin-automation-copy {
      display:flex;
      gap:12px;
      align-items:flex-start;
      min-width:0;
    }
    .admin-automation-icon {
      width:40px;
      height:40px;
      flex:0 0 40px;
      display:grid;
      place-items:center;
      border-radius:12px;
      background:#eff6ff;
      color:#2563eb;
    }
    .admin-automation-icon svg {
      width:19px;
      height:19px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
    .admin-automation-title {
      color:#0f172a;
      font-size:13px;
      font-weight:850;
    }
    .admin-automation-sub {
      margin-top:4px;
      color:#7b8798;
      font-size:10px;
      line-height:1.5;
      max-width:540px;
    }
    .admin-switch {
      position:relative;
      width:54px;
      height:30px;
      flex:0 0 54px;
      display:inline-flex;
      cursor:pointer;
    }
    .admin-switch input {
      position:absolute;
      opacity:0;
      width:1px;
      height:1px;
    }
    .admin-switch-track {
      position:absolute;
      inset:0;
      border-radius:999px;
      background:#cbd5e1;
      transition:background .2s ease;
    }
    .admin-switch-thumb {
      position:absolute;
      top:4px;
      left:4px;
      width:22px;
      height:22px;
      border-radius:50%;
      background:#fff;
      box-shadow:0 3px 10px rgba(15,23,42,.18);
      transition:transform .2s ease;
    }
    .admin-switch input:checked + .admin-switch-track { background:#2563eb; }
    .admin-switch input:checked + .admin-switch-track .admin-switch-thumb { transform:translateX(24px); }

    .admin-section-nav-note {
      margin-top:10px;
      color:#94a3b8;
      font-size:9px;
    }

    .admin-empty-note {
      padding:12px 0 0;
      color:#94a3b8;
      font-size:10px;
    }

    body.admin-mode {
      padding: 0;
    }
    body.admin-mode::before,
    body.admin-mode::after {
      display: none;
    }
    .admin-mode {
      color-scheme: light;
      min-height:100vh;
      background:
        radial-gradient(circle at 88% 4%, rgba(59,130,246,.12), transparent 23%),
        radial-gradient(circle at 8% 78%, rgba(99,102,241,.08), transparent 28%),
        #f5f7fb;
      color:#0f172a;
    }
    .admin-mode #app.wrap {
      max-width:none;
      margin:0;
    }
    .admin-mode .top,
    .admin-mode #stats-card,
    .admin-mode #limits-card,
    .admin-mode #counts-card,
    .admin-mode #reminder-card {
      display:none !important;
    }
    .admin-mode #admin-shell.panel-only-private,
    .admin-mode #admin-shell.panel-only-private.visible {
      display:grid !important;
      grid-template-columns:238px minmax(0,1fr);
    }
    .admin-mode #notice {
      position:fixed;
      z-index:200;
      top:max(13px,env(safe-area-inset-top));
      left:50%;
      transform:translateX(-50%);
      width:min(520px,calc(100% - 30px));
      margin:0;
      box-shadow:0 16px 36px rgba(15,23,42,.12);
    }
    .admin-mode #user-loading {
      background:rgba(241,245,249,.56);
    }
    .admin-mode .user-loading,
    .admin-mode .user-mode .user-loading { z-index:300; }

    .admin-users-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
    .admin-users-search{flex:1 1 260px;min-width:0;height:42px;padding:0 13px;border:1px solid #dbe3ef;border-radius:12px;background:#fff;color:#0f172a;outline:none;font-size:13px;box-shadow:0 2px 8px rgba(15,23,42,.03)}
    .admin-users-search:focus{border-color:#7aaaf7;box-shadow:0 0 0 4px rgba(37,99,235,.09)}
    .admin-users-filter{height:42px;padding:0 12px;border:1px solid #dbe3ef;border-radius:12px;background:#fff;color:#334155;font-weight:700;outline:none}
    .admin-users-meta{color:#64748b;font-size:11px;white-space:nowrap}
    .admin-analytics-grid { display:grid; grid-template-columns:1.35fr 1fr; gap:16px; margin-top:16px; }
    .admin-analytics-card { border:1px solid var(--admin-line); border-radius:16px; padding:16px; background:var(--admin-surface); }
    .admin-analytics-card h3 { margin:0 0 12px; font-size:15px; }
    .admin-analytics-list { display:grid; gap:8px; max-height:430px; overflow:auto; }
    .admin-analytics-row { display:flex; justify-content:space-between; gap:12px; padding:10px 12px; border:1px solid var(--admin-line); border-radius:11px; font-size:13px; }
    .admin-analytics-row span { color:var(--admin-muted); }
    @media (max-width:700px){ .admin-analytics-grid { grid-template-columns:1fr; } }
    .admin-users-table-wrap{overflow:auto;border:1px solid #e2e8f0;border-radius:14px;background:#fff}
    .admin-users-table{width:100%;min-width:760px;border-collapse:collapse}
    .admin-users-table th,.admin-users-table td{padding:12px 14px;border-bottom:1px solid #edf1f6;text-align:left;vertical-align:middle;font-size:12px}
    .admin-users-table th{color:#64748b;background:#f8fafc;font-size:10px;text-transform:uppercase;letter-spacing:.07em;font-weight:800;position:sticky;top:0;z-index:1}
    .admin-users-table tr:last-child td{border-bottom:0}
    .admin-user-primary{display:flex;align-items:center;gap:10px;min-width:180px}
    .admin-user-avatar{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:11px;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:900}
    .admin-user-name{color:#0f172a;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
    .admin-user-sub{margin-top:2px;color:#94a3b8;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
    .admin-user-id{color:#475569;font-variant-numeric:tabular-nums}
    .admin-user-status{display:inline-flex;align-items:center;gap:6px;min-height:25px;padding:0 8px;border-radius:999px;font-size:10px;font-weight:800;text-transform:capitalize}
    .admin-user-status::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
    .admin-user-status.active{color:#15803d;background:#f0fdf4}.admin-user-status.inactive{color:#64748b;background:#f1f5f9}
    .admin-user-activity{color:#334155;font-weight:700}.admin-user-muted{color:#94a3b8}
    .admin-users-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
    .admin-users-pagination{display:flex;gap:7px}
    .admin-users-page{min-width:72px;height:36px;padding:0 11px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#334155;font-size:11px;font-weight:800;cursor:pointer}
    .admin-users-page:disabled{opacity:.45;cursor:not-allowed}
    .admin-users-empty{padding:34px 16px;text-align:center;color:#64748b;font-size:12px}

    @media (max-width: 980px) {
      .admin-sidebar { width:208px; flex-basis:208px; }
      .admin-mode #admin-shell.panel-only-private,
      .admin-mode #admin-shell.panel-only-private.visible {
        grid-template-columns:208px minmax(0,1fr);
      }
      .admin-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .admin-control-grid { grid-template-columns:1fr; }
    }

    @media (max-width: 700px) {
      .admin-mode #admin-shell.panel-only-private,
      .admin-mode #admin-shell.panel-only-private.visible {
        display:block !important;
      }
      .admin-sidebar {
        position:sticky;
        top:0;
        width:100%;
        height:auto;
        padding:10px 12px;
        flex-direction:row;
        align-items:center;
        gap:8px;
        border-right:0;
        border-bottom:1px solid rgba(148,163,184,.16);
      }
      .admin-brand { padding:0 2px; }
      .admin-brand-mark { width:34px; height:34px; border-radius:11px; }
      .admin-brand-copy { display:none; }
      .admin-nav-label,
      .admin-sidebar-footer { display:none; }
      .admin-nav {
        display:flex;
        gap:5px;
        flex:1;
        justify-content:flex-end;
      }
      .admin-nav-item {
        width:43px;
        min-height:39px;
        justify-content:center;
        padding:0;
      }
      .admin-nav-item span:not(.admin-nav-icon) { display:none; }
      .admin-main {
        padding:18px 12px 30px;
      }
      .admin-header { flex-direction:column; gap:12px; margin-bottom:18px; }
      .admin-header-actions { width:100%; justify-content:space-between; }
      .admin-session { flex:1; min-width:0; }
      .admin-session-name { max-width:none; }
      .admin-kpis { grid-template-columns:1fr 1fr; gap:9px; }
      .admin-kpi { min-height:118px; padding:14px; }
      .admin-kpi-value { font-size:23px; }
      .admin-panel-head { padding:16px; }
      .admin-panel-body { padding:15px; }
      .admin-automation { grid-template-columns:minmax(0,1fr) auto; }
    }

    @media (max-width: 420px) {
      .admin-kpis { grid-template-columns:1fr; }
      .admin-control { padding:13px; }
      .admin-action-bar { flex-direction:column; align-items:stretch; }
      .admin-save { width:100%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .admin-nav-item,
      .admin-field,
      .admin-switch-track,
      .admin-switch-thumb { transition:none !important; }
    }
    .admin-health-button{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:9px;padding:7px 10px;font-size:11px;font-weight:800;cursor:pointer}
    .admin-health-result{margin-top:16px;border:1px solid #e2e8f0;border-radius:14px;padding:15px;background:#f8fafc}
    .admin-health-result-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
    .admin-health-result-title{font-weight:850;color:#0f172a}
    .admin-health-check{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid #e2e8f0;font-size:12px}
    .admin-health-ok{color:#15803d;font-weight:800}.admin-health-error{color:#b91c1c;font-weight:800}
  </style>
</head>
<body>
  <div id="user-loading" class="user-loading" aria-live="polite" aria-label="Loading"><div class="user-loader"></div></div>

  <div id="splash" aria-label="Loading">
    <h1 id="splash-title">Welcome from Zheng Duo</h1>
  </div>

  <main class="wrap" id="app">
    <div class="top">
      <div>
        <h1 id="title">⚙️ Admin Panel</h1>
        <div class="credit-marquee" aria-label="Creator credit">
          <div class="credit-track">
            <span class="credit-text"><strong>This bot was created by Chan Myae</strong></span>
            <span class="credit-text" aria-hidden="true"><strong>This bot was created by Chan Myae</strong></span>
          </div>
        </div>
        <div class="sub" id="identity">Checking access…</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;align-items:stretch;justify-content:flex-start">
        <button class="refresh action-button" id="refresh" type="button"><span class="button-content"><span>Refresh</span></span></button>
        <button class="switch-group" id="switch-group" type="button" hidden>Switch</button>
      </div>
    </div>

    <div id="notice" class="notice" role="status" aria-live="polite"></div>

    <section id="admin-shell" class="panel-only-private" aria-label="Administrator dashboard">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <div class="admin-brand-mark">Z28</div>
          <div class="admin-brand-copy">
            <div class="admin-brand-title">Control Center</div>
            <div class="admin-brand-sub">Attendance Bot</div>
          </div>
        </div>

        <div class="admin-nav" aria-label="Admin folders">
          <div class="admin-nav-label">Folders</div>
          <button class="admin-nav-item admin-folder-item active" type="button" data-admin-folder="dashboard"><span class="admin-nav-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect></svg></span><span>Dashboard</span></button>
          <button class="admin-nav-item admin-folder-item" type="button" data-admin-folder="management"><span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M22 19V3"></path></svg></span><span>Management</span></button>
          <button class="admin-nav-item admin-folder-item" type="button" data-admin-folder="analytics"><span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16"></path><path d="m7 15 4-4 3 2 5-6"></path></svg></span><span>Analytics</span></button>
          <button class="admin-nav-item admin-folder-item" type="button" data-admin-folder="configuration"><span class="admin-nav-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 0 1-1 3.5"></path><path d="M5 12a7 7 0 0 1 1-3.5"></path><path d="M12 5V3M12 21v-2"></path></svg></span><span>Configuration</span></button>
          <button class="admin-nav-item admin-folder-item" type="button" data-admin-folder="operations"><span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"></path><path d="M8 8h8M8 12h6M8 16h4"></path></svg></span><span>Operations</span></button>
          <button class="admin-nav-item admin-folder-item" type="button" data-admin-folder="security"><span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.6-2.8 8.2-7 10-4.2-1.8-7-5.4-7-10V6l7-3z"></path><path d="M9.5 12l1.7 1.7 3.6-4"></path></svg></span><span>Security</span></button>
        </div>

        <div class="admin-sidebar-footer">
          <div class="admin-secure-line"><span class="admin-secure-dot"></span><span>Protected workspace</span></div>
          <div class="admin-role-caption" id="admin-sidebar-role">Authorized owner / administrator</div>
        </div>
      </aside>

      <div class="admin-main">
        <div class="admin-folder-strip" aria-label="Admin folder tabs">
          <button class="admin-folder-tab active" type="button" data-admin-folder="dashboard"><span>Dashboard</span></button>
          <button class="admin-folder-tab" type="button" data-admin-folder="management"><span>Management</span></button>
          <button class="admin-folder-tab" type="button" data-admin-folder="analytics"><span>Analytics</span></button>
          <button class="admin-folder-tab" type="button" data-admin-folder="configuration"><span>Configuration</span></button>
          <button class="admin-folder-tab" type="button" data-admin-folder="operations"><span>Operations</span></button>
          <button class="admin-folder-tab" type="button" data-admin-folder="security"><span>Security</span></button>
        </div>

        <header class="admin-header">
          <div class="admin-header-copy">
            <div class="admin-eyebrow">Z28 Attendance Bot</div>
            <h1 class="admin-heading">Administration</h1>
            <div class="admin-heading-sub">Manage global activity policy, usage limits, and automated reminders.</div>
          </div>

          <div class="admin-header-actions">
            <div class="admin-session">
              <div class="admin-avatar" id="admin-avatar">A</div>
              <div>
                <div class="admin-session-name" id="admin-session-name">Administrator</div>
                <div class="admin-session-role" id="admin-session-role">Authorized session</div>
              </div>
            </div>
            <button class="admin-refresh action-button" id="admin-refresh" type="button" aria-label="Refresh dashboard">
              <span class="button-content"><svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 0 0-14.9-4"></path><path d="M4 4v5h5"></path><path d="M4 13a8 8 0 0 0 14.9 4"></path><path d="M20 20v-5h-5"></path></svg></span>
            </button>
          </div>
        </header>

        <section class="admin-section" id="admin-overview">
          <div class="admin-kpis">
            <article class="admin-kpi">
              <div class="admin-kpi-icon"><svg viewBox="0 0 24 24"><path d="M16 20v-1.7a4.3 4.3 0 0 0-4.3-4.3H7.3A4.3 4.3 0 0 0 3 18.3V20"></path><circle cx="9.5" cy="7.5" r="3.5"></circle><path d="M16 4.8a3.5 3.5 0 0 1 0 5.4"></path><path d="M21 19.8v-1.5a4.3 4.3 0 0 0-3.2-4.1"></path></svg></div>
              <div class="admin-kpi-label">Private Users</div>
              <div class="admin-kpi-value" id="admin-users">—</div>
              <div class="admin-kpi-note">Users who opened the bot privately</div>
            </article>

            <article class="admin-kpi" data-tone="indigo">
              <div class="admin-kpi-icon"><svg viewBox="0 0 24 24"><path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v6A3.5 3.5 0 0 1 16.5 17H11l-4 3v-3.2A3.5 3.5 0 0 1 4 13.5z"></path><path d="M8 9h8"></path><path d="M8 12h5"></path></svg></div>
              <div class="admin-kpi-label">Managed Groups</div>
              <div class="admin-kpi-value" id="admin-groups">—</div>
              <div class="admin-kpi-note">Groups currently known by the bot</div>
            </article>

            <article class="admin-kpi" data-tone="green">
              <div class="admin-kpi-icon"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"></path><path d="M12 7v5l3 2"></path><path d="M16 3h5v5"></path><path d="M21 3l-4 4"></path></svg></div>
              <div class="admin-kpi-label">Active Activities</div>
              <div class="admin-kpi-value" id="admin-active">—</div>
              <div class="admin-kpi-note">Live member sessions across groups</div>
            </article>

            <article class="admin-kpi" data-tone="amber">
              <div class="admin-kpi-icon"><svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg></div>
              <div class="admin-kpi-label">Overdue Reminder</div>
              <div class="admin-kpi-value" id="admin-reminder-status">—</div>
              <div class="admin-kpi-note" id="admin-reminder-note">Automation status</div>
            </article>
          </div>
        </section>

        <section class="admin-section" id="admin-analytics">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">Analytics & Reports</h2>
              <div class="admin-panel-sub">Attendance activity trends and usage summaries for the selected period.</div>
            </div>
            <select class="admin-users-filter" id="admin-analytics-period" aria-label="Analytics period">
              <option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option>
            </select></div>
            <div class="admin-panel-body">
              <div class="admin-kpi-grid" id="admin-analytics-kpis"></div>
              <div class="admin-report-actions">
                <button class="admin-report-button" id="admin-export-csv" type="button">Export CSV</button>
                <span class="admin-panel-sub">Exports completed attendance records for the selected period.</span>
              </div>
              <div class="admin-analytics-grid">
                <div class="admin-analytics-card"><h3>Daily activity</h3><div id="admin-analytics-daily" class="admin-analytics-list"></div></div>
                <div class="admin-analytics-card"><h3>Activity types</h3><div id="admin-analytics-kinds" class="admin-analytics-list"></div></div>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-audit">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">Audit Log</h2>
              <div class="admin-panel-sub">Review administrative changes made through the protected dashboard.</div>
            </div><div class="admin-status-pill">Protected history</div></div>
            <div class="admin-panel-body">
              <div class="admin-users-toolbar">
                <input class="admin-users-search" id="admin-audit-search" type="search" autocomplete="off" placeholder="Search admin, action, target, or details">
                <select class="admin-users-filter" id="admin-audit-filter" aria-label="Filter audit actions">
                  <option value="">All actions</option><option value="activity_limit.updated">Activity limits</option><option value="daily_limit.updated">Daily limits</option><option value="automation.updated">Automation</option>
                </select>
                <span class="admin-users-meta" id="admin-audit-meta">Loading audit history…</span>
              </div>
              <div class="admin-users-table-wrap"><table class="admin-users-table">
                <thead><tr><th>Time</th><th>Administrator</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
                <tbody id="admin-audit-table-body"><tr><td colspan="5"><div class="admin-users-empty">Loading audit history…</div></td></tr></tbody>
              </table></div>
              <div class="admin-users-footer"><span class="admin-users-meta" id="admin-audit-page-meta">—</span><div class="admin-users-pagination">
                <button class="admin-users-page" id="admin-audit-prev" type="button">Previous</button><button class="admin-users-page" id="admin-audit-next" type="button">Next</button>
              </div></div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-groups-management">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">Group Management</h2>
              <div class="admin-panel-sub">Monitor managed groups, live attendance activity, and connected destinations.</div>
            </div><div class="admin-status-pill">Managed groups</div></div>
            <div class="admin-panel-body">
              <div class="admin-users-toolbar">
                <input class="admin-users-search" id="admin-groups-search" type="search" autocomplete="off" placeholder="Search group name, username, or chat ID">
                <span class="admin-users-meta" id="admin-groups-meta">Loading groups…</span>
              </div>
              <div class="admin-users-table-wrap">
                <table class="admin-users-table">
                  <thead><tr><th>Group</th><th>Chat ID</th><th>Members</th><th>Active</th><th>Connection</th><th>Last Updated</th><th>Health</th></tr></thead>
                  <tbody id="admin-groups-table-body"><tr><td colspan="7"><div class="admin-users-empty">Loading groups…</div></td></tr></tbody>
                </table>
              <div class="admin-health-result" id="admin-group-health-result" hidden></div>
              </div>
              <div class="admin-users-footer">
                <span class="admin-users-meta" id="admin-groups-page-meta">—</span>
                <div class="admin-users-pagination">
                  <button class="admin-users-page" id="admin-groups-prev" type="button">Previous</button>
                  <button class="admin-users-page" id="admin-groups-next" type="button">Next</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-users-management">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">User Management</h2>
              <div class="admin-panel-sub">Search private users, inspect activity usage, and monitor current sessions.</div>
            </div><div class="admin-status-pill">Live data</div></div>
            <div class="admin-panel-body">
              <div class="admin-users-toolbar">
                <input class="admin-users-search" id="admin-users-search" type="search" autocomplete="off" placeholder="Search name, username, or Telegram ID">
                <select class="admin-users-filter" id="admin-users-filter" aria-label="Filter users">
                  <option value="all">All users</option><option value="active">Active now</option><option value="inactive">Inactive</option>
                </select>
                <span class="admin-users-meta" id="admin-users-meta">Loading users…</span>
              </div>
              <div class="admin-users-table-wrap">
                <table class="admin-users-table">
                  <thead><tr><th>User</th><th>Telegram ID</th><th>Status</th><th>Current Activity</th><th>Activities</th><th>Warnings</th><th>Last Active</th></tr></thead>
                  <tbody id="admin-users-table-body"><tr><td colspan="7"><div class="admin-users-empty">Loading users…</div></td></tr></tbody>
                </table>
              </div>
              <div class="admin-users-footer">
                <span class="admin-users-meta" id="admin-users-page-meta">—</span>
                <div class="admin-users-pagination">
                  <button class="admin-users-page" id="admin-users-prev" type="button">Previous</button>
                  <button class="admin-users-page" id="admin-users-next" type="button">Next</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-maintenance">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">Maintenance</h2>
              <div class="admin-panel-sub">Keep administrative history manageable by removing old audit entries.</div>
            </div><div class="admin-status-pill">Admin only</div></div>
            <div class="admin-panel-body">
              <div class="admin-maintenance-box">
                <div class="admin-maintenance-card">
                  <div class="admin-maintenance-title">Audit log retention</div>
                  <div class="admin-maintenance-note">Only audit logs older than the selected retention period are removed. This does not delete attendance records, users, groups, or active activities.</div>
                </div>
                <div class="admin-maintenance-controls">
                  <select class="admin-maintenance-select" id="admin-retention-days" aria-label="Audit log retention">
                    <option value="90">90 days</option>
                    <option value="180" selected>180 days</option>
                    <option value="365">1 year</option>
                    <option value="730">2 years</option>
                  </select>
                  <button class="admin-save" id="admin-retention-cleanup" type="button">Clean old audit logs</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-backup">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">Data Backup</h2>
              <div class="admin-panel-sub">Create a complete JSON snapshot of the bot's stored attendance data and current live activities.</div>
            </div><div class="admin-status-pill">Admin only</div></div>
            <div class="admin-panel-body">
              <div class="admin-backup-box">
                <div class="admin-backup-card">
                  <div class="admin-backup-title">Full backup</div>
                  <div class="admin-backup-note">The backup contains users, attendance records, group settings, warning history, connected groups, and active activities. Bot credentials are not included.</div>
                </div>
                <button class="admin-save" id="admin-backup-download" type="button">Download JSON Backup</button>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-broadcast">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">Broadcast Center</h2>
              <div class="admin-panel-sub">Send an administrative announcement to users who have a private chat with the bot.</div>
            </div><div class="admin-status-pill">Admin only</div></div>
            <div class="admin-panel-body">
              <div class="admin-broadcast-box">
                <textarea class="admin-broadcast-textarea" id="admin-broadcast-message" maxlength="4000" placeholder="Write your announcement…"></textarea>
                <div class="admin-broadcast-footer">
                  <span class="admin-panel-sub" id="admin-broadcast-count">0 / 4000</span>
                  <button class="admin-broadcast-send" id="admin-broadcast-send" type="button">Send announcement</button>
                </div>
                <div class="admin-broadcast-result" id="admin-broadcast-result"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-health">
          <div class="admin-panel">
            <div class="admin-panel-head"><div>
              <h2 class="admin-panel-title">System Health</h2>
              <div class="admin-panel-sub">Live diagnostics for the admin API, persistent storage, and Telegram connection.</div>
            </div><button class="admin-save" id="admin-health-refresh" type="button">Check now</button></div>
            <div class="admin-panel-body">
              <div class="admin-health-grid">
                <div class="admin-health-card"><div class="admin-health-head"><div class="admin-health-name">Admin API</div><span class="admin-health-dot" id="health-api-dot"></span></div><div class="admin-health-value" id="health-api-value">Checking…</div></div>
                <div class="admin-health-card"><div class="admin-health-head"><div class="admin-health-name">Persistent Storage</div><span class="admin-health-dot" id="health-storage-dot"></span></div><div class="admin-health-value" id="health-storage-value">Checking…</div></div>
                <div class="admin-health-card"><div class="admin-health-head"><div class="admin-health-name">Telegram API</div><span class="admin-health-dot" id="health-telegram-dot"></span></div><div class="admin-health-value" id="health-telegram-value">Checking…</div></div>
              </div>
              <div class="admin-health-meta">
                <div class="admin-health-meta-card"><div class="admin-health-meta-label">Overall status</div><div class="admin-health-meta-value" id="health-overall">Checking…</div></div>
                <div class="admin-health-meta-card"><div class="admin-health-meta-label">Uptime</div><div class="admin-health-meta-value" id="health-uptime">—</div></div>
                <div class="admin-health-meta-card"><div class="admin-health-meta-label">Memory</div><div class="admin-health-meta-value" id="health-memory">—</div></div>
              </div>
              <div class="admin-panel-sub" id="health-checked-at" style="margin-top:14px">Last checked: —</div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-duration">
          <div class="admin-panel">
            <div class="admin-panel-head">
              <div>
                <h2 class="admin-panel-title">Activity duration policy</h2>
                <div class="admin-panel-sub">Set the global time limit for each tracked activity. Group-specific settings remain separate.</div>
              </div>
              <div class="admin-status-pill">Global policy</div>
            </div>
            <div class="admin-panel-body">
              <div class="admin-control-grid">
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"></circle><path d="M9 3h6"></path><path d="M12 5.5v2"></path><path d="M12 13l2.7-2"></path></svg></div><div><div class="admin-control-name">Eat</div><div class="admin-control-hint">Meal break duration</div></div></div>
                  <label class="admin-field-label" for="admin-limit-eat">Minutes</label>
                  <div class="admin-field-suffix"><input class="admin-field" id="admin-limit-eat" type="number" min="1" step="1"><span class="admin-field-unit">min</span></div>
                </div>
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"></circle><path d="M9 3h6"></path><path d="M12 5.5v2"></path><path d="M12 13l2.7-2"></path></svg></div><div><div class="admin-control-name">WC</div><div class="admin-control-hint">Toilet break duration</div></div></div>
                  <label class="admin-field-label" for="admin-limit-wc">Minutes</label>
                  <div class="admin-field-suffix"><input class="admin-field" id="admin-limit-wc" type="number" min="1" step="1"><span class="admin-field-unit">min</span></div>
                </div>
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"></circle><path d="M9 3h6"></path><path d="M12 5.5v2"></path><path d="M12 13l2.7-2"></path></svg></div><div><div class="admin-control-name">Smoke</div><div class="admin-control-hint">Smoke break duration</div></div></div>
                  <label class="admin-field-label" for="admin-limit-smoke">Minutes</label>
                  <div class="admin-field-suffix"><input class="admin-field" id="admin-limit-smoke" type="number" min="1" step="1"><span class="admin-field-unit">min</span></div>
                </div>
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"></circle><path d="M9 3h6"></path><path d="M12 5.5v2"></path><path d="M12 13l2.7-2"></path></svg></div><div><div class="admin-control-name">WCD</div><div class="admin-control-hint">WCD duration</div></div></div>
                  <label class="admin-field-label" for="admin-limit-wcd">Minutes</label>
                  <div class="admin-field-suffix"><input class="admin-field" id="admin-limit-wcd" type="number" min="1" step="1"><span class="admin-field-unit">min</span></div>
                </div>
              </div>
              <div class="admin-action-bar">
                <span class="admin-empty-note">Changes apply globally to groups without an override.</span>
                <button class="admin-save action-button" id="admin-save-duration" type="button"><span class="button-content">Save duration limits</span></button>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-counts">
          <div class="admin-panel">
            <div class="admin-panel-head">
              <div>
                <h2 class="admin-panel-title">Daily activity usage policy</h2>
                <div class="admin-panel-sub">Control how many times members can use each activity per day.</div>
              </div>
              <div class="admin-status-pill">Daily policy</div>
            </div>
            <div class="admin-panel-body">
              <div class="admin-control-grid">
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><path d="M4 21h16"></path><rect x="5" y="13" width="3" height="5" rx="1.5"></rect><rect x="10.5" y="9" width="3" height="9" rx="1.5"></rect><rect x="16" y="5" width="3" height="13" rx="1.5"></rect></svg></div><div><div class="admin-control-name">WC</div><div class="admin-control-hint">Uses per day</div></div></div>
                  <label class="admin-field-label" for="admin-count-wc">Maximum uses</label>
                  <input class="admin-field" id="admin-count-wc" type="number" min="1" step="1">
                </div>
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><path d="M4 21h16"></path><rect x="5" y="13" width="3" height="5" rx="1.5"></rect><rect x="10.5" y="9" width="3" height="9" rx="1.5"></rect><rect x="16" y="5" width="3" height="13" rx="1.5"></rect></svg></div><div><div class="admin-control-name">Smoke</div><div class="admin-control-hint">Uses per day</div></div></div>
                  <label class="admin-field-label" for="admin-count-smoke">Maximum uses</label>
                  <input class="admin-field" id="admin-count-smoke" type="number" min="1" step="1">
                </div>
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><path d="M4 21h16"></path><rect x="5" y="13" width="3" height="5" rx="1.5"></rect><rect x="10.5" y="9" width="3" height="9" rx="1.5"></rect><rect x="16" y="5" width="3" height="13" rx="1.5"></rect></svg></div><div><div class="admin-control-name">WCD</div><div class="admin-control-hint">Uses per day</div></div></div>
                  <label class="admin-field-label" for="admin-count-wcd">Maximum uses</label>
                  <input class="admin-field" id="admin-count-wcd" type="number" min="1" step="1">
                </div>
                <div class="admin-control">
                  <div class="admin-control-head"><div class="admin-control-icon"><svg viewBox="0 0 24 24"><path d="M12 4v16"></path><path d="M4 12h16"></path></svg></div><div><div class="admin-control-name">Eat</div><div class="admin-control-hint">Unlimited by default</div></div></div>
                  <label class="admin-field-label">Usage</label>
                  <input class="admin-field" type="text" value="Unlimited" disabled aria-label="Eat daily limit">
                </div>
              </div>
              <div class="admin-action-bar">
                <span class="admin-empty-note">Eat remains unlimited by policy.</span>
                <button class="admin-save action-button" id="admin-save-counts" type="button"><span class="button-content">Save daily limits</span></button>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-section" id="admin-automation">
          <div class="admin-panel">
            <div class="admin-panel-head">
              <div>
                <h2 class="admin-panel-title">Automation</h2>
                <div class="admin-panel-sub">Configure automatic reminders when a member remains away past the allowed time.</div>
              </div>
              <div class="admin-status-pill">Live</div>
            </div>
            <div class="admin-panel-body">
              <div class="admin-automation">
                <div class="admin-automation-copy">
                  <div class="admin-automation-icon"><svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg></div>
                  <div>
                    <div class="admin-automation-title">Overdue activity reminders</div>
                    <div class="admin-automation-sub">A reminder is sent after the configured activity limit plus the 45-second grace period. Turning this off stops automatic reminder delivery.</div>
                  </div>
                </div>
                <label class="admin-switch" aria-label="Enable overdue activity reminders">
                  <input id="admin-reminder" type="checkbox">
                  <span class="admin-switch-track"><span class="admin-switch-thumb"></span></span>
                </label>
              </div>
              <div class="admin-action-bar">
                <span class="admin-empty-note" id="admin-reminder-detail">Current automation state</span>
                <button class="admin-save action-button" id="admin-save-reminder" type="button"><span class="button-content">Save automation</span></button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>

    <section class="card panel-only-private" id="stats-card" data-section="stats">
      <h2>
        <span class="section-icon stats-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 19V10"></path>
            <path d="M10 19V6"></path>
            <path d="M16 19v-8"></path>
            <path d="M22 19V3"></path>
            <path d="M2.5 21h20"></path>
            <path d="M4 7l4-3 6 3 7-5"></path>
          </svg>
        </span>
        <span class="section-title"><span>Bot Statistics</span><small>System Overview</small></span>
      </h2>
      <div class="stats">
        <div class="stat"><div class="stat-label">Users (PM)</div><div class="stat-value" id="users">—</div></div>
        <div class="stat"><div class="stat-label">Groups</div><div class="stat-value" id="groups">—</div></div>
      </div>
    </section>

    <section class="card user-card panel-only-admin-verify panel-only-user" id="user-verify-card">
      <div class="user-language-switcher">
        <button class="user-language-button" id="user-language-button" type="button" aria-label="Change language" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18"></path>
            <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z"></path>
          </svg>
        </button>
        <div class="user-language-menu" id="user-language-menu" hidden>
          <button class="user-language-option active" type="button" data-user-lang="en">English</button>
          <button class="user-language-option" type="button" data-user-lang="my">Burmese</button>
          <button class="user-language-option" type="button" data-user-lang="zh">Chinese (Simplified)</button>
        </div>
      </div>
      <h2>
        <span class="section-icon stats-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3l7 3v5c0 4.6-2.8 8.2-7 10-4.2-1.8-7-5.4-7-10V6l7-3z"></path>
            <path d="M9.5 12l1.7 1.7 3.6-4"></path>
          </svg>
        </span>
        <span class="section-title"><span id="user-verify-title">Verify Your Telegram ID</span><small id="user-verify-subtitle">User Access</small></span>
      </h2>
      <p class="user-lead" id="user-verify-lead">Enter your Telegram user ID to open your group dashboard.</p>
      <div class="user-id-wrap">
        <label for="user-id-input" id="user-id-label">Telegram User ID</label>
        <input class="user-id-input" id="user-id-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Enter your Telegram ID">
        <span class="user-id-hint" id="user-id-hint">Your ID must match the Telegram account currently opening this Mini App.</span>
      </div>
      <button class="user-confirm" id="user-confirm" type="button" disabled>Confirm</button>
    </section>

    <section class="panel-only-user user-no-group-screen" id="user-no-group-screen" aria-live="polite">
      <p class="user-no-group-message" id="user-no-group-message">
        <strong>No eligible group found</strong>
        <span>Add this bot to a group, then make sure your Telegram account is a group owner or administrator. Groups where the bot is no longer available are not shown.</span>
      </p>
    </section>

    <section class="panel-only-user user-dashboard" id="user-dashboard">
      <div class="user-group-options" id="user-group-options">
        <div class="user-page-head"><div>
          <h2 class="user-page-title">Group Options</h2>
          <div class="user-page-sub">Select a group to open its dashboard.</div>
        </div></div>
        <div id="user-group-options-list"></div>
      </div>

      <div id="user-selected-dashboard" hidden>
        <div class="user-page-head">
          <div>
            <h2 class="user-page-title" id="user-selected-group-title">Group Dashboard</h2>
            <div class="user-page-sub" id="user-dashboard-sub">Live activity overview</div>
          </div>
          <div class="user-language-switcher dashboard-language-switcher">
            <button class="user-language-button" id="user-dashboard-language-button" type="button" aria-label="Change language" aria-expanded="false">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M3 12h18"></path>
                <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9S9.6 15.5 9.6 12 10.8 5.5 12 3z"></path>
              </svg>
            </button>
            <div class="user-language-menu" id="user-dashboard-language-menu" hidden>
              <button class="user-language-option active" type="button" data-user-lang="en">English</button>
              <button class="user-language-option" type="button" data-user-lang="my">Burmese</button>
              <button class="user-language-option" type="button" data-user-lang="zh">Chinese (Simplified)</button>
            </div>
          </div>
        </div>

        <div class="user-tab-shell">
          <div class="user-tab-panel active" id="user-settings-tab">
            <div class="user-dashboard-section-label">Admin Settings</div>

            <div class="user-group-box compact" id="user-group-activities-card">
              <div class="user-group-box-title" id="user-group-activities-title">Group Activities</div>
              <div class="user-group-name" id="user-warning-group-name"></div>
              <div class="user-group-metrics">
                <div class="user-live-metric">
                  <div class="user-live-label" id="user-group-member-label">Group member</div>
                  <div class="user-live-value" id="user-member-count">—</div>
                </div>
                <div class="user-live-metric">
                  <div class="user-live-label" id="user-member-active-label">Member active</div>
                  <div class="user-live-value active" id="user-active-count">—</div>
                </div>
              </div>
            </div>

            <div class="user-setting-card" id="user-settings-limits-card"></div>
            <div class="user-setting-card counts" id="user-settings-counts-card"></div>
          </div>

          <div class="user-tab-panel user-warning-tab-panel" id="user-warning-tab">
            <div class="user-dashboard-section-label warning">Warning</div>
            <div class="user-warning-feed" id="user-warning-feed"></div>
          </div>
        </div>

        <nav class="user-tabbar" aria-label="Dashboard sections">
          <button class="user-tab active" id="user-settings-tab-button" type="button">Admin Settings</button>
          <button class="user-tab" id="user-warning-tab-button" type="button">Warning</button>
        </nav>
      </div>
    </section>

    <section class="card panel-only-private panel-only-group" id="limits-card" data-section="activity">
      <h2>
        <span class="section-icon activity-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle class="clock-ring" cx="12" cy="13" r="7.5"></circle>
            <path d="M9 3h6"></path>
            <path d="M12 5.5v2"></path>
            <g class="clock-hand">
              <path d="M12 13l3-2"></path>
            </g>
          </svg>
        </span>
        <span class="section-title"><span>Activity Limits</span><small>Duration Control</small></span>
      </h2>
      <div class="section-caption" id="limits-scope"></div>
      <div class="rows">
        <div class="row"><div><label for="limit-eat">Eat</label><span class="hint">minutes</span></div><input id="limit-eat" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="limit-wc">WC</label><span class="hint">minutes</span></div><input id="limit-wc" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="limit-smoke">Smoke</label><span class="hint">minutes</span></div><input id="limit-smoke" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="limit-wcd">WCD</label><span class="hint">minutes</span></div><input id="limit-wcd" type="number" min="1" step="1"></div>
      </div>
      <div class="actions">
        <button class="save save-limits action-button" id="save-limits" type="button">
          <span class="button-content"><span>Save Limits</span></span>
        </button>
        <span class="success-badge" id="success-limits" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"></path></svg>
          Successfully saved
        </span>
      </div>
    </section>

    <section class="card panel-only-private panel-only-group" id="counts-card" data-section="counts">
      <h2>
        <span class="section-icon counts-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 21h16"></path>
            <rect class="count-bar count-bar-1" x="5" y="13" width="3" height="5" rx="1.5" fill="currentColor" stroke="none"></rect>
            <rect class="count-bar count-bar-2" x="10.5" y="9" width="3" height="9" rx="1.5" fill="currentColor" stroke="none"></rect>
            <rect class="count-bar count-bar-3" x="16" y="5" width="3" height="13" rx="1.5" fill="currentColor" stroke="none"></rect>
            <path class="count-trend" d="M4.5 10l3.5-3 4 2 4-4 4.5 1"></path>
          </svg>
        </span>
        <span class="section-title"><span>Daily Count Limits</span><small>Daily Usage Control</small></span>
      </h2>
      <div class="section-caption">Set how many times each activity can be used in one day.</div>
      <div class="rows">
        <div class="row"><div><label for="count-eat">Eat</label><span class="hint">unlimited by default</span></div><input id="count-eat" type="number" min="1" step="1" disabled></div>
        <div class="row"><div><label for="count-wc">WC</label><span class="hint">times per day</span></div><input id="count-wc" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="count-smoke">Smoke</label><span class="hint">times per day</span></div><input id="count-smoke" type="number" min="1" step="1"></div>
        <div class="row"><div><label for="count-wcd">WCD</label><span class="hint">times per day</span></div><input id="count-wcd" type="number" min="1" step="1"></div>
      </div>
      <div class="actions">
        <button class="save save-counts action-button" id="save-counts" type="button">
          <span class="button-content"><span>Save Count Limits</span></span>
        </button>
        <span class="success-badge" id="success-counts" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"></path></svg>
          Successfully saved
        </span>
      </div>
    </section>

    <section class="card panel-only-private" id="reminder-card" data-section="reminder">
      <h2>
        <span class="section-icon reminder-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path class="ring-wave ring-wave-1" d="M4 8.5L2.7 7.2"></path>
            <path class="ring-wave ring-wave-2" d="M20 8.5l1.3-1.3"></path>
            <g class="bell-shape">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
              <path d="M10 21h4"></path>
            </g>
          </svg>
        </span>
        <span class="section-title"><span>Overdue Reminder</span><small>Automatic Notification</small></span>
      </h2>
      <div class="toggle">
        <div class="toggle-copy">
          <label for="reminder">Reminder</label>
          <span class="hint">45-second grace period</span>
        </div>
        <label class="switch" aria-label="Enable overdue reminder">
          <input id="reminder" type="checkbox">
          <span class="switch-track"><span class="switch-thumb"></span></span>
        </label>
      </div>
      <div class="actions">
        <button class="save save-reminder action-button" id="save-reminder" type="button">
          <span class="button-content"><span>Save Reminder</span></span>
        </button>
        <span class="success-badge" id="success-reminder" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"></path></svg>
          Successfully saved
        </span>
      </div>
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
      var userMode = false;
      var adminMode = false;
      var adminVerificationMode = false;
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
      var userDashboardRefreshTimer = null;

      var userUiText = {
        en: {
          title: "User Dashboard",
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
          warning: "Warning",
          groupOptions: "Group Options",
          groupOptionsSub: "Select a group to open its dashboard.",
          dashboardSub: "Live activity overview",
          groupActivities: "Group Activities",
          groupMember: "Group member",
          memberActive: "Member active",
          noWarnings: "No warning messages yet.",
          saveLimits: "Save Limits",
          saveCountLimits: "Save Count Limits",
          activityLimits: "Activity Limits",
          durationControl: "Duration Control",
          dailyCountLimits: "Daily Count Limits",
          dailyUsageControl: "Daily Usage Control",
          warningTitle: "⚠ Activity Warning",
          warningStatus: "Single activity exceeded time limit",
          status: "Status",
          overtime: "Overtime",
          user: "User",
          activity: "Activity",
          group: "Group",
          activityEat: "Eat",
          activityWc: "WC",
          activitySmoke: "Smoke",
          activityWcd: "WCD",
          switch: "Switch",
          noGroup: "No eligible group found",
          noGroupLead: "Add this bot to a group, then make sure your Telegram account is a group owner or administrator.",
          noGroupTail: "Groups where the bot is no longer available are not shown.",
          noGroupMessage: "Add this bot to a group, then make sure your Telegram account is a group owner or administrator. Groups where the bot is no longer available are not shown.",
          idMismatch: "The entered ID does not match your Telegram account."
        },
        my: {
          title: "User Dashboard",
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
          warning: "Warning",
          groupOptions: "Group Options",
          groupOptionsSub: "Dashboard ဖွင့်ရန် Group တစ်ခုကိုရွေးပါ။",
          dashboardSub: "Live activity overview",
          groupActivities: "Group Activities",
          groupMember: "Group member",
          memberActive: "Member active",
          noWarnings: "Warning message မရှိသေးပါ။",
          saveLimits: "Limits သိမ်းမည်",
          saveCountLimits: "Count Limits သိမ်းမည်",
          activityLimits: "Activity Limits",
          durationControl: "Duration Control",
          dailyCountLimits: "Daily Count Limits",
          dailyUsageControl: "Daily Usage Control",
          warningTitle: "⚠ Activity Warning",
          warningStatus: "Activity တစ်ခု၏ သတ်မှတ်ချိန် ကျော်လွန်ခဲ့သည်",
          status: "အခြေအနေ",
          overtime: "Overtime",
          user: "User",
          activity: "Activity",
          group: "Group",
          activityEat: "ထမင်းစား",
          activityWc: "အိမ်သာ",
          activitySmoke: "ဆေးလိပ်",
          activityWcd: "WCD",
          switch: "ပြောင်းမည်",
          noGroup: "သင့်အတွက် အသုံးပြုနိုင်သော Group မရှိပါ",
          noGroupLead: "Bot ကို Group တစ်ခုထဲသို့ ထည့်ပြီး သင့် Telegram account ကို Group owner သို့မဟုတ် administrator ဖြစ်ကြောင်း သေချာပါစေ။",
          noGroupTail: "Bot မရှိတော့သော Group များကို မပြပါ။",
          noGroupMessage: "Bot ကို Group တစ်ခုထဲသို့ ထည့်ပြီး သင့် Telegram account ကို Group owner သို့မဟုတ် administrator ဖြစ်ကြောင်း သေချာပါစေ။ Bot မရှိတော့သော Group များကို မပြပါ။",
          idMismatch: "ထည့်ထားသော ID သည် သင့် Telegram account နှင့် မကိုက်ညီပါ။"
        },
        zh: {
          title: "用户仪表板",
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
          warning: "警告",
          groupOptions: "群组选择",
          groupOptionsSub: "选择一个群组以打开其仪表板。",
          dashboardSub: "实时活动概览",
          groupActivities: "群组活动",
          groupMember: "群组成员",
          memberActive: "活跃成员",
          noWarnings: "暂无警告消息。",
          saveLimits: "保存时间限制",
          saveCountLimits: "保存次数限制",
          activityLimits: "活动时间限制",
          durationControl: "时长控制",
          dailyCountLimits: "每日次数限制",
          dailyUsageControl: "每日使用控制",
          warningTitle: "⚠ 活动警告",
          warningStatus: "单次活动超过时间限制",
          status: "状态",
          overtime: "超时时长",
          user: "用户",
          activity: "活动",
          group: "群组",
          activityEat: "吃饭",
          activityWc: "上厕所",
          activitySmoke: "抽烟",
          activityWcd: "大号",
          switch: "切换",
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
        document.getElementById("user-settings-tab-button").textContent = tUser("settings");
        document.getElementById("user-warning-tab-button").textContent = tUser("warning");
        document.getElementById("user-group-activities-title").textContent = tUser("groupActivities");
        document.getElementById("user-group-member-label").textContent = tUser("groupMember");
        document.getElementById("user-member-active-label").textContent = tUser("memberActive");
        var warningEmpty = document.getElementById("user-warning-feed").querySelector(".user-warning-empty");
        if (warningEmpty) warningEmpty.textContent = tUser("noWarnings");
        document.querySelector("#user-group-options .user-page-title").textContent = tUser("groupOptions");
        document.querySelector("#user-group-options .user-page-sub").textContent = tUser("groupOptionsSub");
        document.getElementById("user-dashboard-sub").textContent = tUser("dashboardSub");
        document.getElementById("user-no-group-message").innerHTML =
          '<strong>' + escapeHtml(tUser("noGroup")) + '</strong>' +
          '<span>' + escapeHtml(tUser("noGroupLead")) + ' ' + escapeHtml(tUser("noGroupTail")) + '</span>';
        document.querySelectorAll(".user-language-option").forEach(function(option) {
          option.classList.toggle("active", option.getAttribute("data-user-lang") === userLanguage);
        });
      }

      loadUserLanguage();

      function startUserDashboardRefresh() {
        if (userDashboardRefreshTimer) return;
        userDashboardRefreshTimer = window.setInterval(function () {
          if (!userMode || !getVerifiedUserId()) return;
          loadUserDashboard(false, window.__z28SelectedGroupId).catch(function () {
            // Keep the current dashboard visible if a background refresh temporarily fails.
          });
        }, 2000);
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
        var overall = document.getElementById("health-overall");
        var uptime = document.getElementById("health-uptime");
        var memory = document.getElementById("health-memory");
        var checked = document.getElementById("health-checked-at");
        if (overall) overall.innerHTML = '<span class="admin-health-status ' + (data.status === "healthy" ? "healthy" : "degraded") + '">' + escapeHtml(data.status === "healthy" ? "Healthy" : "Degraded") + '</span>';
        if (uptime) uptime.textContent = formatHealthUptime(data.uptimeSeconds);
        if (memory) memory.textContent = String(data.memory && data.memory.heapUsedMb || 0) + " MB heap";
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

      async function sendAdminBroadcast() {
        var messageBox = document.getElementById("admin-broadcast-message");
        var button = document.getElementById("admin-broadcast-send");
        var resultBox = document.getElementById("admin-broadcast-result");
        if (!messageBox || !button || !resultBox) return;
        var message = messageBox.value.trim();
        if (!message) throw new Error("Please enter an announcement.");
        button.disabled = true;
        button.textContent = "Sending…";
        resultBox.style.display = "none";
        try {
          var headers = new Headers();
          headers.set("X-Telegram-Init-Data", initData);
          headers.set("Content-Type", "application/json");
          headers.set("Accept", "application/json");
          var response = await fetch("/api/admin/broadcast", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ message: message })
          });
          var data = await response.json().catch(function(){ return {}; });
          if (!response.ok) throw new Error(data.error || "Broadcast failed.");
          resultBox.textContent = "Completed: " + String(data.sent || 0) + " sent, " + String(data.failed || 0) + " failed, " + String(data.total || 0) + " total.";
          resultBox.style.display = "block";
          showNotice("Broadcast completed.", "ok");
        } finally {
          button.disabled = false;
          button.textContent = "Send announcement";
        }
      }

      async function loadAdminHealth() {
        var data = await api("/health");
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
      function startAdminDashboardRefresh() {
        if (adminRefreshTimer) return;
        adminRefreshTimer = window.setInterval(function () {
          if (!adminMode) return;
          load().catch(function () {
            // Keep the dashboard visible if a background refresh is temporarily unavailable.
          });
        }, 15000);
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
        document.getElementById("switch-group").hidden = true;
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
        window.clearTimeout(showUserNoGroupScreen.timer);
        document.getElementById("user-no-group-screen").classList.remove("visible");
        clearUserDashboard();
        document.body.classList.remove("user-no-group-page", "user-dashboard-page");
        document.body.classList.add("user-verification-page");
        document.getElementById("user-id-input").value = "";
        document.getElementById("user-confirm").disabled = true;
        document.getElementById("user-confirm").classList.remove("ready");
        document.getElementById("user-confirm").textContent = tUser("confirm");
        document.getElementById("user-verify-card").classList.add("visible");
        title.textContent = tUser("verifySubtitle");
      }

      function showUserNoGroupScreen() {
        window.clearTimeout(showUserNoGroupScreen.timer);
        document.getElementById("user-verify-card").classList.remove("visible");
        clearUserDashboard();
        document.body.classList.remove("user-verification-page", "user-dashboard-page");
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

      function formatWarningTime(value) {
        try { return new Intl.DateTimeFormat("en-GB",{month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(value)); }
        catch { return ""; }
      }

      function settingEditorMarkup(type, values, groupId) {
        var isCount = type === "count";
        var rows = isCount ? [["wc","WC",values.wc],["smoke","Smoke",values.smoke],["wcd","WCD",values.wcd]]
          : [["eat","Eat",values.eat],["wc","WC",values.wc],["smoke","Smoke",values.smoke],["wcd","WCD",values.wcd]];
        var inputs = rows.map(function(item) {
          return '<div class="editor-row"><label>' + item[1] + '</label><input data-kind="' + item[0] +
            '" type="number" min="1" step="1" value="' + escapeHtml(String(item[2])) + '"></div>';
        }).join("");
        var titleText = isCount ? tUser("dailyCountLimits") : tUser("activityLimits");
        var subText = isCount ? tUser("dailyUsageControl") : tUser("durationControl");
        var icon = isCount
          ? '<svg viewBox="0 0 24 24"><path d="M4 21h16"></path><rect class="count-bar count-bar-1" x="5" y="13" width="3" height="5" rx="1.5" fill="currentColor" stroke="none"></rect><rect class="count-bar count-bar-2" x="10.5" y="9" width="3" height="9" rx="1.5" fill="currentColor" stroke="none"></rect><rect class="count-bar count-bar-3" x="16" y="5" width="3" height="13" rx="1.5" fill="currentColor" stroke="none"></rect></svg>'
          : '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"></circle><path d="M9 3h6"></path><path d="M12 5.5v2"></path><g class="clock-hand"><path d="M12 13l3-2"></path></g></svg>';
        return '<div class="user-setting-head"><span class="user-setting-icon">' + icon + '</span><div><div class="user-setting-title">' +
          titleText + '</div><div class="user-setting-sub">' + subText + '</div></div></div>' +
          '<div class="user-setting-editor">' + inputs + '<button class="user-setting-save" data-setting-type="' + type +
          '" data-group-id="' + groupId + '" type="button">' + (isCount ? escapeHtml(tUser("saveCountLimits")) : escapeHtml(tUser("saveLimits"))) + '</button></div>';
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

      function formatWarningDuration(seconds) {
        var total = Number(seconds);
        if (!Number.isFinite(total) || total < 0) return "—";
        total = Math.floor(total);
        var minutes = Math.floor(total / 60);
        var remainder = total % 60;
        return String(minutes).padStart(2, "0") + "m " + String(remainder).padStart(2, "0") + "s";
      }

      function getUserActivityLabel(kind) {
        var labels = {
          eat: tUser("activityEat"),
          wc: tUser("activityWc"),
          smoke: tUser("activitySmoke"),
          wcd: tUser("activityWcd")
        };
        return labels[kind] || String(kind || "—");
      }

      function renderWarnings(warnings, group) {
        var feed = document.getElementById("user-warning-feed");
        if (!feed) return;
        if (!warnings || !warnings.length) {
          feed.innerHTML = '<div class="user-warning-empty">' + escapeHtml(tUser("noWarnings")) + '</div>';
          return;
        }
        var groupName = group && group.title ? String(group.title) : "—";
        var groupId = group && group.id !== undefined ? String(group.id) : "";
        feed.innerHTML = warnings.map(function(warning) {
          var displayName = String(warning.displayName || "—");
          var userId = warning.userId !== undefined ? String(warning.userId) : "";
          var activity = getUserActivityLabel(warning.kind);
          var createdAt = formatWarningTime(warning.createdAt);
          var overtime = formatWarningDuration(warning.timeoutSeconds);
          return '<article class="user-warning-item">' +
            '<div class="user-warning-item-head">' +
              '<div class="user-warning-item-title"><span class="warning-symbol" aria-hidden="true">⚠</span><span>' +
                escapeHtml(tUser("warningTitle").replace(/^⚠\\s*/, "")) + '</span></div>' +
              '<span class="user-warning-item-time">' + escapeHtml(createdAt) + '</span>' +
            '</div>' +
            '<div class="user-warning-details">' +
              '<div class="user-warning-detail"><span class="user-warning-detail-label">' + escapeHtml(tUser("group")) + '</span><strong class="user-warning-detail-value">' +
                escapeHtml(groupName) + (groupId ? '<span class="warning-meta">ID: ' + escapeHtml(groupId) + '</span>' : '') + '</strong></div>' +
              '<div class="user-warning-detail"><span class="user-warning-detail-label">' + escapeHtml(tUser("user")) + '</span><strong class="user-warning-detail-value">' +
                escapeHtml(displayName) + (userId ? '<span class="warning-meta">ID: ' + escapeHtml(userId) + '</span>' : '') + '</strong></div>' +
              '<div class="user-warning-detail"><span class="user-warning-detail-label">' + escapeHtml(tUser("activity")) + '</span><strong class="user-warning-detail-value">' +
                escapeHtml(activity) + '</strong></div>' +
              '<div class="user-warning-detail"><span class="user-warning-detail-label">' + escapeHtml(tUser("status")) + '</span><strong class="user-warning-detail-value">' +
                escapeHtml(tUser("warningStatus")) + '</strong></div>' +
              '<div class="user-warning-detail overtime"><span class="user-warning-detail-label">' + escapeHtml(tUser("overtime")) + '</span><strong class="user-warning-detail-value">' +
                escapeHtml(overtime) + '</strong></div>' +
            '</div>' +
          '</article>';
        }).join("");
      }

      function renderSelectedDashboard(data) {
        var group = data.selectedGroup;
        if (!group) return;
        window.__z28SelectedGroupId = group.id;
        document.getElementById("user-group-options").hidden = true;
        document.getElementById("user-selected-dashboard").hidden = false;
        title.textContent = tUser("title");
        document.getElementById("switch-group").hidden = false;
        document.getElementById("switch-group").textContent = tUser("switch");
        document.getElementById("user-selected-group-title").textContent = group.title + " " + tUser("title");
        document.getElementById("user-warning-group-name").textContent = group.title;
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

        renderWarnings(data.warnings || [], group);
        bindUserSettingButtons();
      }

      function renderUserDashboard(data) {
        var dashboard = document.getElementById("user-dashboard");
        dashboard.classList.add("visible");
        if (!data.groups || !data.groups.length) return;
        if (data.selectionRequired) {
          document.getElementById("user-group-options").hidden = false;
          document.getElementById("user-selected-dashboard").hidden = true;
          document.getElementById("switch-group").hidden = true;
          title.textContent = tUser("groupOptions");
          renderGroupOptions(data.groups);
          return;
        }
        renderSelectedDashboard(data);
      }

      async function selectUserGroup(groupId) {
        await loadUserDashboard(true, groupId);
      }

      function bindUserSettingButtons() {
        document.querySelectorAll(".user-setting-save").forEach(function(button) {
          button.onclick = async function() {
            var type = button.getAttribute("data-setting-type");
            var groupId = Number(button.getAttribute("data-group-id"));
            var card = button.closest(".user-setting-card");
            var inputs = card.querySelectorAll("input");
            var original = button.textContent;
            button.disabled = true;
            button.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Saving…';
            try {
              for (var i=0;i<inputs.length;i+=1) {
                var value = Number(inputs[i].value);
                var kind = inputs[i].getAttribute("data-kind");
                if (!Number.isSafeInteger(value) || value <= 0) throw new Error("Enter positive integers for all settings.");
                await apiUserSettings(groupId, type, kind, value);
              }
              button.innerHTML = "✓ Successfully";
              window.setTimeout(function(){ button.textContent = original; button.disabled=false; },1500);
              await loadUserDashboard(false, groupId);
            } catch(error) {
              button.disabled=false; button.textContent=original;
              showNotice(error && error.message ? error.message : "Save failed.","error");
            }
          };
        });
      }

      async function apiUserMode() {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");

        var response = await fetch("/api/user/mode", {
          method: "GET",
          headers: headers
        });
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
        var showLoader = withLoading !== false;
        if (showLoader) showUserLoading(true);
        try {
          var data = await apiUserDashboard(telegramUserId,groupId);
          if (!data.hasGroups) {
            showUserNoGroupScreen();
            return false;
          }
          rememberVerifiedUserId(telegramUserId);
          document.body.classList.remove("user-verification-page");
          document.body.classList.add("user-dashboard-page");
          document.getElementById("user-verify-card").classList.remove("visible");
          renderUserDashboard(data);
          return true;
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

      document.getElementById("switch-group").addEventListener("click", function() {
        var button=document.getElementById("switch-group");
        button.disabled=true;
        apiUserDashboard(telegramUserId).then(function(data){
          document.getElementById("user-group-options").hidden=false;
          document.getElementById("user-selected-dashboard").hidden=true;
          button.hidden=true;
          title.textContent = tUser("groupOptions");
          renderGroupOptions(data.groups || []);
        }).catch(function(error){
          showNotice(error && error.message ? error.message : "Unable to load groups.","error");
        }).finally(function(){button.disabled=false;});
      });

      function activateUserTab(tab) {
        var settings = tab === "settings";
        document.getElementById("user-settings-tab").classList.toggle("active", settings);
        document.getElementById("user-warning-tab").classList.toggle("active", !settings);
        document.getElementById("user-settings-tab-button").classList.toggle("active", settings);
        document.getElementById("user-warning-tab-button").classList.toggle("active", !settings);
      }

      activateUserTab("settings");

      document.getElementById("user-settings-tab-button").addEventListener("click", function () {
        activateUserTab("settings");
      });

      document.getElementById("user-warning-tab-button").addEventListener("click", function () {
        activateUserTab("warning");
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
          userLanguage = selected;
          try { localStorage.setItem(userLanguageKey, userLanguage); } catch {}
          document.querySelectorAll(".user-language-menu").forEach(function(menu) {
            menu.hidden = true;
          });
          document.querySelectorAll(".user-language-button").forEach(function(button) {
            button.setAttribute("aria-expanded", "false");
          });
          applyUserLanguage();
          if (userMode && document.body.classList.contains("user-dashboard-page") && window.__z28SelectedGroupId) {
            loadUserDashboard(false, window.__z28SelectedGroupId).catch(function () {});
          }
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
        if (groupMode) {
          setPanelVisibility("group");
          title.textContent = "⚙️ Group Admin Panel";
          await load();
          return;
        }

        try {
          var modeData = await apiUserMode();
          if (modeData.isConfiguredAdmin) {
            var storedAdminId = getVerifiedAdminId();
            var currentAdminId = telegramUserId ? String(telegramUserId) : "";
            if (storedAdminId && currentAdminId && storedAdminId === currentAdminId) {
              setPanelVisibility("admin");
              title.textContent = "Administration";
              await load();
              hideSplash();
              startAdminDashboardRefresh();
            } else {
              setPanelVisibility("admin-verify");
              showAdminVerificationPage();
              hideSplash();
            }
          } else {
            setPanelVisibility("user");
            title.textContent = telegramUserId ? String(telegramUserId) + " " + tUser("title") : tUser("title");
            var stored = getVerifiedUserId();
            var current = telegramUserId ? String(telegramUserId) : "";
            if (stored && current && stored === current) {
              await loadUserDashboard();
            } else {
              showUserVerificationPage();
            }
            hideSplash();
            startUserDashboardRefresh();
          }
        } catch (error) {
          setPanelVisibility("user");
          showUserVerificationPage();
          title.textContent = "User Access";
          hideSplash();
          showNotice(error && error.message ? error.message : "Unable to open the user dashboard.", "error");
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

      var broadcastMessage = document.getElementById("admin-broadcast-message");
      var broadcastCount = document.getElementById("admin-broadcast-count");
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

      loadUserLanguage();
      applyUserLanguage();
      initializeMode();
    })();
  </script>
</body>
</html>`;