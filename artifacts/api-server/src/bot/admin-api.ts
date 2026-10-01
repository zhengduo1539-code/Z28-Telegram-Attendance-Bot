import { Router, type IRouter, type Request, type Response } from "express";
import { getHeapStatistics } from "node:v8";
import { isConfiguredAdmin, getTelegramInitData, validateTelegramInitData, createAdminSession, getAdminSession } from "./admin-auth";
import { getAdminApiContext } from "./admin-runtime";
import { adminMiniAppHtml } from "./admin-mini-app";
import type { ActivityKind, AuditLogEntry } from "./types";

const activityKinds: ActivityKind[] = ["eat", "wc", "smoke", "wcd"];
const defaultCountLimits = { eat: null, wc: 7, smoke: 7, wcd: 2 } as const;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const sendUnauthorized = (res: Response, status: number, error: string) => {
  res.status(status).json({ error });
};

const requireAdmin = (req: Request, res: Response) => {
  const context = getAdminApiContext();
  if (!context?.config.token) {
    sendUnauthorized(res, 503, "Admin API is not available.");
    return undefined;
  }

  const sessionToken = req.header("x-admin-session")?.trim() || "";
  const sessionUser = sessionToken ? getAdminSession(sessionToken, context.config.token) : undefined;
  if (sessionUser) return { context, user: sessionUser };

  const validated = validateTelegramInitData(
    getTelegramInitData(req),
    context.config.token,
  );
  if (!validated) {
    sendUnauthorized(res, 401, "Invalid or expired Telegram session.");
    return undefined;
  }

  if (
    !isConfiguredAdmin(
      validated.user.id,
      context.config.botOwnerId,
      context.config.adminIds,
    )
  ) {
    sendUnauthorized(res, 403, "Admin access required.");
    return undefined;
  }

  return { context, user: validated.user };
};

const recordAdminAudit = async (
  auth: { context: NonNullable<ReturnType<typeof getAdminApiContext>>; user: { id: number; first_name?: string; last_name?: string; username?: string } },
  action: string,
  target: string,
  details: string,
) => {
  const actorName = [auth.user.first_name, auth.user.last_name].filter(Boolean).join(" ") || auth.user.username || String(auth.user.id);
  const role = auth.user.id === auth.context.config.botOwnerId ? "owner" : "administrator";
  const entry: AuditLogEntry = {
    id: Date.now().toString(36) + "-" + auth.user.id + "-" + Math.random().toString(36).slice(2, 8),
    actorUserId: auth.user.id,
    actorName,
    role,
    action,
    target,
    details: details.length > 240 ? details.slice(0, 237) + "..." : details,
    createdAt: new Date().toISOString(),
  };
  await auth.context.attendance.createAuditLog(entry);
};

const serializeCountLimits = (
  limits: Partial<Record<ActivityKind, number>>,
) => ({
  eat: limits.eat ?? defaultCountLimits.eat,
  wc: limits.wc ?? defaultCountLimits.wc,
  smoke: limits.smoke ?? defaultCountLimits.smoke,
  wcd: limits.wcd ?? defaultCountLimits.wcd,
});

export const adminApiRouter: IRouter = Router();

adminApiRouter.get("/notifications", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const requestedPageSize = Number(req.query.pageSize);
  const pageSize =
    Number.isSafeInteger(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, 50)
      : 30;
  const result = await auth.context.attendance.listAuditLogs({
    action: "notification.error",
    page: 1,
    pageSize,
  });

  res.setHeader("Cache-Control", "no-store");
  res.json({
    notifications: result.logs.map((log) => ({
      id: log.id,
      title: log.target || "System Error",
      message: log.details,
      createdAt: log.createdAt,
      severity: "error",
    })),
    total: result.total,
    latestCreatedAt: result.logs[0]?.createdAt || null,
  });
});

adminApiRouter.post("/notifications", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "System Error";
  const source = typeof req.body?.source === "string" ? req.body.source.trim().slice(0, 120) : "Admin Dashboard";
  const status = Number(req.body?.status);

  if (!message || message.length > 2000) {
    res.status(400).json({ error: "Notification message must be between 1 and 2000 characters." });
    return;
  }

  const statusText = Number.isInteger(status) && status > 0 ? "HTTP " + String(status) : "Client error";
  await recordAdminAudit(
    auth,
    "notification.error",
    title.slice(0, 120) || "System Error",
    "[" + source + "] " + statusText + ": " + message,
  );

  res.setHeader("Cache-Control", "no-store");
  res.status(201).json({ ok: true });
});

