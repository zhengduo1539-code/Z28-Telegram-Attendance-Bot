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
  mongodbUri?: string;
  timeZone: string;
  botOwnerId?: number;
  adminIds: number[];
  adminMiniAppUrl?: string;
  userMiniAppUrl?: string;
  historyRetentionDays: number;
  mongodbStorageLimitMb: number;
  mongodbStorageWarnPercent: number;
  mongodbStorageCriticalPercent: number;
  mongodbEmergencyRetentionDays: number;
  memoryHeapWarnPercent: number;
  memoryHeapCriticalPercent: number;
  memoryRssLimitMb: number;
  memoryRssWarnPercent: number;
  memoryRssCriticalPercent: number;
};

const MINI_APP_PATHS = { admin: "/admin", user: "/user-app" } as const;

const resolveMiniAppUrl = (target: "admin" | "user"): string | undefined => {
  const explicit = process.env["ADMIN_MINI_APP_URL"]?.trim();
  const renderBase = process.env["RENDER_EXTERNAL_URL"]?.trim();
  const base = explicit || renderBase;
  if (!base) return undefined;

  try {
    const url = new URL(base);
    if (url.protocol !== "https:") return undefined;

    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (normalizedPath.endsWith("/admin") || normalizedPath.endsWith("/user")) {
      url.pathname = normalizedPath.replace(/\/(?:admin|user|user-app)$/, MINI_APP_PATHS[target]);
    } else {
      url.pathname = normalizedPath + MINI_APP_PATHS[target];
    }

    const deployVersion = process.env["RENDER_GIT_COMMIT"]?.trim();
    if (deployVersion) {
      url.searchParams.set("v", deployVersion.slice(0, 12));
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
};

const resolveAdminMiniAppUrl = (): string | undefined => resolveMiniAppUrl("admin");
const resolveUserMiniAppUrl = (): string | undefined => resolveMiniAppUrl("user");

export const getBotConfig = (): BotConfig => ({
  token: process.env["TELEGRAM_BOT_TOKEN"]?.trim() || undefined,
  pollIntervalMs: positiveInteger(process.env["BOT_POLL_INTERVAL_MS"], 1_000),
  telegramRequestTimeoutMs: positiveInteger(
    process.env["BOT_REQUEST_TIMEOUT_MS"],
    40_000,
  ),
  activityLimits: { ...DEFAULT_ACTIVITY_LIMITS },
  dataPath: path.resolve(
    process.env["BOT_DATA_PATH"]?.trim() || "data/z28-bot-state.json",
  ),
  mongodbUri: process.env["MONGODB_URI"]?.trim() || undefined,
  timeZone: "Asia/Rangoon",
  botOwnerId: parseUserId(process.env["BOT_OWNER_ID"]),
  adminIds: parseAdminIds(process.env["ADMIN_IDS"]),
  adminMiniAppUrl: resolveAdminMiniAppUrl(),
  userMiniAppUrl: resolveUserMiniAppUrl(),
  historyRetentionDays: positiveInteger(process.env["HISTORY_RETENTION_DAYS"], 365),
  mongodbStorageLimitMb: positiveInteger(process.env["MONGODB_STORAGE_LIMIT_MB"], 500),
  mongodbStorageWarnPercent: Math.min(Math.max(Number(process.env["MONGODB_STORAGE_WARN_PERCENT"]) || 70, 1), 99),
  mongodbStorageCriticalPercent: Math.min(Math.max(Number(process.env["MONGODB_STORAGE_CRITICAL_PERCENT"]) || 90, 1), 99),
  mongodbEmergencyRetentionDays: Math.max(7, positiveInteger(process.env["MONGODB_EMERGENCY_RETENTION_DAYS"], 30)),
  memoryHeapWarnPercent: Math.min(Math.max(Number(process.env["MEMORY_HEAP_WARN_PERCENT"]) || 80, 1), 99),
  memoryHeapCriticalPercent: Math.min(Math.max(Number(process.env["MEMORY_HEAP_CRITICAL_PERCENT"]) || 90, 1), 99),
  memoryRssLimitMb: positiveInteger(process.env["MEMORY_RSS_LIMIT_MB"], 512),
  memoryRssWarnPercent: Math.min(Math.max(Number(process.env["MEMORY_RSS_WARN_PERCENT"]) || 80, 1), 99),
  memoryRssCriticalPercent: Math.min(Math.max(Number(process.env["MEMORY_RSS_CRITICAL_PERCENT"]) || 90, 1), 99),
});
