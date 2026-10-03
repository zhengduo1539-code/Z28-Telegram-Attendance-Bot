import { adminMiniAppHtml } from "./admin-mini-app";

/**
 * Dedicated User Mini App entry.
 *
 * The server decides whether a Telegram user is allowed to see the Admin
 * Panel or the User Dashboard before this page is served. The mode marker
 * keeps the existing User Dashboard client isolated from the Admin entry
 * point without requiring users to know or provide a separate URL.
 */
export const userMiniAppHtml = adminMiniAppHtml.replace(
  "<head>",
  '<head><script>window.__z28MiniAppMode = "user";</script>',
);