adminApiRouter.post("/session", async (req, res) => {
  const context = getAdminApiContext();
  if (!context?.config.token) {
    sendUnauthorized(res, 503, "Admin API is not available.");
    return;
  }
  const validated = validateTelegramInitData(getTelegramInitData(req), context.config.token);
  if (!validated) {
    sendUnauthorized(res, 401, "Invalid or expired Telegram session.");
    return;
  }
  if (!isConfiguredAdmin(validated.user.id, context.config.botOwnerId, context.config.adminIds)) {
    sendUnauthorized(res, 403, "Admin access required.");
    return;
  }
  const session = createAdminSession(validated.user, context.config.token);
  res.setHeader("Cache-Control", "no-store");
  res.json({ session, expiresInSeconds: 30 * 60 });
});

adminApiRouter.post("/maintenance/audit-retention", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const requestedDays = Number(req.body?.retentionDays);
  const retentionDays =
    Number.isSafeInteger(requestedDays) && requestedDays >= 30 && requestedDays <= 3650
      ? requestedDays
      : 180;

  const cutoff = new Date(Date.now() - retentionDays * 86_400_000);
  const deleted = await auth.context.attendance.deleteAuditLogsBefore(cutoff);

  await recordAdminAudit(
    auth,
    "audit_logs.retention_cleanup",
    "audit_logs",
    "Deleted " + deleted + " audit log(s) older than " + retentionDays + " days.",
  );

  res.setHeader("Cache-Control", "no-store");
  res.json({ retentionDays, deleted, cutoff: cutoff.toISOString() });
});

adminApiRouter.get("/backup", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const snapshot = await auth.context.attendance.snapshot();
  const activeActivities = await auth.context.attendance.listActiveActivities();
  const backup = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    source: "z28-telegram-attendance-bot",
    state: {
      ...snapshot,
      activeActivities: Object.fromEntries(
        activeActivities.map((activity) => [
          `${activity.chatId}:${activity.userId}`,
          activity,
        ]),
      ),
    },
  };

  await recordAdminAudit(
    auth,
    "backup.exported",
    "bot_state",
    "Full data backup exported.",
  );

  const filename = "z28-attendance-backup-" + new Date().toISOString().replace(/[:.]/g, "-") + ".json";
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
  res.send(JSON.stringify(backup, null, 2));
});

adminApiRouter.get("/storage-health", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const health = await auth.context.attendance.getStorageHealth();
  if (!health) {
    res.status(503).json({ error: "MongoDB storage metrics are unavailable." });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.json(health);
});

adminApiRouter.post("/maintenance/history-retention", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const requestedDays = Number(req.body?.days);
  const days = Number.isInteger(requestedDays) && requestedDays >= 30 && requestedDays <= 3650
    ? requestedDays
    : auth.context.config.historyRetentionDays;

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const removed = await auth.context.attendance.pruneHistoryBefore(cutoff);

  await recordAdminAudit(
    auth,
    "history_retention.cleaned",
    "attendance_history",
    "Removed " + removed.records + " records, " + removed.warnings + " warnings, and " + removed.pendingConnects + " stale connection requests using a " + days + "-day retention window.",
  );

  res.setHeader("Cache-Control", "no-store");
  res.json({ retentionDays: days, cutoff: cutoff.toISOString(), removed });
});

adminApiRouter.post("/broadcast", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 4000) {
    res.status(400).json({ error: "Message must be between 1 and 4000 characters." });
    return;
  }

  const snapshot = await auth.context.attendance.snapshot();
  const chatIds = Array.from(
    new Set(
      Object.values(snapshot.users)
        .filter((profile) => profile.chatId > 0)
        .map((profile) => profile.chatId),
    ),
  );

  const escapeHtml = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br>");
  let sent = 0;
  let failed = 0;
  const failures: Array<{ chatId: number; error: string }> = [];

  for (const chatId of chatIds) {
    try {
      await auth.context.telegram.sendMessage(chatId, safeMessage);
      sent += 1;
    } catch (error: unknown) {
      failed += 1;
      failures.push({
        chatId,
        error: error instanceof Error ? error.message.slice(0, 200) : "Telegram delivery failed",
      });
    }
    if (sent + failed < chatIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  await recordAdminAudit(
    auth,
    "broadcast.sent",
    "private_users",
    "Broadcast delivered to " + sent + " users; " + failed + " failed.",
  );

  res.setHeader("Cache-Control", "no-store");
  res.json({
    total: chatIds.length,
    sent,
    failed,
    failures: failures.slice(0, 20),
  });
});

