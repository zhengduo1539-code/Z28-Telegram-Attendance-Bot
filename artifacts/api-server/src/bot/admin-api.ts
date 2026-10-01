import { Router, type IRouter, type Request, type Response } from "express";
import { isConfiguredAdmin, getTelegramInitData, validateTelegramInitData } from "./admin-auth";
import { getAdminApiContext } from "./admin-runtime";
import { adminMiniAppHtml } from "./admin-mini-app";
import type { ActivityKind } from "./types";

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

const serializeCountLimits = (
  limits: Partial<Record<ActivityKind, number>>,
) => ({
  eat: limits.eat ?? defaultCountLimits.eat,
  wc: limits.wc ?? defaultCountLimits.wc,
  smoke: limits.smoke ?? defaultCountLimits.smoke,
  wcd: limits.wcd ?? defaultCountLimits.wcd,
});

export const adminApiRouter: IRouter = Router();

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
  res.setHeader("Cache-Control", "no-store");
  res.json({ reminderEnabled });
});

export const adminPageHandler = (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(adminMiniAppHtml);
};
