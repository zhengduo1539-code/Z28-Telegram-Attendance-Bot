import { Router, type IRouter, type Request, type Response } from "express";
import { getTelegramInitData, validateTelegramInitData } from "./admin-auth";
import { getAdminApiContext } from "./admin-runtime";
import type { ActivityKind } from "./types";

const activityKinds: ActivityKind[] = ["eat", "wc", "smoke", "wcd"];
const defaultCountLimits = { eat: null, wc: 7, smoke: 7, wcd: 2 } as const;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const isGroupAdmin = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  chatId: number,
  userId: number,
): Promise<boolean> => {
  try {
    const chat = await context.telegram.getChat(chatId);
    if (chat.type !== "group" && chat.type !== "supergroup") return false;
    const member = await context.telegram.getChatMember(chatId, userId);
    return member.status === "creator" || member.status === "administrator";
  } catch {
    return false;
  }
};

const parseGroupId = (startParam: string | undefined): number | undefined => {
  if (!startParam?.startsWith("group_")) return undefined;
  const raw = startParam.slice("group_".length);
  if (!/^-\d+$/.test(raw)) return undefined;
  const chatId = Number(raw);
  return Number.isSafeInteger(chatId) && chatId < 0 ? chatId : undefined;
};

const requireGroupAdmin = async (req: Request, res: Response) => {
  const context = getAdminApiContext();
  if (!context?.config.token) {
    res.status(503).json({ error: "Group Admin API is not available." });
    return undefined;
  }

  const validated = validateTelegramInitData(
    getTelegramInitData(req),
    context.config.token,
  );
  if (!validated) {
    res.status(401).json({ error: "Invalid or expired Telegram session." });
    return undefined;
  }

  const groupId = parseGroupId(validated.startParam);
  if (groupId === undefined) {
    res.status(400).json({ error: "A valid group Mini App context is required." });
    return undefined;
  }

  if (!(await isGroupAdmin(context, groupId, validated.user.id))) {
    res.status(403).json({ error: "Group administrator access required." });
    return undefined;
  }

  return { context, user: validated.user, groupId };
};

const serializeCountLimits = (
  limits: Partial<Record<ActivityKind, number>>,
) => ({
  eat: limits.eat ?? defaultCountLimits.eat,
  wc: limits.wc ?? defaultCountLimits.wc,
  smoke: limits.smoke ?? defaultCountLimits.smoke,
  wcd: limits.wcd ?? defaultCountLimits.wcd,
});

const resolveTargetGroup = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  input: string,
) => {
  const value = input.trim();
  const idMatch = value.match(/^-\d+$/);
  const publicLinkMatch = value.match(
    /^(?:https?:\/\/)?(?:www\.)?t\.me\/([A-Za-z0-9_]{5,})\/?$/i,
  );
  const username =
    publicLinkMatch
      ? `@${publicLinkMatch[1]}`
      : value.startsWith("@")
        ? value
        : undefined;
  const chatId = idMatch ? Number(value) : username;
  if (
    chatId === undefined ||
    (typeof chatId === "number" && !Number.isSafeInteger(chatId))
  ) {
    return undefined;
  }

  try {
    const chat = await context.telegram.getChat(chatId);
    if (chat.type !== "group" && chat.type !== "supergroup") return undefined;
    return {
      id: chat.id,
      title: chat.title,
      username: chat.username,
    };
  } catch {
    return undefined;
  }
};

export const groupAdminApiRouter: IRouter = Router();

groupAdminApiRouter.get("/summary", async (req, res) => {
  const auth = await requireGroupAdmin(req, res);
  if (!auth) return;

  const [group, limits, rawCountLimits, connection] = await Promise.all([
    auth.context.telegram.getChat(auth.groupId),
    auth.context.attendance.getActivityLimits(),
    auth.context.attendance.getActivityCountLimits(),
    auth.context.attendance.getConnectedGroup(auth.groupId),
  ]);

  res.setHeader("Cache-Control", "no-store");
  res.json({
    user: auth.user,
    group: {
      id: group.id,
      title: group.title || String(group.id),
      username: group.username,
    },
    activityLimits: limits,
    countLimits: serializeCountLimits(rawCountLimits),
    connection: connection
      ? {
          targetChatId: connection.targetChatId,
          targetGroupName: connection.targetGroupName,
          targetUsername: connection.targetUsername,
          connectedAt: connection.connectedAt,
        }
      : null,
  });
});

groupAdminApiRouter.put("/activity-limits", async (req, res) => {
  const auth = await requireGroupAdmin(req, res);
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

groupAdminApiRouter.put("/count-limits", async (req, res) => {
  const auth = await requireGroupAdmin(req, res);
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

groupAdminApiRouter.put("/connect", async (req, res) => {
  const auth = await requireGroupAdmin(req, res);
  if (!auth) return;

  const targetInput =
    typeof req.body?.target === "string" ? req.body.target.trim() : "";
  const target = await resolveTargetGroup(auth.context, targetInput);

  if (!target) {
    res.status(400).json({ error: "Unable to find or access the target group." });
    return;
  }

  if (target.id === auth.groupId) {
    res.status(400).json({ error: "The target group cannot be the current group." });
    return;
  }

  const sourceGroup = await auth.context.telegram.getChat(auth.groupId);
  await auth.context.attendance.setConnectedGroup(
    auth.groupId,
    sourceGroup.title,
    sourceGroup.username,
    target.id,
    target.title || String(target.id),
    target.username,
  );

  res.setHeader("Cache-Control", "no-store");
  res.json({
    connection: {
      targetChatId: target.id,
      targetGroupName: target.title || String(target.id),
      targetUsername: target.username,
    },
  });
});