adminApiRouter.get("/telegram-metrics", (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  res.setHeader("Cache-Control", "no-store");
  res.json(auth.context.telegram.getApiMetrics());
});

adminApiRouter.get("/health", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const startedAt = Date.now();
  let storageStatus = "healthy";
  let storageLatencyMs = 0;
  let telegramStatus = "healthy";
  let telegramLatencyMs = 0;

  const storageStarted = Date.now();
  try {
    await auth.context.attendance.snapshot();
    storageLatencyMs = Date.now() - storageStarted;
  } catch {
    storageStatus = "error";
    storageLatencyMs = Date.now() - storageStarted;
  }

  const telegramStarted = Date.now();
  try {
    await auth.context.telegram.call<{ id: number; username?: string }>("getMe");
    telegramLatencyMs = Date.now() - telegramStarted;
  } catch {
    telegramStatus = "error";
    telegramLatencyMs = Date.now() - telegramStarted;
  }

  const services = {
    api: { status: "healthy", latencyMs: Date.now() - startedAt },
    storage: { status: storageStatus, latencyMs: storageLatencyMs },
    telegram: { status: telegramStatus, latencyMs: telegramLatencyMs },
  };
  const memoryUsage = process.memoryUsage();
  const rssMb = memoryUsage.rss / 1024 / 1024;
  const heapUsedMb = memoryUsage.heapUsed / 1024 / 1024;
  const heapTotalMb = memoryUsage.heapTotal / 1024 / 1024;
  const heapLimitMb = getHeapStatistics().heap_size_limit / 1024 / 1024;
  const heapUsagePercent = heapLimitMb > 0 ? (heapUsedMb / heapLimitMb) * 100 : 0;
  const rssUsagePercent = (rssMb / auth.context.config.memoryRssLimitMb) * 100;
  const heapStatus =
    heapUsagePercent >= auth.context.config.memoryHeapCriticalPercent
      ? "critical"
      : heapUsagePercent >= auth.context.config.memoryHeapWarnPercent
        ? "warning"
        : "healthy";
  const rssStatus =
    rssUsagePercent >= auth.context.config.memoryRssCriticalPercent
      ? "critical"
      : rssUsagePercent >= auth.context.config.memoryRssWarnPercent
        ? "warning"
        : "healthy";
  const memoryStatus =
    heapStatus === "critical" || rssStatus === "critical"
      ? "critical"
      : heapStatus === "warning" || rssStatus === "warning"
        ? "warning"
        : "healthy";
  const healthy =
    Object.values(services).every((service) => service.status === "healthy") &&
    memoryStatus === "healthy";

  res.setHeader("Cache-Control", "no-store");
  res.json({
    status: healthy ? "healthy" : "degraded",
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      status: memoryStatus,
      rssMb: Math.round(rssMb * 10) / 10,
      heapUsedMb: Math.round(heapUsedMb * 10) / 10,
      heapTotalMb: Math.round(heapTotalMb * 10) / 10,
      heapLimitMb: Math.round(heapLimitMb * 10) / 10,
      heapUsagePercent: Math.round(heapUsagePercent * 10) / 10,
      rssUsagePercent: Math.round(rssUsagePercent * 10) / 10,
      heapWarnPercent: auth.context.config.memoryHeapWarnPercent,
      heapCriticalPercent: auth.context.config.memoryHeapCriticalPercent,
      rssLimitMb: auth.context.config.memoryRssLimitMb,
      rssWarnPercent: auth.context.config.memoryRssWarnPercent,
      rssCriticalPercent: auth.context.config.memoryRssCriticalPercent,
      heapStatus,
      rssStatus,
    },
    services,
  });
});

adminApiRouter.get("/summary", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const [stats, activityLimits, rawCountLimits, reminderEnabled] =
    await Promise.all([
      auth.context.attendance.getBotStats(),
      auth.context.attendance.getActivityLimits(),
      auth.context.attendance.getActivityCountLimits(),
      auth.context.attendance.isActivityReminderEnabled(),
    ]);

  res.setHeader("Cache-Control", "no-store");
  const role =
    auth.user.id === auth.context.config.botOwnerId
      ? "owner"
      : "administrator";

  res.json({
    user: auth.user,
    role,
    stats,
    activityLimits,
    countLimits: serializeCountLimits(rawCountLimits),
    reminderEnabled,
  });
});

