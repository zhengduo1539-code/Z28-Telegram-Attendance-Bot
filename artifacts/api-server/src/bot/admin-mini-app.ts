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
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      isolation: isolate;
      background:
        radial-gradient(circle at 50% 44%, rgba(34, 211, 238, 0.14), transparent 19%),
        radial-gradient(circle at 24% 28%, rgba(59, 130, 246, 0.15), transparent 27%),
        radial-gradient(circle at 78% 72%, rgba(168, 85, 247, 0.14), transparent 29%),
        linear-gradient(145deg, #02040b 0%, #061125 48%, #03050e 100%);
      transition: opacity 0.45s ease, visibility 0.45s ease;
      animation: splashAutoHide 0.45s ease 3.35s forwards;
    }

    @keyframes splashAutoHide {
      from { opacity: 1; visibility: visible; pointer-events: auto; }
      to { opacity: 0; visibility: hidden; pointer-events: none; }
    }

    #splash::before {
      content: "";
      position: absolute;
      inset: -20%;
      z-index: -2;
      opacity: 0.42;
      background:
        linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
      background-size: 34px 34px;
      transform: perspective(700px) rotateX(62deg) scale(1.7) translateY(12%);
      transform-origin: center bottom;
      mask-image: linear-gradient(to top, rgba(0,0,0,.95), transparent 76%);
      -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.95), transparent 76%);
      animation: splashGridDrift 8s linear infinite;
    }

    #splash::after {
      content: "";
      position: absolute;
      width: min(62vw, 430px);
      height: min(62vw, 430px);
      z-index: -1;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(34, 211, 238, 0.15) 0%,
        rgba(59, 130, 246, 0.08) 28%,
        rgba(168, 85, 247, 0.04) 48%,
        transparent 72%
      );
      filter: blur(8px);
      animation: splashOrbPulse 3.2s ease-in-out infinite;
    }

    #splash.hide {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .splash-subtitle {
      margin-top: 14px;
      text-align: center;
      color: rgba(148, 197, 255, 0.78);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      text-shadow: 0 0 14px rgba(96, 165, 250, 0.16);
      animation: subtitleAppear 1s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes subtitleAppear {
      from { opacity: 0; transform: translateY(5px); filter: blur(3px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    #splash-title {
      position: relative;
      margin: 0;
      padding: 0 24px;
      text-align: center;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: clamp(42px, 12vw, 68px);
      line-height: 1;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-indent: 0.12em;
      color: transparent;
      background: linear-gradient(
        110deg,
        #f8fafc 0%,
        #dbeafe 28%,
        #93c5fd 52%,
        #c4b5fd 76%,
        #f8fafc 100%
      );
      background-size: 220% auto;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow:
        0 0 18px rgba(147, 197, 253, 0.22),
        0 0 42px rgba(99, 102, 241, 0.12);
      animation: welcomeShine 4.2s ease-in-out infinite,
        welcomeAppear 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes welcomeShine {
      0%, 100% { background-position: 100% center; }
      50% { background-position: 0% center; }
    }

    @keyframes welcomeAppear {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
        letter-spacing: 0.18em;
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
        letter-spacing: 0.12em;
        filter: blur(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #splash::before,
      #splash::after,
      #splash-title,
      .splash-subtitle {
        animation: none !important;
      }
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
      padding-bottom:14px;
    }

    #user-selected-dashboard #user-dashboard-page-shell[hidden] {
      display:none !important;
    }

    #user-selected-dashboard .user-about-page[hidden] {
      display:none !important;
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
    .user-setting-view { display:grid; gap:9px; }
    .user-setting-grid {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:9px;
    }
    .user-setting-value {
      min-height:56px;
      padding:11px 12px;
      border-radius:13px;
      background:linear-gradient(145deg,rgba(255,255,255,.050),rgba(255,255,255,.012)),rgba(2,10,21,.32);
      border:1px solid rgba(213,239,255,.085);
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }
    .user-setting-value-label {
      color:#aebfd2;
      font-size:12px;
      font-weight:700;
    }
    .user-setting-value-number {
      color:#f4f8ff;
      font-size:15px;
      font-weight:800;
      white-space:nowrap;
    }
    .user-setting-edit {
      width:100%;
      min-height:42px;
      margin-top:3px;
      border:1px solid rgba(130,191,255,.24);
      border-radius:12px;
      padding:0 15px;
      background:linear-gradient(145deg,rgba(38,134,255,.12),rgba(18,79,150,.18));
      color:#a8d7ff;
      font-weight:750;
      cursor:pointer;
    }
    .user-setting-editor[hidden],
    .user-setting-view[hidden] { display:none !important; }
    .user-setting-editor { display:grid; gap:9px; }
    .user-setting-editor .editor-row {
      display:grid; grid-template-columns:minmax(0,1fr) 110px; align-items:center; gap:10px;
      padding:9px; border-radius:13px; background:rgba(2,9,20,.34); border:1px solid rgba(91,155,255,.11);
    }
    .user-setting-editor label { color:#dce8f8; font-size:12px; font-weight:750; }
    .user-setting-editor input { min-height:40px; text-align:center; }
    .user-setting-editor input.is-invalid {
      border-color:rgba(255,107,107,.72);
      box-shadow:0 0 0 2px rgba(255,107,107,.10);
    }
    .user-setting-editor-error {
      display:flex; align-items:center; gap:7px; min-height:30px; padding:7px 10px;
      border-radius:10px; background:rgba(255,107,107,.08); border:1px solid rgba(255,107,107,.16);
      color:#ffb3b3; font-size:11px; font-weight:750;
    }
    .user-setting-editor-error[hidden] { display:none !important; }
    .user-setting-editor-status {
      display:flex;
      align-items:center;
      gap:7px;
      min-height:30px;
      padding:7px 10px;
      border-radius:10px;
      background:rgba(255,185,72,.08);
      border:1px solid rgba(255,193,92,.14);
      color:#ffd78b;
      font-size:11px;
      font-weight:750;
    }
    .user-setting-editor-status[hidden] { display:none !important; }
    .user-setting-change-summary { display:flex; align-items:flex-start; gap:7px; min-height:30px; padding:7px 10px; border-radius:10px; background:rgba(72,157,255,.07); border:1px solid rgba(104,178,255,.14); color:#b9dcff; font-size:11px; font-weight:700; line-height:1.45; }
    .user-setting-change-summary[hidden] { display:none !important; }
    .user-setting-change-summary.is-error { background:rgba(255,107,107,.07); border-color:rgba(255,107,107,.18); color:#ffb8b8; }
    .user-setting-change-summary strong { color:#e9f6ff; }
    .user-setting-unsaved-dot {
      width:6px;
      height:6px;
      flex:0 0 6px;
      border-radius:50%;
      background:#ffc45f;
      box-shadow:0 0 9px rgba(255,196,95,.62);
    }
    .user-setting-editor-actions {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px;
      margin-top:3px;
    }
    .user-setting-cancel,
    .user-setting-save {
      min-height:42px;
      border:1px solid rgba(130,191,255,.32);
      border-radius:12px;
      padding:0 15px;
      font-weight:750;
      cursor:pointer;
    }
    .user-setting-cancel {
      color:#b7c8da;
      background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012));
      border-color:rgba(180,205,230,.16);
    }
    .user-setting-save {
      margin-top:0;
      background:linear-gradient(180deg,#2b8cff,#1268e6);
      color:#fff;
    }
    .user-setting-save:disabled {
      opacity:.48;
      cursor:not-allowed;
      filter:saturate(.55);
    }

    .user-dashboard-error-screen { display:none; }
    .user-dashboard-error-message { margin:0 auto; width:min(620px,calc(100% - 36px)); padding:30px 22px; text-align:center; border-radius:22px; border:1px solid rgba(255,107,107,.18); background:linear-gradient(145deg,rgba(45,13,20,.70),rgba(22,10,19,.56)); box-shadow:0 18px 42px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.03); }
    .user-dashboard-error-icon { width:48px;height:48px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid rgba(255,107,107,.32);background:rgba(255,107,107,.10);color:#ffb3b3;font-size:24px;font-weight:900; }
    .user-dashboard-error-message strong { display:block;color:#fff1f1;font-size:clamp(19px,5vw,25px);font-weight:850; }
    .user-dashboard-error-message span { display:block;margin:9px auto 0;max-width:500px;color:#d8aeb4;font-size:13px;line-height:1.7; }
    .user-dashboard-error-retry { min-height:44px;margin-top:19px;padding:0 20px;border:1px solid rgba(130,191,255,.34);border-radius:13px;background:linear-gradient(180deg,#2b8cff,#1268e6);color:#fff;font-weight:800;box-shadow:0 9px 22px rgba(18,104,230,.24);cursor:pointer; }
    .user-dashboard-error-retry:disabled { opacity:.55;cursor:default; }
    .user-mode.user-dashboard-error-page .top,.user-mode.user-dashboard-error-page #notice,.user-mode.user-dashboard-error-page .user-card#user-verify-card,.user-mode.user-dashboard-error-page .user-dashboard,.user-mode.user-dashboard-error-page .user-no-group-screen { display:none !important; }
    .user-mode.user-dashboard-error-page .wrap { min-height:calc(100vh - max(36px,env(safe-area-inset-top) + env(safe-area-inset-bottom)));display:flex;align-items:center;justify-content:center;padding:18px 0; }
    .user-mode.user-dashboard-error-page .user-dashboard-error-screen { display:flex !important;min-height:calc(100vh - max(36px,env(safe-area-inset-top) + env(safe-area-inset-bottom)));align-items:center;justify-content:center;width:100%;padding:18px 0; }
    .user-mode.user-dashboard-error-page #user-dashboard-error-screen[hidden] { display:flex !important; }

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

    .user-loading-panel {
      width:min(680px,calc(100% - 32px));
      max-height:min(78vh,760px);
      padding:18px;
      border:1px solid rgba(112,170,255,.20);
      border-radius:22px;
      background:linear-gradient(145deg,rgba(7,18,36,.94),rgba(4,12,27,.92));
      box-shadow:0 24px 70px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04);
      overflow:hidden;
    }
    .user-loading-head { display:flex; align-items:center; gap:11px; margin-bottom:16px; }
    .user-loading-mark { width:38px; height:38px; flex:0 0 38px; border-radius:12px; }
    .user-loading-title { width:150px; height:13px; border-radius:999px; }
    .user-loading-subtitle { width:105px; height:9px; margin-top:7px; border-radius:999px; }
    .user-loading-stats { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-bottom:12px; }
    .user-loading-stat { min-height:82px; padding:14px; border:1px solid rgba(91,155,255,.13); border-radius:15px; background:rgba(8,22,43,.62); }
    .user-loading-line { height:10px; border-radius:999px; }
    .user-loading-line.short { width:42%; }
    .user-loading-value { width:34%; height:24px; margin-top:12px; border-radius:8px; }
    .user-loading-card { min-height:118px; margin-top:10px; padding:15px; border:1px solid rgba(91,155,255,.13); border-radius:16px; background:rgba(8,22,43,.62); }
    .user-loading-card-head { width:38%; height:13px; margin-bottom:15px; border-radius:999px; }
    .user-loading-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
    .user-loading-field { height:43px; border-radius:11px; border:1px solid rgba(91,155,255,.10); }
    .user-loading-sheen { position:relative; overflow:hidden; background:rgba(42,78,124,.30); }
    .user-loading-sheen::after { content:""; position:absolute; inset:0; transform:translateX(-100%); background:linear-gradient(90deg,transparent,rgba(185,220,255,.13),transparent); animation:userSkeletonShimmer 1.35s ease-in-out infinite; }
    @keyframes userSkeletonShimmer { to { transform:translateX(100%); } }
    @media (max-width:520px) {
      .user-loading-panel { padding:14px; border-radius:19px; }
      .user-loading-card { min-height:108px; }
    }
    @media (prefers-reduced-motion: reduce) { .user-loading-sheen::after { animation:none !important; } }

    @media (prefers-reduced-motion: reduce) {
      .user-group-box-title::before,
      .user-setting-card .clock-hand,
      .user-setting-card .count-bar {
        animation:none !important;
      }
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


    .admin-notification-button {
      position: relative; width: 46px; height: 46px; display: inline-flex;
      align-items: center; justify-content: center; border: 1px solid rgba(34,211,238,.24);
      border-radius: 14px; color: #9feeff; background: rgba(5,18,34,.72); cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,.22); transition: transform .18s ease, border-color .18s ease;
    }
    .admin-notification-button:hover { transform: translateY(-1px); border-color: rgba(34,211,238,.46); }
    .admin-notification-button svg { width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .admin-notification-button.has-unread { animation: adminBellPulse 1.8s ease-in-out infinite; }
    .admin-notification-button.has-unread svg { animation: adminBellShake 1.9s ease-in-out infinite; transform-origin:50% 22%; }
    @keyframes adminBellPulse { 0%,100%{box-shadow:0 8px 24px rgba(0,0,0,.22),0 0 0 0 rgba(255,70,85,0)} 50%{box-shadow:0 10px 30px rgba(255,70,85,.14),0 0 0 6px rgba(255,70,85,.045)} }
    @keyframes adminBellShake { 0%,72%,100%{transform:rotate(0)} 76%{transform:rotate(-10deg)} 80%{transform:rotate(9deg)} 84%{transform:rotate(-6deg)} 88%{transform:rotate(3deg)} }
    .admin-notification-badge { position:absolute; top:-5px; right:-5px; min-width:18px; height:18px; padding:0 5px; display:none; align-items:center; justify-content:center; border-radius:999px; background:#ff3b4f; color:#fff; border:2px solid #030712; font-size:10px; line-height:1; font-weight:850; box-shadow:0 0 14px rgba(255,59,79,.52); }
    .admin-notification-badge.visible { display:inline-flex; animation:notificationBadgeIn .28s ease-out; }
    @keyframes notificationBadgeIn { from{opacity:0;transform:scale(.65)} to{opacity:1;transform:scale(1)} }
    .admin-notification-panel { position:fixed; z-index:1200; top:78px; right:24px; width:min(430px,calc(100vw - 28px)); max-height:min(650px,calc(100vh - 100px)); display:none; flex-direction:column; overflow:hidden; border:1px solid rgba(34,211,238,.25); border-radius:20px; background:rgba(3,10,23,.96); box-shadow:0 24px 70px rgba(0,0,0,.52),0 0 36px rgba(34,211,238,.08); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); }
    .admin-notification-panel.open { display:flex; animation:notificationPanelIn .18s ease-out; }
    @keyframes notificationPanelIn { from{opacity:0;transform:translateY(-7px) scale(.985)} to{opacity:1;transform:translateY(0) scale(1)} }
    .admin-notification-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 17px; border-bottom:1px solid rgba(34,211,238,.13); }
    .admin-notification-title { font-size:17px; font-weight:850; color:#effcff; }
    .admin-notification-sub { margin-top:2px; color:#6f8ba0; font-size:11px; }
    .admin-notification-close { width:34px; height:34px; border:1px solid rgba(120,160,190,.20); border-radius:10px; background:rgba(255,255,255,.035); color:#8ca9bb; cursor:pointer; font-size:18px; }
    .admin-notification-list { overflow:auto; padding:8px; }
    .admin-notification-empty { padding:34px 18px; text-align:center; color:#71889a; font-size:13px; }
    .admin-notification-item { position:relative; padding:13px; margin-bottom:7px; border-radius:15px; border:1px solid rgba(255,75,91,.13); background:rgba(38,10,18,.34); }
    .admin-notification-item:last-child { margin-bottom:0; }
    .admin-notification-item-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .admin-notification-item-title { color:#ff9aa6; font-size:12px; font-weight:850; }
    .admin-notification-time { color:#667f91; font-size:10px; white-space:nowrap; }
    .admin-notification-message { margin-top:7px; color:#dcebf2; font-size:12px; line-height:1.6; white-space:pre-wrap; overflow-wrap:anywhere; user-select:text; -webkit-user-select:text; }
    .admin-notification-actions { display:flex; justify-content:flex-end; margin-top:9px; }
    .admin-notification-copy { min-height:32px; padding:0 10px; border-radius:9px; border:1px solid rgba(91,155,255,.20); background:rgba(13,39,67,.62); color:#8edcff; font-size:11px; font-weight:750; cursor:pointer; }
    .admin-notification-copy:hover { border-color:rgba(91,155,255,.45); background:rgba(13,55,90,.72); }
    @media (max-width:620px) { .admin-notification-panel { top:72px; right:14px; width:calc(100vw - 28px); max-height:calc(100vh - 90px); } }
    @media (prefers-reduced-motion:reduce) { .admin-notification-button.has-unread,.admin-notification-button.has-unread svg,.admin-notification-badge.visible,.admin-notification-panel.open { animation:none !important; } }

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

    /* User dashboard visual refresh — presentation only. No user-dashboard logic or API behavior changed. */
    body.user-mode.user-dashboard-page {
      --user-cyan: #4fdcff;
      --user-blue: #4f8cff;
      --user-violet: #9b7cff;
      --user-surface: rgba(8, 17, 32, .78);
      --user-surface-strong: rgba(10, 23, 43, .90);
      --user-border: rgba(104, 178, 255, .18);
      background:
        radial-gradient(circle at 8% 4%, rgba(79,220,255,.11), transparent 24%),
        radial-gradient(circle at 92% 9%, rgba(155,124,255,.12), transparent 25%),
        radial-gradient(circle at 50% 100%, rgba(79,140,255,.09), transparent 32%),
        linear-gradient(145deg,#02050c 0%,#061326 48%,#030711 100%);
    }

    body.user-mode.user-dashboard-page .wrap {
      max-width: 820px;
      padding-top: 4px;
      padding-bottom: 22px;
    }

    body.user-mode.user-dashboard-page .top {
      position: relative;
      align-items: center;
      margin: 2px 0 20px;
      padding: 12px 14px;
      border: 1px solid rgba(104,178,255,.13);
      border-radius: 20px;
      background: linear-gradient(120deg,rgba(7,17,32,.82),rgba(10,26,48,.58));
      box-shadow: 0 14px 34px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.035);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    body.user-mode.user-dashboard-page .top::before {
      content: "";
      position: absolute;
      left: 14px;
      top: 10px;
      width: 5px;
      height: 28px;
      border-radius: 999px;
      background: linear-gradient(180deg,var(--user-cyan),var(--user-blue),var(--user-violet));
      box-shadow: 0 0 18px rgba(79,220,255,.28);
    }

    body.user-mode.user-dashboard-page .top h1 {
      margin-left: 14px;
      font-size: clamp(22px,5.5vw,29px);
      line-height: 1.1;
      letter-spacing: -.035em;
      font-weight: 820;
      color: transparent;
      background: linear-gradient(
        108deg,
        #f6fbff 0%,
        #dff9ff 18%,
        #86e8ff 42%,
        #c8c0ff 63%,
        #f7f3ff 82%,
        #b7ecff 100%
      );
      background-size: 220% auto;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 24px rgba(87,214,255,.14), 0 0 44px rgba(126,112,255,.10);
      animation: userDashboardTitleShine 5.8s ease-in-out infinite, userDashboardTitleIn .62s cubic-bezier(.22,1,.36,1) both;
    }

    @keyframes userDashboardTitleShine {
      0%, 100% { background-position: 100% center; filter: brightness(1); }
      50% { background-position: 0% center; filter: brightness(1.14); }
    }

    @keyframes userDashboardTitleIn {
      from { opacity: 0; transform: translateY(5px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    body.user-mode.user-dashboard-page .top {
      padding: 12px 14px 13px;
      margin: 0 0 15px;
      border: 1px solid rgba(205,235,255,.13);
      border-radius: 22px;
      background:
        linear-gradient(145deg, rgba(255,255,255,.085), rgba(255,255,255,.025)),
        linear-gradient(145deg, rgba(5,13,25,.78), rgba(7,28,52,.62));
      box-shadow:
        0 18px 42px rgba(0,0,0,.30),
        inset 0 1px 0 rgba(255,255,255,.075),
        inset 0 -1px 0 rgba(255,255,255,.018);
      backdrop-filter: blur(24px) saturate(145%);
      -webkit-backdrop-filter: blur(24px) saturate(145%);
      overflow: visible;
    }

    body.user-mode.user-dashboard-page .top::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background: linear-gradient(120deg, rgba(255,255,255,.08), transparent 24%, transparent 74%, rgba(115,218,255,.045));
      opacity: .8;
    }

    body.user-mode.user-dashboard-page .top > div:first-child,
    body.user-mode.user-dashboard-page .top > div:last-child {
      position: relative;
      z-index: 1;
    }

    body.user-mode.user-dashboard-page .user-greeting {
      display: block;
      margin: 5px 0 0 14px;
      color: rgba(190,218,238,.72);
      font-size: 12px;
      font-weight: 650;
      letter-spacing: -.005em;
      opacity: 0;
      transform: translateY(5px);
      animation: userGreetingIn .7s .13s cubic-bezier(.22,1,.36,1) both;
    }

    @keyframes userGreetingIn {
      from { opacity: 0; transform: translateY(5px); filter: blur(2px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    body.user-mode.user-dashboard-page .credit-marquee {
      margin-top: 5px;
      width: min(390px, 46vw);
      opacity: .76;
    }

    body.user-mode.user-dashboard-page .user-language-switcher {
      position: relative;
      top: auto;
      right: auto;
      z-index: 3;
    }

    body.user-mode.user-dashboard-page .user-language-button {
      width: 40px;
      height: 40px;
      border: 1px solid rgba(214,239,255,.16);
      background:
        linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.035)),
        rgba(7,18,34,.58);
      box-shadow:
        0 10px 26px rgba(0,0,0,.24),
        inset 0 1px 0 rgba(255,255,255,.08);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      transition: transform .22s ease, border-color .22s ease, background .22s ease, box-shadow .22s ease;
    }

    body.user-mode.user-dashboard-page .user-language-button:hover {
      transform: translateY(-1px) scale(1.025);
      border-color: rgba(132,220,255,.30);
      background:
        linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.045)),
        rgba(8,24,44,.64);
      box-shadow: 0 13px 30px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10);
    }

    body.user-mode.user-dashboard-page .user-language-button:active {
      transform: scale(.96);
    }

    body.user-mode.user-dashboard-page .user-language-menu {
      margin-top: 6px;
      border-color: rgba(205,235,255,.14);
      background:
        linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.025)),
        rgba(4,11,22,.78);
      box-shadow: 0 22px 46px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.075);
      backdrop-filter: blur(26px) saturate(145%);
      -webkit-backdrop-filter: blur(26px) saturate(145%);
    }

    body.user-mode.user-dashboard-page #user-dashboard {
      animation: userDashboardGlassIn .58s cubic-bezier(.22,1,.36,1) both;
    }

    @keyframes userDashboardGlassIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    body.user-mode.user-dashboard-page .user-group-box,
    body.user-mode.user-dashboard-page .user-setting-card,
    body.user-mode.user-dashboard-page .user-group-option {
      position: relative;
      overflow: hidden;
      border-color: rgba(214,238,255,.12);
      background:
        linear-gradient(145deg, rgba(255,255,255,.080), rgba(255,255,255,.018)),
        linear-gradient(145deg, rgba(5,15,29,.78), rgba(8,29,53,.58));
      box-shadow:
        0 18px 38px rgba(0,0,0,.30),
        inset 0 1px 0 rgba(255,255,255,.065),
        inset 0 -1px 0 rgba(255,255,255,.018);
      backdrop-filter: blur(24px) saturate(140%);
      -webkit-backdrop-filter: blur(24px) saturate(140%);
      transition: transform .24s ease, border-color .24s ease, box-shadow .28s ease, background .28s ease;
    }

    body.user-mode.user-dashboard-page .user-group-box::after,
    body.user-mode.user-dashboard-page .user-setting-card::after,
    body.user-mode.user-dashboard-page .user-group-option::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background: linear-gradient(125deg, rgba(255,255,255,.065), transparent 28%, transparent 72%, rgba(107,209,255,.035));
    }

    body.user-mode.user-dashboard-page .user-group-box:hover,
    body.user-mode.user-dashboard-page .user-setting-card:hover,
    body.user-mode.user-dashboard-page .user-group-option:hover {
      border-color: rgba(147,222,255,.20);
      box-shadow:
        0 22px 46px rgba(0,0,0,.34),
        inset 0 1px 0 rgba(255,255,255,.085),
        0 0 0 1px rgba(91,181,255,.035);
    }

    body.user-mode.user-dashboard-page .user-setting-card {
      margin-bottom: 13px;
    }

    body.user-mode.user-dashboard-page .user-setting-head {
      position: relative;
      z-index: 1;
    }

    body.user-mode.user-dashboard-page .user-group-box-title,
    body.user-mode.user-dashboard-page .user-live-label,
    body.user-mode.user-dashboard-page .user-live-value,
    body.user-mode.user-dashboard-page .user-setting-title,
    body.user-mode.user-dashboard-page .user-setting-sub,
    body.user-mode.user-dashboard-page .user-setting-value,
    body.user-mode.user-dashboard-page .user-setting-editor {
      position: relative;
      z-index: 1;
    }

    body.user-mode.user-dashboard-page .user-live-metric,
    body.user-mode.user-dashboard-page .user-setting-value,
    body.user-mode.user-dashboard-page .user-setting-editor .editor-row {
      background:
        linear-gradient(145deg, rgba(255,255,255,.050), rgba(255,255,255,.012)),
        rgba(2,10,21,.32);
      border-color: rgba(213,239,255,.085);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    body.user-mode.user-dashboard-page .user-live-metric:hover,
    body.user-mode.user-dashboard-page .user-setting-value:hover,
    body.user-mode.user-dashboard-page .user-setting-editor .editor-row:hover {
      border-color: rgba(116,211,255,.15);
    }

    body.user-mode.user-dashboard-page .user-page-sub {
      color: rgba(151,180,204,.70);
    }

    body.user-mode.user-dashboard-page .user-group-name {
      color: rgba(139,212,255,.80);
    }

    body.user-mode.user-dashboard-page .user-dashboard-section-label {
      color: rgba(201,224,242,.76);
      letter-spacing: .11em;
    }

    body.user-mode.user-dashboard-page .user-setting-save {
      position: relative;
      z-index: 2;
      border-color: rgba(151,221,255,.22);
      background:
        linear-gradient(180deg, rgba(83,183,255,.85), rgba(32,108,211,.82));
      box-shadow:
        0 12px 28px rgba(16,93,194,.24),
        inset 0 1px 0 rgba(255,255,255,.16);
      transition: transform .18s ease, filter .18s ease, box-shadow .22s ease;
    }

    body.user-mode.user-dashboard-page .user-setting-save:hover {
      transform: translateY(-1px);
      filter: brightness(1.05);
      box-shadow: 0 14px 32px rgba(16,93,194,.30), inset 0 1px 0 rgba(255,255,255,.18);
    }

    body.user-mode.user-dashboard-page .user-setting-save:active {
      transform: translateY(0) scale(.985);
    }

    body.user-mode.user-dashboard-page .user-group-box::before,
    body.user-mode.user-dashboard-page .user-setting-card::before {
      width: 3px;
      opacity: .72;
      background: linear-gradient(180deg, rgba(113,224,255,.86), rgba(65,141,255,.64), rgba(151,125,255,.58));
      box-shadow: 0 0 16px rgba(67,181,255,.18);
    }

    @media (prefers-reduced-motion: reduce) {
      body.user-mode.user-dashboard-page .top h1,
      body.user-mode.user-dashboard-page .user-greeting,
      body.user-mode.user-dashboard-page #user-dashboard {
        animation: none !important;
      }
      body.user-mode.user-dashboard-page .user-group-box,
      body.user-mode.user-dashboard-page .user-setting-card,
      body.user-mode.user-dashboard-page .user-group-option,
      body.user-mode.user-dashboard-page .user-language-button {
        transition: none !important;
      }
    }


    body.user-mode.user-dashboard-page .credit-marquee {
      width: min(390px,46vw);
      margin-top: 2px;
    }

    body.user-mode.user-dashboard-page .credit-text {
      color: #7189a3;
      font-size: 9px;
      letter-spacing: .045em;
    }

    body.user-mode.user-dashboard-page .credit-text strong {
      color: #a9bfd5;
    }

    body.user-mode.user-dashboard-page .refresh {
      min-height: 40px;
      padding: 0 13px;
      border-radius: 12px;
      background: rgba(20,105,220,.16);
      border-color: rgba(91,174,255,.25);
      color: #bde9ff;
      box-shadow: none;
      font-size: 12px;
    }

    body.user-mode.user-dashboard-page .refresh:hover {
      background: rgba(30,128,255,.24);
      border-color: rgba(91,174,255,.45);
    }

    body.user-mode.user-dashboard-page #user-dashboard {
      animation: userDashboardEnter .45s cubic-bezier(.22,1,.36,1) both;
    }

    @keyframes userDashboardEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    body.user-mode.user-dashboard-page .user-page-head {
      margin: 0 0 18px;
      padding: 2px 2px 0;
    }

    body.user-mode.user-dashboard-page .user-page-title {
      font-size: clamp(24px,6vw,30px);
      line-height: 1.15;
      letter-spacing: -.025em;
      color: #f4f9ff;
      text-shadow: 0 0 20px rgba(79,220,255,.08);
    }

    body.user-mode.user-dashboard-page .user-page-sub {
      margin-top: 6px;
      color: #7188a1;
      font-size: 12px;
    }

    body.user-mode.user-dashboard-page .user-language-button {
      width: 40px;
      height: 40px;
      background: rgba(10,29,53,.78);
      border-color: rgba(104,178,255,.25);
      box-shadow: 0 8px 22px rgba(0,0,0,.20);
    }

    body.user-mode.user-dashboard-page .user-language-button svg {
      animation: none;
    }

    body.user-mode.user-dashboard-page .user-group-options {
      padding-bottom: 88px;
    }

    body.user-mode.user-dashboard-page .user-group-options > .user-page-head::after {
      content: "SELECT GROUP";
      display: block;
      align-self: center;
      margin-left: auto;
      padding: 7px 9px;
      border: 1px solid rgba(79,220,255,.15);
      border-radius: 999px;
      color: #65cde8;
      background: rgba(24,129,167,.07);
      font-size: 9px;
      font-weight: 850;
      letter-spacing: .12em;
    }

    body.user-mode.user-dashboard-page .user-group-option {
      min-height: 76px;
      margin-bottom: 10px;
      padding: 15px 16px 15px 18px;
      border-color: var(--user-border);
      border-radius: 18px;
      background:
        linear-gradient(110deg,rgba(9,24,44,.92),rgba(8,20,38,.76)),
        radial-gradient(circle at 100% 0,rgba(79,220,255,.08),transparent 35%);
      box-shadow: 0 12px 28px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.035);
      transition: transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;
    }

    body.user-mode.user-dashboard-page .user-group-option:hover {
      transform: translateY(-1px);
      border-color: rgba(79,220,255,.34);
      background: linear-gradient(110deg,rgba(10,31,55,.96),rgba(9,24,45,.82));
      box-shadow: 0 16px 34px rgba(0,0,0,.24),0 0 22px rgba(79,220,255,.05);
    }

    body.user-mode.user-dashboard-page .user-group-option span:last-child {
      width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 11px;
      color: #8edfff;
      background: rgba(79,220,255,.08);
      border: 1px solid rgba(79,220,255,.14);
      font-size: 18px;
    }

    body.user-mode.user-dashboard-page .user-group-box,
    body.user-mode.user-dashboard-page .user-setting-card {
      border-color: var(--user-border);
      border-radius: 20px;
      background: linear-gradient(145deg,rgba(9,21,39,.90),rgba(7,18,34,.78));
      box-shadow: 0 18px 38px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.035);
    }

    body.user-mode.user-dashboard-page .user-group-box::before,
    body.user-mode.user-dashboard-page .user-setting-card::before {
      width: 3px;
      background: linear-gradient(180deg,var(--user-cyan),var(--user-blue),var(--user-violet));
      box-shadow: 0 0 16px rgba(79,220,255,.16);
    }

    body.user-mode.user-dashboard-page .user-group-box-title {
      font-size: 15px;
      letter-spacing: .01em;
    }

    body.user-mode.user-dashboard-page .user-group-box-title::before {
      width: 7px;
      height: 7px;
      background: var(--user-cyan);
      box-shadow: 0 0 12px rgba(79,220,255,.72);
    }

    body.user-mode.user-dashboard-page .user-group-name {
      color: #8cc9ed;
      font-weight: 650;
    }

    body.user-mode.user-dashboard-page .user-group-metrics {
      gap: 9px;
    }

    body.user-mode.user-dashboard-page .user-live-metric {
      padding: 12px;
      border-radius: 15px;
      border-color: rgba(104,178,255,.12);
      background: linear-gradient(145deg,rgba(13,34,60,.72),rgba(5,15,29,.72));
    }

    body.user-mode.user-dashboard-page .user-live-label {
      color: #7189a3;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .055em;
    }

    body.user-mode.user-dashboard-page .user-live-value {
      font-size: 25px;
    }

    body.user-mode.user-dashboard-page .user-setting-card {
      padding: 17px;
      margin-bottom: 12px;
    }

    body.user-mode.user-dashboard-page .user-setting-head {
      margin-bottom: 13px;
    }

    body.user-mode.user-dashboard-page .user-setting-icon {
      width: 42px;
      height: 42px;
      flex-basis: 42px;
      border-radius: 13px;
      background: linear-gradient(145deg,rgba(36,150,255,.16),rgba(8,31,58,.88));
      border-color: rgba(104,178,255,.22);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06),0 8px 20px rgba(0,96,220,.12);
    }

    body.user-mode.user-dashboard-page .user-setting-title {
      font-size: 15px;
    }

    body.user-mode.user-dashboard-page .user-setting-sub {
      color: #6e859e;
    }

    body.user-mode.user-dashboard-page .user-setting-value {
      padding: 11px 12px;
      border-radius: 13px;
      border-color: rgba(104,178,255,.10);
      background: rgba(2,9,20,.30);
    }

    body.user-mode.user-dashboard-page .user-setting-value-number {
      color: #eef8ff;
      font-size: 17px;
    }

    body.user-mode.user-dashboard-page .user-setting-editor .editor-row {
      border-color: rgba(104,178,255,.10);
      background: rgba(3,11,23,.32);
    }

    body.user-mode.user-dashboard-page .user-setting-editor input {
      border-color: rgba(104,178,255,.16);
      background: rgba(2,8,18,.72);
    }

    body.user-mode.user-dashboard-page .user-setting-save {
      background: linear-gradient(100deg,#168ee8,#4f6ff0);
      border-color: rgba(122,201,255,.26);
      box-shadow: 0 9px 22px rgba(38,99,235,.18);
    }

    body.user-mode.user-dashboard-page .user-dashboard-section-label {
      margin: 0 0 9px;
      color: #5f8aa6;
      font-size: 9px;
      letter-spacing: .16em;
    }

    body.user-mode.user-dashboard-page .user-dashboard-section-label.warning {
      color: #c9a15a;
    }

    body.user-mode.user-dashboard-page .user-tab-shell {
      padding-bottom: 86px;
    }

    body.user-mode.user-dashboard-page .user-tabbar {
      width: min(760px,calc(100% - 24px));
      bottom: max(9px,env(safe-area-inset-bottom));
      padding: 6px;
      gap: 5px;
      border-color: rgba(104,178,255,.18);
      border-radius: 17px;
      background: rgba(3,10,21,.86);
      box-shadow: 0 18px 42px rgba(0,0,0,.40),inset 0 1px 0 rgba(255,255,255,.04);
    }

    body.user-mode.user-dashboard-page .user-tab {
      min-height: 44px;
      border-radius: 12px;
      color: #6f879f;
      font-size: 12px;
    }

    body.user-mode.user-dashboard-page .user-tab.active {
      color: #eaf9ff;
      background: linear-gradient(100deg,rgba(18,137,224,.90),rgba(79,111,240,.90));
      box-shadow: 0 7px 18px rgba(37,99,235,.20),inset 0 1px 0 rgba(255,255,255,.10);
    }


    @media (max-width: 620px) {
      body.user-mode.user-dashboard-page .wrap {
        padding-top: 2px;
      }

      body.user-mode.user-dashboard-page .top {
        margin-bottom: 16px;
        padding: 10px 11px;
        border-radius: 17px;
      }

      body.user-mode.user-dashboard-page .top h1 {
        font-size: 22px;
      }

      body.user-mode.user-dashboard-page .credit-marquee {
        width: min(260px,42vw);
      }

      body.user-mode.user-dashboard-page .user-group-options > .user-page-head::after {
        display: none;
      }

      body.user-mode.user-dashboard-page .user-page-title {
        font-size: 23px;
      }

      body.user-mode.user-dashboard-page .user-group-box,
      body.user-mode.user-dashboard-page .user-setting-card {
        border-radius: 18px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.user-mode.user-dashboard-page #user-dashboard {
        animation: none !important;
      }
    }


    /* Final User Dashboard Liquid Glass surface.
       This block intentionally sits last so earlier generic dashboard rules cannot flatten the material. */
    body.user-mode.user-dashboard-page {
      --glass-bg: rgba(8, 19, 34, .43);
      --glass-bg-strong: rgba(10, 24, 42, .56);
      --glass-border: rgba(210, 241, 255, .18);
      --glass-highlight: rgba(255, 255, 255, .095);
      --glass-shadow: rgba(0, 0, 0, .48);
      background:
        radial-gradient(560px 420px at 4% -4%, rgba(50, 207, 255, .17), transparent 68%),
        radial-gradient(520px 420px at 104% 8%, rgba(102, 91, 255, .18), transparent 66%),
        radial-gradient(420px 360px at 54% 112%, rgba(0, 153, 255, .11), transparent 70%),
        linear-gradient(145deg, #02050b 0%, #06111f 46%, #02060e 100%);
      color:#f4f9ff;
    }

    body.user-mode.user-dashboard-page::before,
    body.user-mode.user-dashboard-page::after {
      z-index:0;
      filter:blur(70px);
      opacity:.48;
      pointer-events:none;
      will-change:transform;
      animation:userGlassAmbient 12s ease-in-out infinite alternate;
    }

    body.user-mode.user-dashboard-page::before {
      width:420px;
      height:420px;
      left:-170px;
      top:4%;
      background:rgba(44,205,255,.22);
    }

    body.user-mode.user-dashboard-page::after {
      width:460px;
      height:460px;
      right:-190px;
      bottom:0;
      background:rgba(108,86,255,.20);
      animation-delay:-5s;
    }

    @keyframes userGlassAmbient {
      from { transform:translate3d(0,0,0) scale(1); }
      to { transform:translate3d(22px,-16px,0) scale(1.08); }
    }

    body.user-mode.user-dashboard-page .wrap {
      max-width:780px;
      position:relative;
      z-index:2;
    }

    body.user-mode.user-dashboard-page .top {
      position:relative;
      isolation:isolate;
      margin:0 0 18px;
      padding:15px 15px 15px 14px;
      border:1px solid var(--glass-border);
      border-radius:24px;
      background:
        linear-gradient(120deg, rgba(255,255,255,.105), rgba(255,255,255,.028) 35%, rgba(10,26,45,.30) 100%),
        rgba(7,17,30,.36);
      box-shadow:
        0 24px 58px var(--glass-shadow),
        0 1px 0 rgba(255,255,255,.11) inset,
        0 -1px 0 rgba(0,0,0,.20) inset;
      backdrop-filter:blur(30px) saturate(175%);
      -webkit-backdrop-filter:blur(30px) saturate(175%);
      overflow:visible;
    }

    body.user-mode.user-dashboard-page .top::after {
      content:"";
      position:absolute;
      inset:1px;
      z-index:-1;
      border-radius:23px;
      pointer-events:none;
      background:
        linear-gradient(112deg, rgba(255,255,255,.11) 0%, rgba(255,255,255,.03) 20%, transparent 42%, transparent 66%, rgba(139,220,255,.045) 100%);
      opacity:.92;
      mix-blend-mode:screen;
    }

    body.user-mode.user-dashboard-page .top::before {
      content:"";
      position:absolute;
      left:12px;
      top:11px;
      width:4px;
      height:34px;
      border-radius:999px;
      background:linear-gradient(180deg,#73eaff,#3f9cff 48%,#9b83ff);
      box-shadow:0 0 20px rgba(76,205,255,.42),0 0 38px rgba(108,91,255,.18);
    }

    body.user-mode.user-dashboard-page .top h1 {
      position:relative;
      z-index:2;
      margin-left:13px;
      font-size:clamp(23px,5.8vw,31px);
      line-height:1.08;
      letter-spacing:-.038em;
      font-weight:850;
      background:
        linear-gradient(108deg,#f9fcff 0%,#dffbff 22%,#7de9ff 46%,#c1b7ff 66%,#ffffff 85%,#aeeaff 100%);
      background-size:260% auto;
      color:transparent;
      background-clip:text;
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      filter:drop-shadow(0 0 16px rgba(93,220,255,.18));
      animation:userDashboardTitleShine 6s ease-in-out infinite,userDashboardTitleIn .65s cubic-bezier(.22,1,.36,1) both;
    }

    body.user-mode.user-dashboard-page .user-greeting {
      position:relative;
      z-index:2;
      display:block;
      margin:6px 0 0 13px;
      color:rgba(190,220,240,.76);
      font-size:12px;
      font-weight:650;
      letter-spacing:.005em;
      opacity:0;
      transform:translateY(6px);
      animation:userGreetingIn .72s .12s cubic-bezier(.22,1,.36,1) both;
    }

    body.user-mode.user-dashboard-page .user-language-button {
      position:relative;
      z-index:2;
      width:42px;
      height:42px;
      border:1px solid rgba(219,243,255,.20);
      border-radius:15px;
      background:
        linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.025)),
        rgba(9,22,38,.34);
      box-shadow:
        0 16px 34px rgba(0,0,0,.30),
        0 1px 0 rgba(255,255,255,.10) inset;
      backdrop-filter:blur(24px) saturate(165%);
      -webkit-backdrop-filter:blur(24px) saturate(165%);
    }

    body.user-mode.user-dashboard-page .user-language-button:hover {
      border-color:rgba(132,225,255,.38);
      box-shadow:0 18px 38px rgba(0,0,0,.34),0 0 24px rgba(64,193,255,.09),0 1px 0 rgba(255,255,255,.13) inset;
    }

    body.user-mode.user-dashboard-page .user-language-menu {
      margin-top:8px;
      border:1px solid rgba(218,241,255,.17);
      border-radius:19px;
      background:
        linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.022)),
        rgba(4,12,23,.48);
      box-shadow:
        0 28px 58px rgba(0,0,0,.48),
        0 1px 0 rgba(255,255,255,.09) inset;
      backdrop-filter:blur(32px) saturate(180%);
      -webkit-backdrop-filter:blur(32px) saturate(180%);
    }

    body.user-mode.user-dashboard-page .user-group-box,
    body.user-mode.user-dashboard-page .user-setting-card,
    body.user-mode.user-dashboard-page .user-group-option {
      isolation:isolate;
      position:relative;
      overflow:hidden;
      border:1px solid var(--glass-border);
      border-radius:22px;
      background:
        linear-gradient(135deg,rgba(255,255,255,.105) 0%,rgba(255,255,255,.028) 31%,rgba(7,22,39,.18) 100%),
        var(--glass-bg);
      box-shadow:
        0 24px 54px var(--glass-shadow),
        0 1px 0 rgba(255,255,255,.095) inset,
        0 -1px 0 rgba(0,0,0,.18) inset;
      backdrop-filter:blur(30px) saturate(170%);
      -webkit-backdrop-filter:blur(30px) saturate(170%);
      transform:translateZ(0);
      transition:transform .26s ease,border-color .26s ease,box-shadow .32s ease,background .32s ease;
    }

    body.user-mode.user-dashboard-page .user-group-box::after,
    body.user-mode.user-dashboard-page .user-setting-card::after,
    body.user-mode.user-dashboard-page .user-group-option::after {
      content:"";
      position:absolute;
      inset:0;
      z-index:-1;
      border-radius:inherit;
      pointer-events:none;
      background:
        linear-gradient(116deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.035) 17%,transparent 34%,transparent 72%,rgba(109,215,255,.05) 100%);
      opacity:.9;
      transform:translateX(-28%);
      animation:userGlassSheen 9s ease-in-out infinite;
    }

    @keyframes userGlassSheen {
      0%,62% { transform:translateX(-28%); opacity:.30; }
      78% { transform:translateX(18%); opacity:.78; }
      100% { transform:translateX(28%); opacity:.30; }
    }

    body.user-mode.user-dashboard-page .user-group-box:hover,
    body.user-mode.user-dashboard-page .user-setting-card:hover,
    body.user-mode.user-dashboard-page .user-group-option:hover {
      transform:translateY(-2px);
      border-color:rgba(154,229,255,.28);
      box-shadow:
        0 30px 66px rgba(0,0,0,.52),
        0 0 0 1px rgba(112,213,255,.045),
        0 1px 0 rgba(255,255,255,.12) inset;
    }

    body.user-mode.user-dashboard-page .user-group-box-title,
    body.user-mode.user-dashboard-page .user-live-label,
    body.user-mode.user-dashboard-page .user-live-value,
    body.user-mode.user-dashboard-page .user-group-name,
    body.user-mode.user-dashboard-page .user-setting-head,
    body.user-mode.user-dashboard-page .user-setting-value,
    body.user-mode.user-dashboard-page .user-setting-editor,
    body.user-mode.user-dashboard-page .user-setting-title,
    body.user-mode.user-dashboard-page .user-setting-sub {
      position:relative;
      z-index:2;
    }

    body.user-mode.user-dashboard-page .user-live-metric,
    body.user-mode.user-dashboard-page .user-setting-value,
    body.user-mode.user-dashboard-page .user-setting-editor .editor-row {
      border:1px solid rgba(211,241,255,.105);
      border-radius:16px;
      background:
        linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.015)),
        rgba(1,9,18,.22);
      box-shadow:
        0 12px 28px rgba(0,0,0,.22),
        0 1px 0 rgba(255,255,255,.055) inset;
      backdrop-filter:blur(20px) saturate(160%);
      -webkit-backdrop-filter:blur(20px) saturate(160%);
    }

    body.user-mode.user-dashboard-page .user-setting-icon {
      background:
        linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.025)),
        rgba(11,39,65,.30);
      border-color:rgba(181,231,255,.24);
      box-shadow:0 14px 30px rgba(0,0,0,.25),0 1px 0 rgba(255,255,255,.09) inset,0 0 20px rgba(58,174,255,.08);
      backdrop-filter:blur(22px) saturate(170%);
      -webkit-backdrop-filter:blur(22px) saturate(170%);
    }

    body.user-mode.user-dashboard-page .user-dashboard-section-label {
      color:rgba(192,225,242,.72);
      letter-spacing:.17em;
      font-size:9px;
    }

    body.user-mode.user-dashboard-page .user-live-label {
      color:rgba(151,184,207,.74);
    }

    body.user-mode.user-dashboard-page .user-live-value {
      color:#f7fbff;
      text-shadow:0 0 24px rgba(101,215,255,.11);
    }

    body.user-mode.user-dashboard-page .user-page-title {
      color:#f5faff;
      text-shadow:0 0 26px rgba(91,218,255,.08);
    }

    body.user-mode.user-dashboard-page .user-page-sub {
      color:rgba(150,180,205,.66);
    }

    body.user-mode.user-dashboard-page .user-setting-save {
      border:1px solid rgba(174,229,255,.28);
      border-radius:14px;
      background:
        linear-gradient(135deg,rgba(91,202,255,.92),rgba(66,116,235,.88) 58%,rgba(120,99,238,.84));
      box-shadow:0 16px 34px rgba(27,101,205,.25),0 1px 0 rgba(255,255,255,.20) inset;
      backdrop-filter:blur(15px);
      -webkit-backdrop-filter:blur(15px);
    }

    body.user-mode.user-dashboard-page .user-tabbar {
      border:1px solid rgba(214,240,255,.17);
      border-radius:20px;
      background:
        linear-gradient(145deg,rgba(255,255,255,.095),rgba(255,255,255,.018)),
        rgba(3,10,20,.48);
      box-shadow:
        0 24px 54px rgba(0,0,0,.48),
        0 1px 0 rgba(255,255,255,.09) inset;
      backdrop-filter:blur(30px) saturate(175%);
      -webkit-backdrop-filter:blur(30px) saturate(175%);
    }

    body.user-mode.user-dashboard-page .user-tab.active {
      background:
        linear-gradient(135deg,rgba(104,211,255,.38),rgba(58,119,236,.52) 58%,rgba(122,102,240,.42)),
        rgba(26,91,165,.40);
      border:1px solid rgba(195,238,255,.20);
      box-shadow:0 12px 28px rgba(24,93,196,.25),0 1px 0 rgba(255,255,255,.17) inset;
      backdrop-filter:blur(18px) saturate(170%);
      -webkit-backdrop-filter:blur(18px) saturate(170%);
    }

    @media (prefers-reduced-motion: reduce) {
      body.user-mode.user-dashboard-page::before,
      body.user-mode.user-dashboard-page::after,
      body.user-mode.user-dashboard-page .top h1,
      body.user-mode.user-dashboard-page .user-greeting,
      body.user-mode.user-dashboard-page .user-group-box::after,
      body.user-mode.user-dashboard-page .user-setting-card::after,
      body.user-mode.user-dashboard-page .user-group-option::after {
        animation:none !important;
      }

      body.user-mode.user-dashboard-page .user-group-box,
      body.user-mode.user-dashboard-page .user-setting-card,
      body.user-mode.user-dashboard-page .user-group-option {
        transition:none !important;
      }
    }


    /* Refined User Dashboard Switch control. */
    body.user-mode.user-dashboard-page #switch-group {
      min-height:40px;
      min-width:112px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      padding:0 13px;
      border:1px solid rgba(202,237,255,.18);
      border-radius:14px;
      color:#dff8ff;
      background:
        linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.022)),
        rgba(7,19,34,.42);
      box-shadow:
        0 14px 32px rgba(0,0,0,.34),
        0 1px 0 rgba(255,255,255,.10) inset,
        0 -1px 0 rgba(0,0,0,.18) inset;
      backdrop-filter:blur(22px) saturate(165%);
      -webkit-backdrop-filter:blur(22px) saturate(165%);
      font-size:12px;
      font-weight:780;
      letter-spacing:.01em;
      line-height:1;
      cursor:pointer;
      align-self:flex-end;
      position:relative;
      overflow:hidden;
      transition:
        transform .20s ease,
        border-color .22s ease,
        background .24s ease,
        box-shadow .24s ease,
        color .22s ease;
    }

    body.user-mode.user-dashboard-page #switch-group::before {
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      background:linear-gradient(110deg,rgba(255,255,255,.12),transparent 35%,transparent 72%,rgba(88,214,255,.07));
      opacity:.72;
      transform:translateX(-22%);
      transition:transform .45s ease,opacity .25s ease;
    }

    body.user-mode.user-dashboard-page #switch-group:hover {
      transform:translateY(-1px);
      border-color:rgba(137,224,255,.34);
      color:#f3fdff;
      background:
        linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.03)),
        rgba(8,25,45,.50);
      box-shadow:
        0 18px 38px rgba(0,0,0,.40),
        0 0 24px rgba(56,190,255,.075),
        0 1px 0 rgba(255,255,255,.13) inset;
    }

    body.user-mode.user-dashboard-page #switch-group:hover::before {
      transform:translateX(22%);
      opacity:.95;
    }

    body.user-mode.user-dashboard-page #switch-group:active {
      transform:translateY(0) scale(.965);
    }

    body.user-mode.user-dashboard-page #switch-group:focus-visible {
      outline:2px solid rgba(112,220,255,.42);
      outline-offset:2px;
    }

    body.user-mode.user-dashboard-page #switch-group svg {
      position:relative;
      z-index:1;
      width:17px;
      height:17px;
      flex:0 0 17px;
      stroke:currentColor;
      fill:none;
      stroke-width:1.8;
      stroke-linecap:round;
      stroke-linejoin:round;
      filter:drop-shadow(0 0 7px rgba(92,214,255,.18));
      transition:transform .34s cubic-bezier(.22,1,.36,1);
    }

    body.user-mode.user-dashboard-page #switch-group:hover svg {
      transform:rotate(180deg) scale(1.04);
    }

    body.user-mode.user-dashboard-page #switch-group-label {
      position:relative;
      z-index:1;
      display:inline-flex;
      align-items:center;
      min-width:0;
    }

    body.user-mode.user-dashboard-page #switch-group:disabled {
      opacity:.58;
      cursor:default;
      transform:none;
    }

    @media (max-width:620px) {
      body.user-mode.user-dashboard-page #switch-group {
        min-width:98px;
        min-height:38px;
        padding:0 11px;
        border-radius:13px;
        gap:7px;
      }
      body.user-mode.user-dashboard-page #switch-group svg {
        width:16px;
        height:16px;
        flex-basis:16px;
      }
    }

    /* User Dashboard About page + bottom folder tabs. */
    body.user-mode.user-dashboard-page .user-about-page {
      position:relative;
      overflow:hidden;
      padding:18px 18px 118px;
      margin-bottom:0;
      border-radius:20px;
      border:1px solid rgba(202,237,255,.13);
      background:
        radial-gradient(circle at 8% 0%,rgba(57,213,255,.10),transparent 30%),
        linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.018)),
        rgba(7,17,31,.54);
      box-shadow:0 20px 46px rgba(0,0,0,.42),0 1px 0 rgba(255,255,255,.09) inset,0 -1px 0 rgba(0,0,0,.18) inset;
      backdrop-filter:blur(28px) saturate(165%);
      -webkit-backdrop-filter:blur(28px) saturate(165%);
      animation:userAboutIn .34s cubic-bezier(.22,1,.36,1) both;
    }
    body.user-mode.user-dashboard-page .user-about-page[hidden] { display:none !important; }
    body.user-mode.user-dashboard-page .user-about-page-head { margin-bottom:18px;padding-right:0; }
    @keyframes userAboutIn {
      from { opacity:0;transform:translateY(10px) scale(.985);filter:blur(2px); }
      to { opacity:1;transform:translateY(0) scale(1);filter:blur(0); }
    }
    .user-about-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px; }
    .user-about-card {
      min-width:0;padding:14px;border-radius:16px;border:1px solid rgba(202,237,255,.10);
      background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),rgba(3,11,22,.40);
      box-shadow:0 12px 28px rgba(0,0,0,.24),0 1px 0 rgba(255,255,255,.055) inset;
    }
    .user-about-card.user-about-credit-card { grid-column:1 / -1; }
    .user-about-card[open] { border-color:rgba(124,218,255,.19); }
    .user-about-icon {
      width:38px;height:38px;flex:0 0 38px;display:inline-flex;align-items:center;justify-content:center;
      border-radius:13px;color:#94dcff;background:linear-gradient(145deg,rgba(48,181,255,.16),rgba(37,69,120,.34));
      border:1px solid rgba(127,220,255,.14);box-shadow:0 10px 20px rgba(0,116,220,.13),0 1px 0 rgba(255,255,255,.07) inset;
    }
    .user-about-icon svg { width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round; }
    article.user-about-card:not(.user-about-details) { display:flex;align-items:center;gap:12px; }
    .user-about-copy-block { min-width:0; }
    .user-about-label { color:#8198b3;font-size:11px;font-weight:730;letter-spacing:.025em; }
    .user-about-value { margin-top:3px;color:#f0fbff;font-size:16px;font-weight:790;letter-spacing:-.01em; }
    .user-about-credit-sub { margin-top:1px;color:#6f849f;font-size:10px;font-weight:650; }
    .user-about-details { overflow:hidden; }
    .user-about-details summary { display:flex;align-items:center;gap:12px;cursor:pointer;list-style:none;user-select:none; }
    .user-about-details summary::-webkit-details-marker { display:none; }
    .user-about-summary-copy { min-width:0;flex:1;display:flex;align-items:center;justify-content:space-between;gap:10px; }
    .user-about-summary-arrow { color:#80d9ff;font-size:20px;line-height:1;transition:transform .22s ease; }
    .user-about-details[open] .user-about-summary-arrow { transform:rotate(90deg); }
    .user-about-copy { margin:12px 0 2px 50px;color:#8ea3bc;font-size:12px;line-height:1.6; }

    body.user-mode.user-dashboard-page .user-tabbar[hidden] { display:none !important; }
    body.user-mode.user-dashboard-page .user-tab {
      position:relative;display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:48px;border:1px solid transparent;
    }
    body.user-mode.user-dashboard-page .user-tab-icon {
      position:relative;z-index:1;width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;
    }
    body.user-mode.user-dashboard-page .user-tab-icon svg {
      width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;
      transition:transform .3s cubic-bezier(.22,1,.36,1);
    }
    body.user-mode.user-dashboard-page .user-tab:hover .user-tab-icon svg { transform:translateY(-1px) scale(1.05); }
    body.user-mode.user-dashboard-page .user-tab.active .user-tab-icon svg { filter:drop-shadow(0 0 8px rgba(123,220,255,.26)); }

    @media (max-width:620px) {
      .user-about-grid { grid-template-columns:1fr; }
      .user-about-card.user-about-credit-card { grid-column:auto; }
      .user-about-copy { margin-left:0; }
      body.user-mode.user-dashboard-page .user-about-page { margin-bottom:0;padding:15px 15px 108px; }
      body.user-mode.user-dashboard-page .user-tab { min-height:44px;gap:6px; }
      body.user-mode.user-dashboard-page .user-tab-icon,
      body.user-mode.user-dashboard-page .user-tab-icon svg { width:16px;height:16px; }
    }
    @media (prefers-reduced-motion: reduce) {
      body.user-mode.user-dashboard-page .user-about-page,
      body.user-mode.user-dashboard-page .user-tab-icon svg { animation:none !important;transition:none !important; }
    }

    /* Refined User Dashboard Refresh control. */
    body.user-mode.user-dashboard-page #refresh {
      min-height:40px;
      min-width:112px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      padding:0 13px;
      border:1px solid rgba(202,237,255,.18);
      border-radius:14px;
      color:#dff8ff;
      background:
        linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.022)),
        rgba(7,19,34,.42);
      box-shadow:
        0 14px 32px rgba(0,0,0,.34),
        0 1px 0 rgba(255,255,255,.10) inset,
        0 -1px 0 rgba(0,0,0,.18) inset;
      backdrop-filter:blur(22px) saturate(165%);
      -webkit-backdrop-filter:blur(22px) saturate(165%);
      font-size:12px;
      font-weight:780;
      letter-spacing:.01em;
      line-height:1;
      cursor:pointer;
      align-self:flex-end;
      position:relative;
      overflow:hidden;
      transition:
        transform .20s ease,
        border-color .22s ease,
        background .24s ease,
        box-shadow .24s ease,
        color .22s ease;
    }

    body.user-mode.user-dashboard-page #refresh::before {
      content:"↻";
      position:relative;
      z-index:1;
      width:17px;
      height:17px;
      flex:0 0 17px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      color:currentColor;
      font-size:18px;
      font-weight:520;
      line-height:1;
      transform:translateY(-0.5px);
      filter:drop-shadow(0 0 7px rgba(92,214,255,.18));
      transition:transform .34s cubic-bezier(.22,1,.36,1),opacity .2s ease;
    }

    body.user-mode.user-dashboard-page #refresh::after {
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      background:linear-gradient(110deg,rgba(255,255,255,.12),transparent 35%,transparent 72%,rgba(88,214,255,.07));
      opacity:.72;
      transform:translateX(-22%);
      transition:transform .45s ease,opacity .25s ease;
    }

    body.user-mode.user-dashboard-page #refresh:hover {
      transform:translateY(-1px);
      border-color:rgba(137,224,255,.34);
      color:#f3fdff;
      background:
        linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.03)),
        rgba(8,25,45,.50);
      box-shadow:
        0 18px 38px rgba(0,0,0,.40),
        0 0 24px rgba(56,190,255,.075),
        0 1px 0 rgba(255,255,255,.13) inset;
    }

    body.user-mode.user-dashboard-page #refresh:hover::before {
      transform:rotate(180deg) scale(1.04);
    }

    body.user-mode.user-dashboard-page #refresh:hover::after {
      transform:translateX(22%);
      opacity:.95;
    }

    body.user-mode.user-dashboard-page #refresh:active {
      transform:translateY(0) scale(.965);
    }

    body.user-mode.user-dashboard-page #refresh:focus-visible {
      outline:2px solid rgba(112,220,255,.42);
      outline-offset:2px;
    }

    body.user-mode.user-dashboard-page #refresh .button-content {
      position:relative;
      z-index:1;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      min-width:0;
    }

    body.user-mode.user-dashboard-page #refresh.is-loading::before {
      opacity:0;
      transform:none;
    }

    body.user-mode.user-dashboard-page #refresh:disabled {
      opacity:.58;
      cursor:default;
      transform:none;
    }

    @media (max-width:620px) {
      body.user-mode.user-dashboard-page #refresh {
        min-width:98px;
        min-height:38px;
        padding:0 11px;
        border-radius:13px;
        gap:7px;
      }

      body.user-mode.user-dashboard-page #refresh::before {
        width:16px;
        height:16px;
        flex-basis:16px;
        font-size:17px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      body.user-mode.user-dashboard-page #refresh,
      body.user-mode.user-dashboard-page #refresh::before,
      body.user-mode.user-dashboard-page #refresh::after,
      body.user-mode.user-dashboard-page #switch-group,
      body.user-mode.user-dashboard-page #switch-group::before,
      body.user-mode.user-dashboard-page #switch-group svg {
        transition:none !important;
      }
    }

  </style>
