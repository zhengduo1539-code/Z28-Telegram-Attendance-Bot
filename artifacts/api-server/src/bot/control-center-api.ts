import { timingSafeEqual } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { getAdminApiContext } from "./admin-runtime";
import type { ActivityKind } from "./types";

export const controlCenterApiRouter = Router();
const kinds: ActivityKind[] = ["eat", "wc", "smoke", "wcd"];

const authorized = (req: Request, res: Response): boolean => {
  const expected = process.env.CONTROL_CENTER_API_TOKEN?.trim() || "";
  const provided = req.header("x-control-center-token") || "";
  if (!expected || !provided) {
    res.status(503).json({ error: "Control Center integration is not configured." });
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
};

controlCenterApiRouter.use((req, res, next) => {
  if (authorized(req, res)) next();
});

controlCenterApiRouter.get("/features", async (_req, res) => {
  const context = getAdminApiContext();
  if (!context) {
    res.status(503).json({ error: "Bot runtime is not ready." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json({
    bot: "z28",
    features: [
      { id: "activity-limits", label: "Activity time limits", writable: true },
      { id: "activity-reminders", label: "Activity reminders", writable: true },
    ],
    activityLimits: await context.attendance.getActivityLimits(),
    remindersEnabled: await context.attendance.isActivityReminderEnabled(),
  });
});

controlCenterApiRouter.put("/activity-limits", async (req, res) => {
  const context = getAdminApiContext();
  if (!context) {
    res.status(503).json({ error: "Bot runtime is not ready." });
    return;
  }
  const kind = req.body?.kind as ActivityKind;
  const minutes = Number(req.body?.minutes);
  if (!kinds.includes(kind) || !Number.isSafeInteger(minutes) || minutes < 1 || minutes > 1440) {
    res.status(400).json({ error: "kind must be eat, wc, smoke, or wcd; minutes must be 1–1440." });
    return;
  }
  const limits = await context.attendance.setActivityLimit(kind, minutes);
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, activityLimits: limits });
});

controlCenterApiRouter.put("/activity-reminders", async (req, res) => {
  const context = getAdminApiContext();
  if (!context) {
    res.status(503).json({ error: "Bot runtime is not ready." });
    return;
  }
  if (typeof req.body?.enabled !== "boolean") {
    res.status(400).json({ error: "enabled must be a boolean." });
    return;
  }
  const enabled = await context.attendance.setActivityReminderEnabled(req.body.enabled);
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, remindersEnabled: enabled });
});