adminApiRouter.get("/users", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const snapshot = await auth.context.attendance.snapshot();
  const activeActivities = await auth.context.attendance.listActiveActivities();
  const search = typeof req.query.search === "string"
    ? req.query.search.trim().toLowerCase().slice(0, 100)
    : "";
  const status =
    req.query.status === "active" || req.query.status === "inactive"
      ? req.query.status
      : "all";
  const requestedPage = Number(req.query.page);
  const requestedPageSize = Number(req.query.pageSize);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize =
    Number.isSafeInteger(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, 50)
      : 20;

  const warningsByUser = new Map<number, number>();
  for (const warnings of Object.values(snapshot.groupWarnings || {})) {
    for (const warning of warnings) {
      if (warning.chatId > 0) {
        warningsByUser.set(
          warning.userId,
          (warningsByUser.get(warning.userId) || 0) + 1,
        );
      }
    }
  }

  const users = Object.values(snapshot.users)
    .filter((profile) => profile.chatId > 0)
    .map((profile) => {
      const userRecords = snapshot.records.filter(
        (record) =>
          record.chatId === profile.chatId && record.userId === profile.userId,
      );
      const active = activeActivities.find(
        (activity) =>
          activity.chatId === profile.chatId && activity.userId === profile.userId,
      );
      const lastRecord = userRecords.reduce<string | undefined>(
        (latest, record) =>
          !latest || record.endedAt > latest ? record.endedAt : latest,
        undefined,
      );
      return {
        userId: profile.userId,
        chatId: profile.chatId,
        displayName: profile.displayName,
        username: profile.username || null,
        firstSeen: profile.createdAt,
        lastActive:
          active?.startedAt || lastRecord || profile.updatedAt || profile.createdAt,
        totalActivities: userRecords.length,
        warningCount: warningsByUser.get(profile.userId) || 0,
        status: active ? "active" : "inactive",
        currentActivity: active
          ? {
              kind: active.kind,
              startedAt: active.startedAt,
              limitMinutes: active.limitMinutes,
            }
          : null,
      };
    })
    .filter((user) => {
      if (status !== "all" && user.status !== status) return false;
      if (!search) return true;
      return [
        String(user.userId),
        String(user.chatId),
        user.displayName,
        user.username || "",
      ].some((value) => value.toLowerCase().includes(search));
    })
    .sort((left, right) => {
      if (left.status !== right.status) return left.status === "active" ? -1 : 1;
      return left.displayName.localeCompare(right.displayName);
    });

  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  res.setHeader("Cache-Control", "no-store");
  res.json({
    users: users.slice(offset, offset + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
    },
  });
});

adminApiRouter.get("/group-health", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const chatId = Number(req.query.chatId);
  if (!Number.isSafeInteger(chatId) || chatId >= 0) {
    res.status(400).json({ error: "A valid group chat ID is required." });
    return;
  }

  const snapshot = await auth.context.attendance.snapshot();
  const group = snapshot.managedGroups?.[String(chatId)];
  if (!group) {
    res.status(404).json({ error: "Managed group not found." });
    return;
  }

  const checkedAt = new Date().toISOString();
  const startedAt = Date.now();
  const checks: Array<{ name: string; status: "ok" | "error"; latencyMs: number; detail: string }> = [];

  const runCheck = async (name: string, task: () => Promise<string>) => {
    const started = Date.now();
    try {
      const detail = await task();
      checks.push({ name, status: "ok", latencyMs: Date.now() - started, detail });
    } catch (error: unknown) {
      checks.push({
        name,
        status: "error",
        latencyMs: Date.now() - started,
        detail: error instanceof Error ? error.message.slice(0, 240) : "Telegram check failed",
      });
    }
  };

  await runCheck("Telegram access", async () => {
    const chat = await auth.context.telegram.getChat(chatId);
    return chat.type + (chat.title ? " · " + chat.title : "");
  });
  await runCheck("Member count", async () => {
    const count = await auth.context.telegram.getChatMemberCount(chatId);
    return String(count) + " members";
  });

  const connection = snapshot.connectedGroups?.[String(chatId)];
  if (connection) {
    await runCheck("Connected destination", async () => {
      const chat = await auth.context.telegram.getChat(connection.targetChatId);
      return chat.type + (chat.title ? " · " + chat.title : "");
    });
  }

  const healthy = checks.every((check) => check.status === "ok");
  res.setHeader("Cache-Control", "no-store");
  res.json({
    chatId,
    group: { title: group.title, username: group.username || null },
    healthy,
    checks,
    totalLatencyMs: Date.now() - startedAt,
    checkedAt,
  });
});