</head>
<body>
  <div id="user-loading" class="user-loading" aria-live="polite" aria-label="Loading">
    <div class="user-loading-panel" role="status">
      <div class="user-loading-head">
        <div class="user-loading-mark user-loading-sheen" aria-hidden="true"></div>
        <div>
          <div class="user-loading-title user-loading-sheen" aria-hidden="true"></div>
          <div class="user-loading-subtitle user-loading-sheen" aria-hidden="true"></div>
        </div>
      </div>
      <div class="user-loading-stats" aria-hidden="true">
        <div class="user-loading-stat"><div class="user-loading-line short user-loading-sheen"></div><div class="user-loading-value user-loading-sheen"></div></div>
        <div class="user-loading-stat"><div class="user-loading-line short user-loading-sheen"></div><div class="user-loading-value user-loading-sheen"></div></div>
      </div>
      <div class="user-loading-card" aria-hidden="true">
        <div class="user-loading-card-head user-loading-sheen"></div>
        <div class="user-loading-fields">
          <div class="user-loading-field user-loading-sheen"></div><div class="user-loading-field user-loading-sheen"></div>
          <div class="user-loading-field user-loading-sheen"></div><div class="user-loading-field user-loading-sheen"></div>
        </div>
      </div>
      <div class="user-loading-card" aria-hidden="true">
        <div class="user-loading-card-head user-loading-sheen"></div>
        <div class="user-loading-fields">
          <div class="user-loading-field user-loading-sheen"></div><div class="user-loading-field user-loading-sheen"></div>
          <div class="user-loading-field user-loading-sheen"></div><div class="user-loading-field user-loading-sheen"></div>
        </div>
      </div>
    </div>
  </div>

  <div id="splash" aria-label="Loading">
    <div>
      <h1 id="splash-title">Welcome</h1>
      <div class="splash-subtitle">Z28 • TELEGRAM ATTENDANCE</div>
    </div>
  </div>

  <main class="wrap" id="app">
    <div class="top">
      <div>
        <h1 id="title">⚙️ Admin Panel</h1>
        <div class="user-greeting" id="user-greeting" aria-live="polite"></div>
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
        <button class="switch-group" id="switch-group" type="button" hidden aria-label="Switch group">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 7h10l-2.5-2.5"></path>
            <path d="M17 7l-2.5 2.5"></path>
            <path d="M17 17H7l2.5 2.5"></path>
            <path d="M7 17l2.5-2.5"></path>
          </svg>
          <span id="switch-group-label">Switch</span>
        </button>
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
            <button class="admin-notification-button" id="admin-notifications-button" type="button" aria-label="Notifications" aria-expanded="false">
              <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>
              <span class="admin-notification-badge" id="admin-notification-badge">0</span>
            </button>
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

        <div class="admin-notification-panel" id="admin-notification-panel" aria-label="Notifications" aria-hidden="true">
          <div class="admin-notification-head">
            <div><div class="admin-notification-title">Notifications</div><div class="admin-notification-sub" id="admin-notification-sub">System and dashboard errors</div></div>
            <button class="admin-notification-close" id="admin-notification-close" type="button" aria-label="Close notifications">×</button>
          </div>
          <div class="admin-notification-list" id="admin-notification-list"><div class="admin-notification-empty">No notifications yet.</div></div>
        </div>

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
                <div class="admin-health-card"><div class="admin-health-head"><div class="admin-health-name">MongoDB Storage</div><span class="admin-health-dot" id="health-mongodb-dot"></span></div><div class="admin-health-value" id="health-mongodb-value">Checking…</div><div class="admin-health-meta" id="health-mongodb-meta">Storage protection status</div></div>
              </div>
              <div class="admin-health-meta">
                <div class="admin-health-meta-card"><div class="admin-health-meta-label">Overall status</div><div class="admin-health-meta-value" id="health-overall">Checking…</div></div>
                <div class="admin-health-meta-card"><div class="admin-health-meta-label">Uptime</div><div class="admin-health-meta-value" id="health-uptime">—</div></div>
                <div class="admin-health-meta-card"><div class="admin-health-meta-label">Memory</div><div class="admin-health-meta-value" id="health-memory">—</div><div class="admin-health-meta" id="health-memory-meta">Memory thresholds</div></div>
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

    <section class="panel-only-user user-dashboard-error-screen" id="user-dashboard-error-screen" aria-live="assertive" hidden>
      <div class="user-dashboard-error-message">
        <div class="user-dashboard-error-icon" aria-hidden="true">!</div>
        <strong id="user-dashboard-error-title">Unable to load your dashboard right now.</strong>
        <span id="user-dashboard-error-lead">Something went wrong while loading your dashboard. Your saved settings were not changed.</span>
        <button class="user-dashboard-error-retry" id="user-dashboard-error-retry" type="button">Try Again</button>
      </div>
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
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9S9.6 15.5 9.6 12 10.8 5.5 12 3z"></path></svg>
              </button>
              <div class="user-language-menu" id="user-dashboard-language-menu" hidden>
                <button class="user-language-option active" type="button" data-user-lang="en">English</button>
                <button class="user-language-option" type="button" data-user-lang="my">Burmese</button>
                <button class="user-language-option" type="button" data-user-lang="zh">Chinese (Simplified)</button>
              </div>
            </div>
          </div>
        </div>

        <div class="user-tab-shell" id="user-dashboard-page-shell">
          <div class="user-tab-panel active" id="user-settings-tab">
            <div class="user-dashboard-section-label">Admin Settings</div>

            <div class="user-group-box compact" id="user-group-activities-card">
              <div class="user-group-box-title" id="user-group-activities-title">Group Activities</div>
              <div class="user-group-name" id="user-group-name"></div>
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
        </div>
      </div>

        <div class="user-about-page" id="user-about-page" hidden>
          <div class="user-page-head user-about-page-head">
            <div>
              <h2 class="user-page-title" id="user-about-title">About</h2>
              <div class="user-page-sub" id="user-about-sub">App information and credits</div>
            </div>
          </div>

          <div class="user-about-grid">
            <article class="user-about-card">
              <div class="user-about-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 4.5h10"></path><path d="M6 8.5h12"></path>
                  <path d="M8 4.5v15"></path><path d="M16 4.5v15"></path><path d="M8 19.5h8"></path>
                </svg>
              </div>
              <div class="user-about-copy-block">
                <div class="user-about-label" id="user-about-bot-name-label">Bot</div>
                <div class="user-about-value">Z28</div>
              </div>
            </article>

            <article class="user-about-card">
              <div class="user-about-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="4" width="14" height="16" rx="3"></rect>
                  <path d="M8.5 8h7"></path><path d="M8.5 12h4.5"></path><path d="M8.5 16h6"></path>
                </svg>
              </div>
              <div class="user-about-copy-block">
                <div class="user-about-label" id="user-about-bot-version-label">Bot Version</div>
                <div class="user-about-value">1.0.0</div>
              </div>
            </article>

            <article class="user-about-card">
              <div class="user-about-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="4" width="14" height="16" rx="3"></rect>
                  <path d="M8.5 8h7"></path><path d="M8.5 12h4.5"></path><path d="M8.5 16h6"></path>
                </svg>
              </div>
              <div class="user-about-copy-block">
                <div class="user-about-label" id="user-about-mini-version-label">Mini App Version</div>
                <div class="user-about-value">1.0.0</div>
              </div>
            </article>

            <details class="user-about-card user-about-details">
              <summary>
                <span class="user-about-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a2 2 0 0 1 2 2v12l-3-1.5L12 18l-3-1.5L6 18V6a2 2 0 0 1 2-2Z"></path></svg>
                </span>
                <span class="user-about-summary-copy">
                  <span class="user-about-label" id="user-about-terms-label">Terms of Use</span>
                  <span class="user-about-summary-arrow">›</span>
                </span>
              </summary>
              <div class="user-about-copy" id="user-about-terms-copy">Use this Mini App only for the attendance and group-management functions provided by the bot. Keep your Telegram account secure and use the service according to your group rules.</div>
            </details>

            <details class="user-about-card user-about-details">
              <summary>
                <span class="user-about-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.8-2.9 7.9-7 10-4.1-2.1-7-5.2-7-10V6l7-3Z"></path><path d="m9.5 12 1.7 1.7 3.5-3.5"></path></svg>
                </span>
                <span class="user-about-summary-copy">
                  <span class="user-about-label" id="user-about-privacy-label">Privacy</span>
                  <span class="user-about-summary-arrow">›</span>
                </span>
              </summary>
              <div class="user-about-copy" id="user-about-privacy-copy">The Mini App uses Telegram WebApp account information to verify access and show the groups available to you. Information shown in this dashboard is used only for the bot features provided to your account and groups.</div>
            </details>

            <article class="user-about-card user-about-credit-card">
              <div class="user-about-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 14.6 9l5.9.8-4.3 4.1 1 5.8-5.2-2.8 1-5.8-4.3-4.1L9.4 9 12 3.5Z"></path></svg>
              </div>
              <div class="user-about-copy-block">
                <div class="user-about-label" id="user-about-credits-label">Credits</div>
                <div class="user-about-value">Chan Myae</div>
                <div class="user-about-credit-sub" id="user-about-creator-label">Creator</div>
              </div>
            </article>
          </div>
        </div>

        <nav class="user-tabbar" id="user-tabbar" hidden aria-label="User dashboard sections">
          <button class="user-tab active" type="button" data-user-tab="dashboard" aria-selected="true">
            <span class="user-tab-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="4" y="4" width="6" height="6" rx="1.5"></rect><rect x="14" y="4" width="6" height="6" rx="1.5"></rect>
                <rect x="4" y="14" width="6" height="6" rx="1.5"></rect><rect x="14" y="14" width="6" height="6" rx="1.5"></rect>
              </svg>
            </span>
            <span id="user-dashboard-tab-label">Dashboard</span>
          </button>
          <button class="user-tab" type="button" data-user-tab="about" aria-selected="false">
            <span class="user-tab-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8.5"></circle><path d="M12 10.5v5"></path><path d="M12 7.25h.01"></path>
              </svg>
            </span>
            <span id="user-about-tab-label">About</span>
          </button>
        </nav>

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
      var userPageMode = window.location.pathname === "/user";
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
          idMismatch: "The entered ID does not match your Telegram account."
          dashboardLoadError: "暂时无法加载您的控制面板。",
          dashboardLoadErrorLead: "加载控制面板时出现问题。您已保存的设置没有被更改。",
          retry: "再试一次"
          dashboardLoadError: "Unable to load your dashboard right now.",
          dashboardLoadErrorLead: "Something went wrong while loading your dashboard. Your saved settings were not changed.",
          retry: "Try Again"
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
        document.getElementById("user-dashboard-error-lead").textContent=tUser("dashboardLoadErrorLead");
        var retry=document.getElementById("user-dashboard-error-retry");
        retry.textContent=tUser("retry");retry.disabled=false;screen.hidden=false;title.textContent=tUser("dashboardLoadError");
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
        if (showLoader) showUserLoading(true);
        try {
          var data = await apiUserDashboard(telegramUserId,groupId);
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
        } catch (error) {
          if (requestId === userDashboardRequestId && !window.__z28AboutOpen && !isUserSettingsEditing()) showUserDashboardError(error, groupId);
          throw error;
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

        setPanelVisibility("admin");
        document.body.classList.remove("user-verification-page", "admin-verification-page", "user-dashboard-page");
        title.textContent = "Administration";
        await createAdminSession();
        await load();
        hideSplash();
        startAdminDashboardRefresh();
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
  </script>
</body>
</html>`;