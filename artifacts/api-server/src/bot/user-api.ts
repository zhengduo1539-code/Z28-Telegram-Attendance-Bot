import { Router, type IRouter, type Request, type Response } from "express";
import {
  getTelegramInitData,
  validateTelegramInitData,
  isConfiguredAdmin,
} from "./admin-auth";
import { getAdminApiContext } from "./admin-runtime";
import type { ActiveActivity, ActivityKind, BotState } from "./types";

const activityKinds: ActivityKind[] = ["eat", "wc", "smoke", "wcd"];
const defaultActivityLimits = { eat: 30, wc: 7, smoke: 7, wcd: 15 };
const defaultCountLimits = { eat: Number.POSITIVE_INFINITY, wc: 7, smoke: 7, wcd: 2 };
const REPORT_MAX_LENGTH = 1200;
const REPORT_MIN_LENGTH = 10;
const REPORT_COOLDOWN_MS = 30_000;
const reportCooldowns = new Map<number, number>();
const reportCategoryLabels = {
  bug: "Bug / Unexpected behavior",
  access: "Access / Verification",
  group: "Group / Permissions",
  settings: "Settings",
  other: "Other",
} as const;

const localDateKey = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${values["year"]}-${values["month"]}-${values["day"]}`;
};

const escapeTelegramHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const notifyConfiguredAdminsOfDashboardFailure = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  userId: number,
  error: unknown,
) => {
  const adminIds = [
    context.config.botOwnerId,
    ...context.config.adminIds,
  ].filter((id): id is number => id !== undefined);
  const recipients = [...new Set(adminIds)];
  if (!recipients.length) return;

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const details = stack && stack !== message ? `\n<pre>${escapeTelegramHtml(stack).slice(0, 3000)}</pre>` : "";
  const text = [
    "⚠️ <b>User Dashboard Error</b>",
    `User ID: <code>${userId}</code>`,
    `Error: <code>${escapeTelegramHtml(message).slice(0, 1000)}</code>`,
    details,
  ].join("\n");

  await Promise.allSettled(
    recipients.map((adminId) => context.telegram.sendMessage(adminId, text)),
  );
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
    if (Number.isSafeInteger(group.chatId) && group.chatId < 0) ids.add(group.chatId);
  }
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

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const isGroupAdmin = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  groupId: number,
  userId: number,
) => {
  try {
    const chat = await context.telegram.getChat(groupId);
    if (chat.type !== "group" && chat.type !== "supergroup") return false;
    const member = await context.telegram.getChatMember(groupId, userId);
    return member.status === "creator" || member.status === "administrator";
  } catch {
    return false;
  }
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
  connectedTarget: { chatId: number; name: string; username?: string } | null;
};

const getVerifiedGroupRole = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  groupId: number,
  userId: number,
): Promise<"creator" | "administrator" | undefined> => {
  const cached = await context.attendance.getMiniAppGroupAccess(userId, groupId);
  if (cached && new Date(cached.expiresAt).getTime() > Date.now()) {
    return cached.role;
  }

  try {
    const member = await context.telegram.getChatMember(groupId, userId);
    const role =
      member.status === "creator"
        ? "creator"
        : member.status === "administrator"
          ? "administrator"
          : undefined;
    if (!role) {
      await context.attendance.clearMiniAppGroupAccess(userId, groupId);
      return undefined;
    }

    await context.attendance.cacheMiniAppGroupAccess(userId, groupId, role);
    return role;
  } catch {
    await context.attendance.clearMiniAppGroupAccess(userId, groupId);
    return undefined;
  }
};

const buildGroup = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  snapshot: BotState,
  groupId: number,
  userId: number,
): Promise<DashboardGroup | undefined> => {
  let chat;
  try {
    chat = await context.telegram.getChat(groupId);
  } catch {
    await context.attendance.clearMiniAppGroupAccess(userId, groupId);
    return undefined;
  }
  if (chat.type !== "group" && chat.type !== "supergroup") {
    await context.attendance.clearMiniAppGroupAccess(userId, groupId);
    return undefined;
  }

  const memberStatus = await getVerifiedGroupRole(context, groupId, userId);
  if (!memberStatus) return undefined;

  const dayKey = localDateKey(new Date(), context.config.timeZone);
  const todayRecords = snapshot.records.filter(
    (record) =>
      record.chatId === groupId &&
      localDateKey(new Date(record.endedAt), context.config.timeZone) === dayKey,
  );
  const connected = snapshot.connectedGroups?.[String(groupId)];

  return {
    id: chat.id,
    title: chat.title || String(chat.id),
    ...(chat.username ? { username: chat.username } : {}),
    memberStatus,
    today: {
      total: todayRecords.length,
      eat: todayRecords.filter((record) => record.kind === "eat").length,
      wc: todayRecords.filter((record) => record.kind === "wc").length,
      smoke: todayRecords.filter((record) => record.kind === "smoke").length,
      wcd: todayRecords.filter((record) => record.kind === "wcd").length,
    },
    activeCount: Object.values(snapshot.activeActivities).filter(
      (activity) => activity.chatId === groupId,
    ).length,
    memberCount: await context.telegram.getChatMemberCount(groupId),
    userActive: snapshot.activeActivities[`${groupId}:${userId}`] || null,
    connectedTarget: connected
      ? {
          chatId: connected.targetChatId,
          name: connected.targetGroupName,
          ...(connected.targetUsername ? { username: connected.targetUsername } : {}),
        }
      : null,
  };
};

export const userApiRouter: IRouter = Router();

type ConnectGroupOption = {
  id: number;
  title: string;
  username?: string;
};

type ConnectConnection = {
  sourceChatId: number;
  targetChatId: number;
  targetGroupName: string;
  targetUsername?: string;
  connectedAt: string;
};

const getInstalledConnectGroups = (snapshot: BotState): ConnectGroupOption[] =>
  Object.values(snapshot.managedGroups || {})
    .filter((group) => Number.isSafeInteger(group.chatId) && group.chatId < 0)
    .map((group) => ({
      id: group.chatId,
      title: group.title || String(group.chatId),
      ...(group.username ? { username: group.username } : {}),
    }))
    .sort((left, right) => left.title.localeCompare(right.title));

const getUserConnectGroups = async (
  context: NonNullable<ReturnType<typeof getAdminApiContext>>,
  snapshot: BotState,
  userId: number,
): Promise<ConnectGroupOption[]> => {
  const installedGroups = getInstalledConnectGroups(snapshot);
  const authorizedGroups = await Promise.all(
    installedGroups.map(async (group) => {
      const role = await getVerifiedGroupRole(context, group.id, userId);
      return role ? group : undefined;
    }),
  );

  return authorizedGroups
    .filter((group): group is ConnectGroupOption => Boolean(group))
    .sort((left, right) => left.title.localeCompare(right.title));
};

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

userApiRouter.get("/connect/groups", async (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  try {
    const snapshot = await auth.context.attendance.snapshot();
    const groups = await getUserConnectGroups(auth.context, snapshot, auth.user.id);
    const connections: Record<string, ConnectConnection> = {};

    for (const group of groups) {
      const connection = snapshot.connectedGroups?.[String(group.id)];
      if (!connection) continue;
      connections[String(group.id)] = {
        sourceChatId: connection.sourceChatId,
        targetChatId: connection.targetChatId,
        targetGroupName: connection.targetGroupName,
        ...(connection.targetUsername ? { targetUsername: connection.targetUsername } : {}),
        connectedAt: connection.connectedAt,
      };
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({ groups, connections });
  } catch (error) {
    console.error("[user-connect] failed to load group options", {
      message: error instanceof Error ? error.message : String(error),
    });
    sendError(res, 500, "Unable to load group connection options.");
  }
});

userApiRouter.post("/connect", async (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  const sourceGroupId = req.body?.sourceGroupId;
  const targetGroupId = req.body?.targetGroupId;
  if (
    !Number.isSafeInteger(sourceGroupId) ||
    sourceGroupId >= 0 ||
    !Number.isSafeInteger(targetGroupId) ||
    targetGroupId >= 0
  ) {
    sendError(res, 400, "Select two valid groups.");
    return;
  }

  if (sourceGroupId === targetGroupId) {
    sendError(res, 400, "Source and target groups must be different.");
    return;
  }

  const snapshot = await auth.context.attendance.snapshot();
  const authorizedGroups = await getUserConnectGroups(auth.context, snapshot, auth.user.id);
  const authorizedIds = new Set(authorizedGroups.map((group) => group.id));
  if (!authorizedIds.has(sourceGroupId) || !authorizedIds.has(targetGroupId)) {
    sendError(
      res,
      403,
      "Both groups must have the bot installed and you must be a group owner or administrator of them.",
    );
    return;
  }

  const sourceGroup = snapshot.managedGroups?.[String(sourceGroupId)];
  const targetGroup = snapshot.managedGroups?.[String(targetGroupId)];
  if (!sourceGroup || !targetGroup) {
    sendError(res, 403, "Both groups are no longer available to the bot.");
    return;
  }

  try {
    const [sourceChat, targetChat] = await Promise.all([
      auth.context.telegram.getChat(sourceGroupId),
      auth.context.telegram.getChat(targetGroupId),
    ]);

    if (
      (sourceChat.type !== "group" && sourceChat.type !== "supergroup") ||
      (targetChat.type !== "group" && targetChat.type !== "supergroup")
    ) {
      sendError(res, 403, "Only Telegram groups can be connected.");
      return;
    }

    await auth.context.attendance.setConnectedGroup(
      sourceGroupId,
      sourceChat.title || sourceGroup.title || String(sourceGroupId),
      sourceChat.username || sourceGroup.username,
      targetGroupId,
      targetChat.title || targetGroup.title || String(targetGroupId),
      targetChat.username || targetGroup.username,
    );
    await auth.context.attendance.clearPendingConnect(sourceGroupId, auth.user.id);

    const connection = await auth.context.attendance.getConnectedGroup(sourceGroupId);
    if (!connection) {
      sendError(res, 500, "The group connection could not be saved.");
      return;
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      connection: {
        sourceChatId: connection.sourceChatId,
        targetChatId: connection.targetChatId,
        targetGroupName: connection.targetGroupName,
        ...(connection.targetUsername ? { targetUsername: connection.targetUsername } : {}),
        connectedAt: connection.connectedAt,
      },
    });
  } catch (error) {
    console.error("[user-connect] failed to connect groups", {
      sourceGroupId,
      targetGroupId,
      userId: auth.user.id,
      message: error instanceof Error ? error.message : String(error),
    });
    sendError(res, 502, "Unable to verify the selected Telegram groups.");
  }
});

userApiRouter.post("/dashboard", async (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  const requestedUserId = req.body?.userId;
  if (!isPositiveInteger(requestedUserId)) {
    sendError(res, 400, "Enter a valid Telegram user ID.");
    return;
  }
  if (requestedUserId !== auth.user.id) {
    sendError(res, 403, "The entered user ID does not match your Telegram account.");
    return;
  }

  const requestedGroupId = req.body?.groupId;
  if (
    requestedGroupId !== undefined &&
    (!Number.isSafeInteger(requestedGroupId) || requestedGroupId >= 0)
  ) {
    sendError(res, 400, "Invalid group.");
    return;
  }

  try {
  const snapshot = await auth.context.attendance.snapshot();
  const groups: DashboardGroup[] = [];
  for (const groupId of discoverGroupIds(snapshot)) {
    try {
      const group = await buildGroup(auth.context, snapshot, groupId, requestedUserId);
      if (group) groups.push(group);
    } catch {
      // Groups that are no longer available to the bot are intentionally omitted.
    }
  }
  groups.sort((left, right) => left.title.localeCompare(right.title));

  if (!groups.length) {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      user: auth.user,
      groups: [],
      hasGroups: false,
      selectionRequired: false,
      message:
        "No eligible group found. Add this bot to a group, then make sure your Telegram account is a group owner or administrator. Groups where the bot is no longer available are not shown.",
    });
    return;
  }

  const selected =
    requestedGroupId === undefined
      ? groups.length === 1
        ? groups[0]
        : undefined
      : groups.find((group) => group.id === requestedGroupId);

  if (requestedGroupId !== undefined && !selected) {
    sendError(res, 403, "You are not an owner or administrator of that group.");
    return;
  }

  if (!selected) {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      user: auth.user,
      groups,
      hasGroups: true,
      selectionRequired: true,
      message: "Select a group to open its dashboard.",
    });
    return;
  }

  const activityLimits = await auth.context.attendance.getActivityLimits(selected.id);
  const countLimits = await auth.context.attendance.getActivityCountLimits(selected.id);
  res.setHeader("Cache-Control", "no-store");
  res.json({
    user: auth.user,
    groups,
    hasGroups: true,
    selectionRequired: false,
    selectedGroupId: selected.id,
    selectedGroup: selected,
    activityLimits: {
      eat: activityLimits.eat ?? defaultActivityLimits.eat,
      wc: activityLimits.wc ?? defaultActivityLimits.wc,
      smoke: activityLimits.smoke ?? defaultActivityLimits.smoke,
      wcd: activityLimits.wcd ?? defaultActivityLimits.wcd,
    },
    countLimits: {
      eat: countLimits.eat ?? defaultCountLimits.eat,
      wc: countLimits.wc ?? defaultCountLimits.wc,
      smoke: countLimits.smoke ?? defaultCountLimits.smoke,
      wcd: countLimits.wcd ?? defaultCountLimits.wcd,
    },
  });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load dashboard data.";
    console.error("[user-dashboard] failed to load dashboard", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    await notifyConfiguredAdminsOfDashboardFailure(
      auth.context,
      requestedUserId,
      error,
    );
    sendError(res, 500, message);
  }
});

userApiRouter.put("/settings", async (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  const groupId = req.body?.groupId;
  if (!Number.isSafeInteger(groupId) || groupId >= 0) {
    sendError(res, 400, "Invalid group.");
    return;
  }
  if (!(await isGroupAdmin(auth.context, groupId, auth.user.id))) {
    sendError(res, 403, "Group administrator access required.");
    return;
  }

  const kind = typeof req.body?.kind === "string" ? req.body.kind : "";
  const type = req.body?.type;
  const value = req.body?.value;
  if (!activityKinds.includes(kind as ActivityKind) || !["duration", "count"].includes(type)) {
    sendError(res, 400, "Invalid group setting.");
    return;
  }
  if (type === "count" && kind === "eat") {
    sendError(res, 400, "Eat daily count is unlimited.");
    return;
  }
  if (!isPositiveInteger(value)) {
    sendError(res, 400, "Setting value must be a positive integer.");
    return;
  }

  if (type === "duration") {
    await auth.context.attendance.setActivityLimit(kind as ActivityKind, value, groupId);
  } else {
    await auth.context.attendance.setActivityCountLimit(kind as ActivityKind, value, groupId);
  }

  const activityLimits = await auth.context.attendance.getActivityLimits(groupId);
  const countLimits = await auth.context.attendance.getActivityCountLimits(groupId);
  res.setHeader("Cache-Control", "no-store");
  res.json({
    activityLimits,
    countLimits: {
      eat: countLimits.eat ?? defaultCountLimits.eat,
      wc: countLimits.wc ?? defaultCountLimits.wc,
      smoke: countLimits.smoke ?? defaultCountLimits.smoke,
      wcd: countLimits.wcd ?? defaultCountLimits.wcd,
    },
  });
});

 
userApiRouter.post("/report", async (req, res) => {
  const auth = requireTelegramUser(req, res);
  if (!auth) return;

  const category = typeof req.body?.category === "string" ? req.body.category.trim() : "";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const groupId = req.body?.groupId;

  if (!Object.prototype.hasOwnProperty.call(reportCategoryLabels, category)) {
    sendError(res, 400, "Select a valid report category.");
    return;
  }
  if (message.length < REPORT_MIN_LENGTH) {
    sendError(res, 400, "Report message is too short.");
    return;
  }
  if (message.length > REPORT_MAX_LENGTH) {
    sendError(res, 400, "Report message is too long.");
    return;
  }
  if (!Number.isSafeInteger(groupId) || groupId >= 0) {
    sendError(res, 400, "Invalid group.");
    return;
  }

  const now = Date.now();
  const previous = reportCooldowns.get(auth.user.id);
  if (previous !== undefined && now - previous < REPORT_COOLDOWN_MS) {
    sendError(res, 429, "Please wait a moment before sending another report.");
    return;
  }

  const groupRole = await getVerifiedGroupRole(auth.context, groupId, auth.user.id);
  if (!groupRole) {
    sendError(res, 403, "You are not authorized to report an issue for this group.");
    return;
  }

  let groupTitle = String(groupId);
  try {
    const chat = await auth.context.telegram.getChat(groupId);
    if (chat.type === "group" || chat.type === "supergroup") {
      groupTitle = chat.title || groupTitle;
    }
  } catch {
    sendError(res, 403, "The selected group is no longer available.");
    return;
  }

  const adminIds = [
    auth.context.config.botOwnerId,
    ...auth.context.config.adminIds,
  ].filter((id): id is number => id !== undefined);
  const recipients = [...new Set(adminIds)];
  if (!recipients.length) {
    sendError(res, 503, "Support reporting is not configured.");
    return;
  }

  reportCooldowns.set(auth.user.id, now);

  const displayName = [
    auth.user.first_name,
    auth.user.last_name,
  ].filter(Boolean).join(" ").trim() || auth.user.username || String(auth.user.id);
  const username = auth.user.username ? `@${auth.user.username}` : "—";
  const timestamp = new Intl.DateTimeFormat("en-GB", {
    timeZone: auth.context.config.timeZone,
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: false,
  }).format(new Date(now));

  const reportText = [
    "🛠️ <b>User Support Report</b>",
    `Category: <b>${escapeTelegramHtml(reportCategoryLabels[category as keyof typeof reportCategoryLabels])}</b>`,
    `User: <b>${escapeTelegramHtml(displayName)}</b>`,
    `Username: <code>${escapeTelegramHtml(username)}</code>`,
    `User ID: <code>${auth.user.id}</code>`,
    `Group: <b>${escapeTelegramHtml(groupTitle)}</b>`,
    `Group ID: <code>${groupId}</code>`,
    `Time: <code>${escapeTelegramHtml(timestamp)}</code>`,
    "",
    "<b>Message</b>",
    `<pre>${escapeTelegramHtml(message).slice(0, REPORT_MAX_LENGTH)}</pre>`,
  ].join("\n");

  const results = await Promise.allSettled(
    recipients.map((adminId) => auth.context.telegram.sendMessage(adminId, reportText)),
  );
  const delivered = results.some((result) => result.status === "fulfilled");
  if (!delivered) {
    reportCooldowns.delete(auth.user.id);
    sendError(res, 502, "Unable to deliver the report to support.");
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true });
});