adminApiRouter.get("/groups", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const snapshot = await auth.context.attendance.snapshot();
  const activeActivities = await auth.context.attendance.listActiveActivities();
  const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase().slice(0, 100) : "";
  const requestedPage = Number(req.query.page);
  const requestedPageSize = Number(req.query.pageSize);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isSafeInteger(requestedPageSize) && requestedPageSize > 0 ? Math.min(requestedPageSize, 50) : 20;

  const groups = Object.values(snapshot.managedGroups || {})
    .map((group) => {
      const memberIds = new Set<number>();
      for (const profile of Object.values(snapshot.users)) {
        if (profile.chatId === group.chatId) memberIds.add(profile.userId);
      }
      const activeCount = activeActivities.filter((activity) => activity.chatId === group.chatId).length;
      const connection = snapshot.connectedGroups?.[String(group.chatId)];
      return {
        chatId: group.chatId,
        title: group.title,
        username: group.username || null,
        addedAt: group.addedAt,
        updatedAt: group.updatedAt,
        memberCount: memberIds.size,
        activeCount,
        connection: connection ? {
          targetChatId: connection.targetChatId,
          targetGroupName: connection.targetGroupName,
          targetUsername: connection.targetUsername || null,
          connectedAt: connection.connectedAt,
        } : null,
      };
    })
    .filter((group) => !search || [
      String(group.chatId), group.title, group.username || "",
      group.connection?.targetGroupName || "", group.connection?.targetUsername || "",
    ].some((value) => value.toLowerCase().includes(search)))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  const total = groups.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  res.setHeader("Cache-Control", "no-store");
  res.json({
    groups: groups.slice(offset, offset + pageSize),
    pagination: { page: safePage, pageSize, total, totalPages },
  });
});

adminApiRouter.get("/export", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const requestedDays = Number(req.query.days);
  const days = requestedDays === 7 || requestedDays === 30 || requestedDays === 90 ? requestedDays : 30;
  const snapshot = await auth.context.attendance.snapshot();
  const now = Date.now();
  const start = now - days * 24 * 60 * 60 * 1000;

  const csvCell = (value: unknown) => {
    const text = String(value ?? "");
    const safe = /^[=+@-]/.test(text) ? "'" + text : text;
    return '"' + safe.replace(/"/g, '""') + '"';
  };

  const rows = [
    ["Activity ID", "User ID", "Display Name", "Group ID", "Activity", "Started At", "Ended At", "Minutes", "Settled By"],
  ];
  for (const record of snapshot.records) {
    const ended = new Date(record.endedAt).getTime();
    if (!Number.isFinite(ended) || ended < start || ended > now) continue;
    rows.push([
      record.id,
      record.userId,
      record.displayName,
      record.chatId,
      record.kind.toUpperCase(),
      record.startedAt,
      record.endedAt,
      (Math.max(0, record.elapsedSeconds || 0) / 60).toFixed(2),
      record.settledBy,
    ]);
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const filename = "z28-attendance-" + days + "d-" + new Date().toISOString().slice(0, 10) + ".csv";
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="' + filename + '"');
  res.send("\uFEFF" + csv);
});

adminApiRouter.get("/analytics", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const requestedDays = Number(req.query.days);
  const days = requestedDays === 7 || requestedDays === 30 || requestedDays === 90 ? requestedDays : 30;
  const snapshot = await auth.context.attendance.snapshot();
  const activeActivities = await auth.context.attendance.listActiveActivities();
  const now = Date.now();
  const start = now - days * 24 * 60 * 60 * 1000;
  const daily = new Map<string, { activities: number; seconds: number; users: Set<number> }>();
  const kindTotals: Record<ActivityKind, { count: number; seconds: number }> = {
    eat: { count: 0, seconds: 0 }, wc: { count: 0, seconds: 0 },
    smoke: { count: 0, seconds: 0 }, wcd: { count: 0, seconds: 0 },
  };
  const validKinds = new Set<ActivityKind>(["eat", "wc", "smoke", "wcd"]);
  for (const record of snapshot.records) {
    const endedDate = new Date(record.endedAt);
    const ended = endedDate.getTime();
    if (
      !Number.isFinite(ended) ||
      ended < start ||
      ended > now ||
      !validKinds.has(record.kind)
    ) continue;
    const day = endedDate.toISOString().slice(0, 10);
    const elapsedSeconds = Number(record.elapsedSeconds);
    const safeSeconds = Number.isFinite(elapsedSeconds)
      ? Math.max(0, elapsedSeconds)
      : 0;
    const bucket = daily.get(day) || { activities: 0, seconds: 0, users: new Set<number>() };
    bucket.activities += 1;
    bucket.seconds += safeSeconds;
    bucket.users.add(record.userId);
    daily.set(day, bucket);
    kindTotals[record.kind].count += 1;
    kindTotals[record.kind].seconds += safeSeconds;
  }
  const dailySeries = Array.from({ length: days }, (_, index) => {
    const date = new Date(now - (days - 1 - index) * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    const bucket = daily.get(key);
    return { date: key, activities: bucket?.activities || 0, minutes: Math.round((bucket?.seconds || 0) / 60), users: bucket?.users.size || 0 };
  });
  const totalActivities = dailySeries.reduce((sum, item) => sum + item.activities, 0);
  const totalMinutes = dailySeries.reduce((sum, item) => sum + item.minutes, 0);
  const uniqueUsers = new Set(snapshot.records.filter((r) => {
    const ended = new Date(r.endedAt).getTime();
    return Number.isFinite(ended) && ended >= start && ended <= now;
  }).map((r) => r.userId)).size;
  const uniqueGroups = new Set(snapshot.records.filter((r) => {
    const ended = new Date(r.endedAt).getTime();
    return Number.isFinite(ended) && ended >= start && ended <= now;
  }).map((r) => r.chatId)).size;
  res.setHeader("Cache-Control", "no-store");
  res.json({
    periodDays: days,
    summary: { totalActivities, totalMinutes, uniqueUsers, uniqueGroups, activeNow: activeActivities.length },
    daily: dailySeries,
    kinds: kindTotals,
  });
});

adminApiRouter.get("/audit-logs", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const requestedPage = Number(req.query.page);
  const requestedPageSize = Number(req.query.pageSize);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isSafeInteger(requestedPageSize) && requestedPageSize > 0 ? Math.min(requestedPageSize, 50) : 20;
  const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const action = typeof req.query.action === "string" ? req.query.action.trim().slice(0, 80) : "";
  const result = await auth.context.attendance.listAuditLogs({ search, action, page, pageSize });
  res.setHeader("Cache-Control", "no-store");
  res.json(result);
});

