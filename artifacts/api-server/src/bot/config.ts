import path from "node:path";
import type { ActivityLimits } from "./types";

const positiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseUserId = (value: string | undefined): number | undefined => {
  const parsed = Number(value?.trim());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const parseAdminIds = (value: string | undefined): number[] =>
  (value || "")
    .split(",")
    .map((entry) => parseUserId(entry))
    .filter((entry): entry is number => entry !== undefined);

const DEFAULT_ACTIVITY_LIMITS: ActivityLimits = {
  eat: 30,
  wc: 7,
  smoke: 7,
  wcd: 15,
};

export type BotConfig = {
  token?: string;
  pollIntervalMs: number;
  telegramRequestTimeoutMs: number;
  activityLimits: ActivityLimits;
  dataPath: string;
  timeZone: string;
  botOwnerId?: number;
  adminIds: number[];
  adminMiniAppUrl?: string;
};

const resolveAdminMiniAppUrl = (): string | undefined => {
  const explicit = process.env["ADMIN_MINI_APP_URL"]?.trim();
  const renderBase = process.env["RENDER_EXTERNAL_URL"]?.trim();
  const base = explicit || renderBase;
  if (!base) return undefined;

  try {
    const url = new URL(base);
    if (url.protocol !== "https:") return undefined;

    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (!normalizedPath.endsWith("/admin")) {
      url.pathname = normalizedPath + "/admin";
    } else {
      url.pathname = normalizedPath;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
};

export const getBotConfig = (): BotConfig => ({
  token: process.env["TELEGRAM_BOT_TOKEN"]?.trim() || undefined,
  pollIntervalMs: positiveInteger(process.env["BOT_POLL_INTERVAL_MS"], 1_000),
  telegramRequestTimeoutMs: positiveInteger(
    process.env["BOT_REQUEST_TIMEOUT_MS"],
    40_000,
  ),
  activityLimits: { ...DEFAULT_ACTIVITY_LIMITS },
  dataPath: path.resolve(
    process.env["BOT_DATA_PATH"]?.trim() || "data/m58-bot-state.json",
  ),
  timeZone: "Asia/Rangoon",
  botOwnerId: parseUserId(process.env["BOT_OWNER_ID"]),
  adminIds: parseAdminIds(process.env["ADMIN_IDS"]),
  adminMiniAppUrl: resolveAdminMiniAppUrl(),
});
