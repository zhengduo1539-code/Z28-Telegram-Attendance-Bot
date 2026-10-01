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