adminApiRouter.put("/activity-limits", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const kind = typeof req.body?.kind === "string" ? req.body.kind : "";
  const minutes = req.body?.minutes;
  if (!activityKinds.includes(kind as ActivityKind) || !isPositiveInteger(minutes)) {
    res.status(400).json({ error: "Invalid activity limit." });
    return;
  }

  const activityLimits = await auth.context.attendance.setActivityLimit(
    kind as ActivityKind,
    minutes,
  );
  await recordAdminAudit(auth, "activity_limit.updated", kind.toUpperCase(), "Duration limit set to " + String(minutes) + " minutes.");
  res.setHeader("Cache-Control", "no-store");
  res.json({ activityLimits });
});

adminApiRouter.put("/count-limits", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  const kind = typeof req.body?.kind === "string" ? req.body.kind : "";
  const count = req.body?.count;
  if (
    !activityKinds.includes(kind as ActivityKind) ||
    kind === "eat" ||
    !isPositiveInteger(count)
  ) {
    res.status(400).json({ error: "Invalid daily count limit." });
    return;
  }

  const countLimits = await auth.context.attendance.setActivityCountLimit(
    kind as ActivityKind,
    count,
  );
  await recordAdminAudit(auth, "daily_limit.updated", kind.toUpperCase(), "Daily activity limit set to " + String(count) + ".");
  res.setHeader("Cache-Control", "no-store");
  res.json({ countLimits: serializeCountLimits(countLimits) });
});

adminApiRouter.put("/reminder", async (req, res) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;

  if (typeof req.body?.enabled !== "boolean") {
    res.status(400).json({ error: "Reminder enabled must be true or false." });
    return;
  }

  const reminderEnabled =
    await auth.context.attendance.setActivityReminderEnabled(req.body.enabled);
  await recordAdminAudit(auth, "automation.updated", "Overdue Reminder", "Overdue reminder " + (reminderEnabled ? "enabled." : "disabled.") );
  res.setHeader("Cache-Control", "no-store");
  res.json({ reminderEnabled });
});

export const adminPageHandler = (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(adminMiniAppHtml);
};
