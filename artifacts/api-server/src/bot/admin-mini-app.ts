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

    .panel-only-user { display: none; }

    .user-mode {
      background: linear-gradient(145deg, #f7fbff 0%, #edf5ff 52%, #f8fbff 100%);
      color: #132238;
    }

    .user-mode h1 {
      color: #0d2542;
      background: none;
      -webkit-text-fill-color: initial;
      animation: none;
      font-size: clamp(26px, 7vw, 34px);
    }

    .user-mode .sub { color: #6f8299; }
    .user-mode .refresh {
      background: #2563eb;
      border-color: rgba(37,99,235,.16);
      box-shadow: 0 8px 22px rgba(37,99,235,.18);
    }

    .user-card {
      background: rgba(255,255,255,.90);
      border: 1px solid rgba(105,145,185,.20);
      border-radius: 24px;
      box-shadow: 0 18px 45px rgba(62,91,126,.13);
    }

    .user-card::before { display: none; }

    .user-lead {
      margin: 0 0 15px;
      color: #6b8098;
      font-size: 13px;
    }

    .user-id-wrap { display: grid; gap: 8px; }

    .user-id-input {
      width: 100%;
      min-height: 50px;
      padding: 11px 14px;
      border-radius: 14px;
      border: 1px solid #c8d8e8;
      background: #fff;
      color: #122843;
      font-size: 17px;
      outline: none;
    }

    .user-id-input:focus {
      border-color: #5e98ed;
      box-shadow: 0 0 0 4px rgba(37,99,235,.10);
    }

    .user-id-hint {
      color: #7a8ea4;
      font-size: 11px;
    }

    .user-confirm {
      width: 100%;
      min-height: 48px;
      margin-top: 14px;
      border: 0;
      border-radius: 14px;
      background: #aebdce;
      color: #fff;
      font-weight: 800;
      box-shadow: none;
      transition: background .2s ease, box-shadow .2s ease;
    }

    .user-confirm.ready {
      background: linear-gradient(180deg,#2f80ed,#2563eb);
      box-shadow: 0 10px 24px rgba(37,99,235,.20);
      cursor: pointer;
    }

    .user-dashboard { display: none; }
    .user-dashboard.visible { display: block; }

    .user-dashboard-head {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      margin-bottom:14px;
    }

    .user-dashboard-title {
      margin:0;
      color:#102b4b;
      font-size:20px;
      font-weight:850;
    }

    .user-dashboard-count {
      padding:7px 10px;
      border-radius:999px;
      background:#e7f0ff;
      color:#2d6fd6;
      font-size:11px;
      font-weight:800;
    }

    .user-empty {
      padding:26px 18px;
      text-align:center;
      border-radius:18px;
      border:1px dashed #c5d5e5;
      background:rgba(247,251,255,.9);
    }

    .user-empty-icon {
      width:52px;
      height:52px;
      margin:0 auto 12px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:17px;
      background:#e9f2ff;
      color:#4f82ce;
    }

    .user-empty-icon svg {
      width:26px;
      height:26px;
      fill:none;
      stroke:currentColor;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    .user-empty strong {
      display:block;
      margin-bottom:5px;
      color:#16304e;
      font-size:16px;
    }

    .user-empty p {
      margin:0 auto;
      max-width:430px;
      color:#71869b;
      font-size:12px;
      line-height:1.65;
    }

    .user-group-list { display:grid; gap:12px; }

    .user-group {
      padding:15px;
      border-radius:18px;
      border:1px solid #d8e3ef;
      background:rgba(255,255,255,.92);
      box-shadow:0 9px 24px rgba(68,97,129,.08);
    }

    .user-group-head {
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:12px;
    }

    .user-group-name { color:#173657; font-weight:800; }

    .user-group-meta {
      margin-top:3px;
      color:#7b8fa5;
      font-size:11px;
    }

    .user-status {
      padding:6px 9px;
      border-radius:999px;
      background:#e9f8f1;
      color:#198754;
      font-size:10px;
      font-weight:800;
      text-transform:uppercase;
      letter-spacing:.04em;
    }

    .user-metrics {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:8px;
      margin-top:13px;
    }

    .user-metric {
      padding:10px;
      border-radius:13px;
      background:#f5f9fd;
      border:1px solid #e5edf5;
    }

    .user-metric-label { color:#7c91a7; font-size:10px; }
    .user-metric-value { margin-top:2px; color:#193a5f; font-size:17px; font-weight:850; }

    .user-active {
      margin-top:10px;
      padding:9px 11px;
      border-radius:12px;
      background:#fff8e7;
      color:#8b6a1d;
      font-size:11px;
      font-weight:700;
    }

    .user-connection { margin-top:10px; color:#71869b; font-size:10px; }

    .user-loading {
      position:fixed;
      inset:0;
      z-index:10000;
      display:none;
      align-items:center;
      justify-content:center;
      background:rgba(247,251,255,.78);
      backdrop-filter:blur(8px);
      -webkit-backdrop-filter:blur(8px);
    }

    .user-loading.visible { display:flex; }

    .user-loader {
      width:48px;
      height:48px;
      border-radius:50%;
      border:4px solid #dbe8f8;
      border-top-color:#2563eb;
      animation:userSpin .8s linear infinite;
      box-shadow:0 0 22px rgba(37,99,235,.13);
    }

    @keyframes userSpin { to { transform:rotate(360deg); } }

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
      <button class="refresh action-button" id="refresh" type="button">
        <span class="button-content"><span>Refresh</span></span>
      </button>
    </div>

    <div id="notice" class="notice" role="status" aria-live="polite"></div>

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

    <section class="card user-card panel-only-user" id="user-verify-card">
      <h2>
        <span class="section-icon stats-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3l7 3v5c0 4.6-2.8 8.2-7 10-4.2-1.8-7-5.4-7-10V6l7-3z"></path>
            <path d="M9.5 12l1.7 1.7 3.6-4"></path>
          </svg>
        </span>
        <span class="section-title"><span>Verify Your Telegram ID</span><small>User Access</small></span>
      </h2>
      <p class="user-lead">Enter your Telegram user ID to open the groups where you are a group owner or administrator.</p>
      <div class="user-id-wrap">
        <label for="user-id-input">Telegram User ID</label>
        <input class="user-id-input" id="user-id-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Enter your Telegram ID">
        <span class="user-id-hint">Your ID must match the Telegram account currently opening this Mini App.</span>
      </div>
      <button class="user-confirm" id="user-confirm" type="button" disabled>Confirm</button>
    </section>

    <section class="user-dashboard panel-only-user" id="user-dashboard">
      <div class="user-dashboard-head">
        <h2 class="user-dashboard-title">Group Activities</h2>
        <span class="user-dashboard-count" id="user-group-count">0 Groups</span>
      </div>
      <div id="user-group-list" class="user-group-list"></div>
    </section>

    <section class="card" id="limits-card" data-section="activity">
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

    <section class="card" id="counts-card" data-section="counts">
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
      var apiBase = groupMode ? "/api/group-admin" : "/api/admin";
      var telegramUserId =
        tg.initDataUnsafe && tg.initDataUnsafe.user
          ? tg.initDataUnsafe.user.id
          : undefined;
      var userLoading = document.getElementById("user-loading");
      var userVerifiedKey = "z28_verified_user_id";

      function setPanelVisibility(mode) {
        userMode = mode === "user";
        adminMode = mode === "admin";
        document.body.classList.toggle("user-mode", userMode);

        document.querySelectorAll(".panel-only-group").forEach(function (element) {
          element.classList.toggle("visible", mode === "group");
        });
        document.querySelectorAll(".panel-only-private").forEach(function (element) {
          element.classList.toggle("visible", mode === "admin");
        });
        document.querySelectorAll(".panel-only-user").forEach(function (element) {
          element.classList.toggle("visible", mode === "user");
        });
      }

      setPanelVisibility(groupMode ? "group" : "admin");
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

      function clearUserDashboard() {
        document.getElementById("user-dashboard").classList.remove("visible");
        document.getElementById("user-group-list").innerHTML = "";
        document.getElementById("user-group-count").textContent = "0 Groups";
      }

      function renderUserDashboard(data) {
        var dashboard = document.getElementById("user-dashboard");
        var list = document.getElementById("user-group-list");
        var count = document.getElementById("user-group-count");
        var groups = Array.isArray(data.groups) ? data.groups : [];

        dashboard.classList.add("visible");
        count.textContent = groups.length + (groups.length === 1 ? " Group" : " Groups");

        if (!groups.length) {
          list.innerHTML =
            '<div class="user-empty">' +
              '<div class="user-empty-icon">' +
                '<svg viewBox="0 0 24 24"><path d="M7 20h10"></path><path d="M5 20v-7a7 7 0 0 1 14 0v7"></path><path d="M3 20h18"></path><path d="M9 16h6"></path></svg>' +
              '</div>' +
              '<strong>No eligible group found</strong>' +
              '<p>Add this bot to a group, then make sure your Telegram account is a group owner or administrator. Groups where the bot is no longer available are not shown.</p>' +
            '</div>';
          return;
        }

        list.innerHTML = groups.map(function (group) {
          var role = group.memberStatus === "creator" ? "Owner" : "Admin";
          var target = group.connectedTarget
            ? escapeHtml(group.connectedTarget.name)
            : "Not connected";
          var active = group.activeCount > 0
            ? '<div class="user-active">' + group.activeCount + ' active ' + (group.activeCount === 1 ? 'activity' : 'activities') + ' right now.</div>'
            : "";
          return (
            '<article class="user-group">' +
              '<div class="user-group-head">' +
                '<div>' +
                  '<div class="user-group-name">' + escapeHtml(group.title) + '</div>' +
                  '<div class="user-group-meta">' + escapeHtml(String(group.id)) + ' · ' + role + '</div>' +
                '</div>' +
                '<span class="user-status">' + role + '</span>' +
              '</div>' +
              '<div class="user-metrics">' +
                '<div class="user-metric"><div class="user-metric-label">Today</div><div class="user-metric-value">' + String(group.today.total) + '</div></div>' +
                '<div class="user-metric"><div class="user-metric-label">WC</div><div class="user-metric-value">' + String(group.today.wc) + '</div></div>' +
                '<div class="user-metric"><div class="user-metric-label">Smoke</div><div class="user-metric-value">' + String(group.today.smoke) + '</div></div>' +
              '</div>' +
              active +
              '<div class="user-connection">Notification target: ' + target + '</div>' +
            '</article>'
          );
        }).join("");
      }

      async function apiUserMode() {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");
        var response = await fetch("/api/user/mode", { headers: headers });
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "Unable to identify access mode.");
        }
        return data;
      }

      async function apiUserDashboard(userId) {
        var headers = new Headers();
        headers.set("X-Telegram-Init-Data", initData);
        headers.set("Accept", "application/json");
        var response = await fetch("/api/user/dashboard", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ userId: Number(userId) })
        });
        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "Unable to load your dashboard.");
        }
        return data;
      }

      async function loadUserDashboard() {
        if (!telegramUserId) {
          throw new Error("Unable to identify your Telegram account.");
        }
        showUserLoading(true);
        try {
          var data = await apiUserDashboard(telegramUserId);
          rememberVerifiedUserId(telegramUserId);
          document.getElementById("user-verify-card").classList.remove("visible");
          renderUserDashboard(data);
          return true;
        } finally {
          showUserLoading(false);
        }
      }

      async function load() {
        if (userMode) {
          var storedUserId = getVerifiedUserId();
          var currentUserId = telegramUserId ? String(telegramUserId) : "";
          if (storedUserId && currentUserId && storedUserId === currentUserId) {
            try {
              await loadUserDashboard();
            } catch (error) {
              document.getElementById("user-verify-card").classList.add("visible");
              showNotice(error && error.message ? error.message : "Unable to load your dashboard.", "error");
            }
          } else {
            document.getElementById("user-verify-card").classList.add("visible");
            clearUserDashboard();
          }
          hideSplash();
          return;
        }

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

      document.getElementById("refresh").addEventListener("click", function () {
        var button = document.getElementById("refresh");
        runAction(
          button,
          "Refreshing…",
          async function () {
            if (userMode) {
              var verified = getVerifiedUserId();
              if (verified) {
                await loadUserDashboard();
              } else {
                clearUserDashboard();
                document.getElementById("user-verify-card").classList.add("visible");
              }
            } else {
              await load();
            }
          },
          "Refresh"
        ).catch(function (error) {
          showNotice(error && error.message ? error.message : "Refresh failed.", "error");
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
            showNotice("The entered ID does not match your Telegram account.", "error");
            return;
          }

          userConfirm.disabled = true;
          userConfirm.classList.remove("ready");
          try {
            await loadUserDashboard();
            userConfirm.innerHTML = "Confirmed";
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
            setPanelVisibility("admin");
            title.textContent = "⚙️ Admin Panel";
            await load();
          } else {
            setPanelVisibility("user");
            title.textContent = "User Dashboard";
            var stored = getVerifiedUserId();
            var current = telegramUserId ? String(telegramUserId) : "";
            if (stored && current && stored === current) {
              await loadUserDashboard();
            } else {
              document.getElementById("user-verify-card").classList.add("visible");
              clearUserDashboard();
            }
            hideSplash();
          }
        } catch (error) {
          setPanelVisibility("user");
          title.textContent = "User Dashboard";
          document.getElementById("user-verify-card").classList.add("visible");
          clearUserDashboard();
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

      initializeMode();
    })();
  </script>
</body>
</html>`;