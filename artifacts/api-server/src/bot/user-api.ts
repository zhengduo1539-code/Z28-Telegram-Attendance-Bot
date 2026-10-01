import { Router, type IRouter, type Request, type Response } from "express";
import {
  getTelegramInitData,
  validateTelegramInitData,
  isConfiguredAdmin,
} from "./admin-auth";
import { getAdminApiContext } from "./admin-runtime";
import type { ActiveActivity, BotState } from "./types";


const localDateKey = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values["year"]}-${values["month"]}-${values["day"]}`;
};

const sendError = (res: Response, status: number, error: string) => {
  res.status(status).json({ error });
};

const requireTelegramUser = (req: Request, res: Response) => {
  const context = getAdminApiContext();
  if (!context?.config.token) {
    sendError(res, 503, "User Mini App is not available.");
    return undefined;
  }

  const validated = validateTelegramInitData(
    getTelegramInitData(req),
    context.config.token,
  );
  if (!validated) {
    sendError(res, 401, "Invalid or expired Telegram session.");
    return undefined;
  }

  return { context, user: validated.user };
};

const discoverGroupIds = (snapshot: BotState) => {
  const ids = new Set<number>();

  for (const group of Object.values(snapshot.managedGroups || {})) {
    if (Number.isSafeInteger(group.chatId) && group.chatId < 0) {
      ids.add(group.chatId);
    }
  }

  // Backward-compatible discovery for groups recorded before managedGroups was introduced.
  for (const profile of Object.values(snapshot.users)) {
    if (profile.chatId < 0) ids.add(profile.chatId);
  }
  for (const activity of Object.values(snapshot.activeActivities)) {
    if (activity.chatId < 0) ids.add(activity.chatId);
  }
  for (const record of snapshot.records) {
    if (record.chatId < 0) ids.add(record.chatId);
  }
  for (const sourceChatId of Object.keys(snapshot.connectedGroups || {})) {
    const id = Number(sourceChatId);
    if (Number.isSafeInteger(id) && id < 0) ids.add(id);
  }

  return [...ids];
};

type DashboardGroup = {
  id: number;
  title: string;
  username?: string;
  memberStatus: "creator" | "administrator";
  today: {
    total: number;
    eat: number;
    wc: number;
    smoke: number;
    wcd: number;
  };
  activeCount: number;
  memberCount: number;
  userActive: ActiveActivity | null;
  connectedTarget: {
    chatId: number;
    name: string;
    username?: string;
  } | null;
};

export const userApiRouter: IRouter = Router();

userApiRouter.get("/mode", (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  res.setHeader("Cache-Control", "no-store");
  res.json({
    user: auth.user,
    isConfiguredAdmin: isConfiguredAdmin(
      auth.user.id,
      auth.context.config.botOwnerId,
      auth.context.config.adminIds,
    ),
  });
});

userApiRouter.post("/dashboard", async (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  const requestedUserId = req.body?.userId;
  if (
    typeof requestedUserId !== "number" ||
    !Number.isSafeInteger(requestedUserId) ||
    requestedUserId <= 0
  ) {
    sendError(res, 400, "Enter a valid Telegram user ID.");
    return;
  }

  if (requestedUserId !== auth.user.id) {
    sendError(res, 403, "The entered user ID does not match your Telegram account.");
    return;
  }

  const snapshot = await auth.context.attendance.snapshot();
  const dayKey = localDateKey(new Date(), auth.context.config.timeZone);
  const groupIds = discoverGroupIds(snapshot);
  const groups: DashboardGroup[] = [];

  for (const groupId of groupIds) {
    try {
      const chat = await auth.context.telegram.getChat(groupId);
      if (chat.type !== "group" && chat.type !== "supergroup") continue;

      const member = await auth.context.telegram.getChatMember(
        groupId,
        requestedUserId,
      );
      if (member.status !== "creator" && member.status !== "administrator") {
        continue;
      }

      const todayRecords = snapshot.records.filter(
        (record) =>
          record.chatId === groupId &&
          localDateKey(new Date(record.endedAt), auth.context.config.timeZone) === dayKey,
      );

      const today = {
        total: todayRecords.length,
        eat: todayRecords.filter((record) => record.kind === "eat").length,
        wc: todayRecords.filter((record) => record.kind === "wc").length,
        smoke: todayRecords.filter((record) => record.kind === "smoke").length,
        wcd: todayRecords.filter((record) => record.kind === "wcd").length,
      };

      const activeCount = Object.values(snapshot.activeActivities).filter(
        (activity) => activity.chatId === groupId,
      ).length;

      const memberCount = await auth.context.telegram.getChatMemberCount(groupId);

      const userActive =
        snapshot.activeActivities[`${groupId}:${requestedUserId}`] || null;

      const connected = snapshot.connectedGroups?.[String(groupId)];
      const connectedTarget = connected
        ? {
            chatId: connected.targetChatId,
            name: connected.targetGroupName,
            ...(connected.targetUsername
              ? { username: connected.targetUsername }
              : {}),
          }
        : null;

      groups.push({
        id: chat.id,
        title: chat.title || String(chat.id),
        ...(chat.username ? { username: chat.username } : {}),
        memberStatus: member.status as "creator" | "administrator",
        today,
        activeCount,
        memberCount,
        userActive,
        connectedTarget,
      });
    } catch {
      // A group the bot can no longer access is not available to the dashboard.
    }
  }

  groups.sort((left, right) => left.title.localeCompare(right.title));

  res.setHeader("Cache-Control", "no-store");
  res.json({
    user: auth.user,
    groups,
    hasGroups: groups.length > 0,
    activityLimits: {
      eat: snapshot.activityLimits?.eat ?? 30,
      wc: snapshot.activityLimits?.wc ?? 7,
      smoke: snapshot.activityLimits?.smoke ?? 7,
      wcd: snapshot.activityLimits?.wcd ?? 15,
    },
    countLimits: {
      eat: snapshot.activityCountLimits?.eat ?? Number.POSITIVE_INFINITY,
      wc: snapshot.activityCountLimits?.wc ?? 7,
      smoke: snapshot.activityCountLimits?.smoke ?? 7,
      wcd: snapshot.activityCountLimits?.wcd ?? 2,
    },
    message:
      groups.length > 0
        ? undefined
        : "No eligible group found. Add the bot to a group and make sure your Telegram account is a group owner or administrator.",
  });
});
