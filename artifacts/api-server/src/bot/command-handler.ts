import type { AttendanceService } from "./attendance-service";
import type { BotConfig } from "./config";
import { activityLabel, getLocale } from "./locales";
import type {
  ActivityKind,
  Locale,
  ReplyKeyboardMarkup,
  TelegramCallbackQuery,
  TelegramMessage,
  TelegramUpdate,
  UserProfile,
} from "./types";
import { TelegramClient } from "./telegram-client";

type Command = {
  name: string;
  argument?: string;
};

const parseCommand = (text: string): Command | undefined => {
  const match = text.trim().match(/^\/([a-z]+)(?:@\w+)?(?:\s+(.+))?$/i);
  return match
    ? { name: match[1].toLowerCase(), argument: match[2]?.trim().toLowerCase() }
    : undefined;
};

const profileFromUser = (
  message: TelegramMessage,
  locale: Locale,
): Omit<UserProfile, "createdAt" | "updatedAt"> | undefined => {
  if (!message.from || message.from.is_bot) return undefined;
  const displayName = [message.from.first_name, message.from.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    chatId: message.chat.id,
    userId: message.from.id,
    displayName: displayName || message.from.username || String(message.from.id),
    username: message.from.username,
    locale,
  };
};

const keyboard = (locale: Locale): ReplyKeyboardMarkup => {
  const text = getLocale(locale).buttons;
  return {
    keyboard: [
      [
        { text: text.wc },
        { text: text.smoke },
        { text: text.wcd },
      ],
      [{ text: text.back, style: "primary" }],
    ],
    resize_keyboard: true,
    is_persistent: true,
    one_time_keyboard: false,
    input_field_placeholder:
      locale === "en" ? "Tap a button to check in" : "请直接点击按钮打卡",
  };
};

const buttonCommand = (value: string): Command | undefined => {
  const commands: Record<string, string> = {
    "上厕所": "wc",
    "抽烟": "smoke",
    WCD: "wcd",
    回座: "back",
    Toilet: "wc",
    Smoke: "smoke",
    Back: "back",
  };
  const name = commands[value.trim()];
  return name ? { name } : undefined;
};

export const ADMIN_MENU_COMMANDS = [
  { command: "start", description: "开始 / Start" },
  { command: "work", description: "Set group work start time" },
  { command: "limit", description: "Set activity time limits" },
  { command: "limits", description: "View activity time limits" },
  { command: "countlimit", description: "Set daily activity count limits" },
  { command: "countlimits", description: "View daily activity count limits" },
  { command: "reminder", description: "Turn overdue reminders on/off" },
  { command: "reminders", description: "View overdue reminder status" },
];

export class CommandHandler {
  private readonly adminMenuScopes = new Set<string>();

  constructor(
    private readonly telegram: TelegramClient,
    private readonly attendance: AttendanceService,
    private readonly config: BotConfig,
  ) {}

  async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (update.callback_query) {
      await this.handleCallback(update.callback_query);
      return;
    }
    if (update.message) await this.handleMessage(update.message);
  }

  private async handleMessage(message: TelegramMessage) {
    if (!message.text || !message.from || message.from.is_bot) return;
    const command = parseCommand(message.text) || buttonCommand(message.text);
    const currentLocale = await this.attendance.getLocale(
      message.chat.id,
      message.from.id,
    );
    const profile = profileFromUser(message, currentLocale);
    if (!profile) return;

    await this.ensureAdminCommandMenu(message, profile.userId);

    const pendingConnect = await this.attendance.getPendingConnect(
      message.chat.id,
      profile.userId,
    );
    const looksLikeConnectTarget =
      /^-?\d+$/.test(message.text.trim()) ||
      /^@?[A-Za-z0-9_]{5,}$/.test(message.text.trim()) ||
      /^(?:https?:\/\/)?(?:www\.)?t\.me\/[A-Za-z0-9_]{5,}\/?$/i.test(
        message.text.trim(),
      );

    // Do not let a pending /connect flow swallow normal commands or
    // reply-keyboard buttons such as "回座". Only target-looking plain text
    // is treated as the pending connection target.
    if (pendingConnect && !command && looksLikeConnectTarget) {
      if (!(await this.isGroupAdmin(message))) {
        await this.telegram.sendMessage(
          message.chat.id,
          getLocale(currentLocale).connectAdminOnly,
          undefined,
          message.message_id,
        );
        return;
      }
      const target = await this.resolveConnectTarget(message.text);
      if (!target) {
        await this.telegram.sendMessage(
          message.chat.id,
          getLocale(currentLocale).connectInvalid,
          undefined,
          message.message_id,
        );
        return;
      }
      await this.attendance.setConnectedGroup(
        target.id,
        target.title,
        target.username,
        message.chat.id,
        message.chat.title || String(message.chat.id),
        message.chat.username,
      );
      await this.attendance.clearPendingConnect(
        message.chat.id,
        profile.userId,
      );
      await this.telegram.sendMessage(
        message.chat.id,
        getLocale(currentLocale).connectSuccess(
          target.title || String(target.id),
          target.id,
        ),
        undefined,
        message.message_id,
      );
      return;
    }

    if (!command) return;
    if (command.name === "lang" || command.name === "language") {
      const requestedLocale =
        command.argument === "eng" ? "en" : command.argument;
      if (requestedLocale !== "zh" && requestedLocale !== "en") {
        await this.telegram.sendMessage(
          message.chat.id,
          command.argument
            ? getLocale(currentLocale).unknownLanguage
            : getLocale(currentLocale).languageUsage,
          undefined,
          message.message_id,
        );
        return;
      }
      const profile = profileFromUser(message, requestedLocale);
      if (!profile) return;
      await this.attendance.setLocale(profile, requestedLocale);
      await this.telegram.sendMessage(
        message.chat.id,
        `${getLocale(requestedLocale).languageChanged}\n\n${getLocale(requestedLocale).help}`,
        keyboard(requestedLocale),
        message.message_id,
      );
      return;
    }

    const locale = profile.locale;
    const text = getLocale(locale);
    let response: string | undefined;
    let markup: ReplyKeyboardMarkup | undefined;
    let addGroupMarkup: import("./types").InlineKeyboardMarkup | undefined;

    switch (command.name) {
      case "start": {
        response = text.startWelcome;
        markup = keyboard(locale);
        if (message.chat.type === "private") {
          const botUsername = await this.telegram.getBotUsername();
          if (botUsername) {
            addGroupMarkup = {
              inline_keyboard: [
                [
                  {
                    text:
                      locale === "en"
                        ? "➕ Add Bot to Your Group"
                        : "➕ 将 Bot 添加到群组",
                    style: "primary",
                    url: `https://t.me/${botUsername}?startgroup=attendance`,
                  },
                ],
              ],
            };
          }
        }
        break;
      }
      case "help":
        response = text.help;
        markup = keyboard(locale);
        break;
      case "work": {
        if (message.chat.type === "private") {
          response = text.workGroupOnly;
          break;
        }
        if (command.argument) {
          if (!(await this.isGroupAdmin(message))) {
            response = text.workAdminOnly;
            break;
          }
          const workTime = command.argument.trim();
          if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(workTime)) {
            response = text.workUsage;
            break;
          }
          const [hours, minutes] = workTime.split(":");
          const normalizedTime = hours.padStart(2, "0") + ":" + minutes;
          await this.attendance.setWorkStartTime(message.chat.id, normalizedTime);
          response = text.workUpdated(normalizedTime);
          break;
        }
        response = await this.attendance.workCheckIn(profile);
        break;
      }
      case "back": {
        const result = await this.attendance.settle(profile);
        response = result.response;
        if (result.timeoutNotification && result.notificationChatId) {
          try {
            await this.telegram.sendMessage(
              result.notificationChatId,
              result.timeoutNotification,
            );
          } catch {
            // Connected target group may no longer be reachable.
          }
        }
        markup = keyboard(locale);
        break;
      }
      case "eat":
      case "wc":
      case "smoke":
      case "wcd":
        response = await this.attendance.startActivity(profile, command.name);
        markup = keyboard(locale);
        break;
      case "offwork":
        response = (await this.attendance.offWork(profile)).response;
        markup = keyboard(locale);
        break;
      case "connect":
        if (message.chat.type === "private") {
          response = text.connectUsage;
          break;
        }
        if (!(await this.isGroupAdmin(message))) {
          response = text.connectAdminOnly;
          break;
        }
        if (command.argument) {
          const target = await this.resolveConnectTarget(command.argument);
          if (!target) {
            response = text.connectInvalid;
            break;
          }
          await this.attendance.setConnectedGroup(
            target.id,
            target.title,
            target.username,
            message.chat.id,
            message.chat.title || String(message.chat.id),
            message.chat.username,
          );
          await this.attendance.clearPendingConnect(
            message.chat.id,
            profile.userId,
          );
          response = text.connectSuccess(
            target.title || String(target.id),
            target.id,
          );
          break;
        }
        await this.attendance.beginConnect(message.chat.id, profile.userId);
        response = text.connectPrompt;
        break;
      case "limits":
      case "limit":
        response = await this.handleLimitCommand(message, profile, command.argument);
        break;
      case "countlimits":
      case "countlimit":
        response = await this.handleCountLimitCommand(message, profile, command.argument);
        break;
      case "reminder":
      case "reminders":
        response = await this.handleReminderCommand(message, profile, command.argument);
        break;
      default:
        response = text.unknownCommand;
    }
    await this.telegram.sendMessage(
      message.chat.id,
      response,
      markup,
      message.message_id,
    );
    if (addGroupMarkup) {
      await this.telegram.sendMessage(
        message.chat.id,
        locale === "en"
          ? "Add the bot to a group to use activity tracking with your team:"
          : "团队需要使用活动打卡功能？请先将 Bot 添加到群组：",
        addGroupMarkup,
      );
    }
  }

  private async ensureAdminCommandMenu(
    message: TelegramMessage,
    userId: number,
  ): Promise<void> {
    const isConfiguredAdmin =
      this.config.botOwnerId === userId || this.config.adminIds.includes(userId);
    if (!isConfiguredAdmin) return;

    const scope =
      message.chat.type === "private"
        ? { type: "chat" as const, chat_id: message.chat.id }
        : message.chat.type === "group" || message.chat.type === "supergroup"
          ? {
              type: "chat_member" as const,
              chat_id: message.chat.id,
              user_id: userId,
            }
          : undefined;

    if (!scope) return;

    const scopeKey =
      scope.type === "chat"
        ? `private:${scope.chat_id}`
        : `member:${scope.chat_id}:${scope.user_id}`;

    if (this.adminMenuScopes.has(scopeKey)) return;

    try {
      await this.telegram.setMyCommands(ADMIN_MENU_COMMANDS, scope);
      this.adminMenuScopes.add(scopeKey);
    } catch {
      // Command-menu configuration must not interrupt normal bot handling.
    }
  }

  private async isGroupAdmin(message: TelegramMessage): Promise<boolean> {
    if (
      message.chat.type !== "group" &&
      message.chat.type !== "supergroup"
    ) {
      return false;
    }
    if (!message.from || message.from.is_bot) return false;
    try {
      const member = await this.telegram.getChatMember(
        message.chat.id,
        message.from.id,
      );
      return member.status === "creator" || member.status === "administrator";
    } catch {
      return false;
    }
  }

  private async resolveConnectTarget(
    input: string,
  ): Promise<{ id: number; title?: string; username?: string } | undefined> {
    const value = input.trim();
    const idMatch = value.match(/^-?\d+$/);
    const publicLinkMatch = value.match(
      /^(?:https?:\/\/)?(?:www\.)?t\.me\/([A-Za-z0-9_]{5,})\/?$/i,
    );
    const username = publicLinkMatch
      ? `@${publicLinkMatch[1]}`
      : value.startsWith("@")
        ? value
        : undefined;
    const chatId = idMatch ? Number(value) : username;
    if (chatId === undefined || (typeof chatId === "number" && !Number.isSafeInteger(chatId))) {
      return undefined;
    }
    try {
      const chat = await this.telegram.getChat(chatId);
      if (chat.type !== "group" && chat.type !== "supergroup") {
        return undefined;
      }
      return {
        id: chat.id,
        title: chat.title,
        username: chat.username,
      };
    } catch {
      return undefined;
    }
  }

  private async handleCountLimitCommand(
    message: TelegramMessage,
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    argument: string | undefined,
  ): Promise<string> {
    const text = getLocale(profile.locale);
    const isAdmin =
      this.config.botOwnerId === profile.userId ||
      this.config.adminIds.includes(profile.userId);
    if (!isAdmin) return text.adminOnly;
    if (message.chat.type !== "private") return text.countLimitPrivate;

    const parts = argument?.split(/\s+/).filter(Boolean) || [];
    if (parts.length === 0) {
      return text.countLimits(await this.attendance.getActivityCountLimits());
    }
    if (parts.length !== 2) return text.countLimitUsage;

    const kind = parts[0] as ActivityKind;
    if (!["eat", "wc", "smoke", "wcd"].includes(kind)) return text.unknownActivity;
    const count = Number(parts[1]);
    if (!Number.isInteger(count) || count <= 0) return text.invalidCountLimit;

    await this.attendance.setActivityCountLimit(kind, count);
    return text.countLimitUpdated(activityLabel(kind, profile.locale), count);
  }

  private async handleReminderCommand(
    message: TelegramMessage,
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    argument: string | undefined,
  ): Promise<string> {
    const text = getLocale(profile.locale);
    const isAdmin =
      this.config.botOwnerId === profile.userId ||
      this.config.adminIds.includes(profile.userId);
    if (!isAdmin) return text.adminOnly;
    if (message.chat.type !== "private") return text.reminderPrivate;

    if (!argument) {
      const enabled = await this.attendance.isActivityReminderEnabled();
      return text.reminderStatus(enabled);
    }
    if (argument !== "on" && argument !== "off") return text.reminderUsage;

    const enabled = argument === "on";
    await this.attendance.setActivityReminderEnabled(enabled);
    return text.reminderUpdated(enabled);
  }

  private async handleLimitCommand(
    message: TelegramMessage,
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    argument: string | undefined,
  ): Promise<string> {
    const text = getLocale(profile.locale);
    const isAdmin =
      this.config.botOwnerId === profile.userId ||
      this.config.adminIds.includes(profile.userId);
    if (!isAdmin) return text.adminOnly;
    if (message.chat.type !== "private") return text.limitPrivate;

    const parts = argument?.split(/\s+/).filter(Boolean) || [];
    if (parts.length === 0) {
      return text.limits(await this.attendance.getActivityLimits());
    }
    if (parts.length !== 2) return text.limitUsage;

    const kind = parts[0] as ActivityKind;
    if (!["eat", "wc", "smoke", "wcd"].includes(kind)) {
      return text.unknownActivity;
    }
    const minutes = Number(parts[1]);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      return text.invalidLimit;
    }

    await this.attendance.setActivityLimit(kind, minutes);
    return text.limitUpdated(activityLabel(kind, profile.locale), minutes);
  }

  private async handleCallback(callback: TelegramCallbackQuery) {
    await this.telegram.answerCallbackQuery(callback.id);
    const message = callback.message;
    const action = callback.data?.split(":")[1];
    if (!message || !action || !callback.from || callback.from.is_bot) return;
    const syntheticMessage: TelegramMessage = {
      message_id: message.message_id,
      chat: message.chat,
      from: callback.from,
      text: action === "back" ? "/back" : `/${action}`,
    };
    await this.handleMessage(syntheticMessage);
  }
}

export { keyboard };