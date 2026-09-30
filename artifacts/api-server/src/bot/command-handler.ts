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

export class CommandHandler {
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

    const pendingConnect = await this.attendance.getPendingConnect(
      message.chat.id,
      profile.userId,
    );
    if (pendingConnect && message.text.trim().toLowerCase() !== "/connect") {
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
        message.chat.id,
        message.chat.title,
        message.chat.username,
        target.id,
        target.title || String(target.id),
        target.username,
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

    switch (command.name) {
      case "start":
      case "help":
        response = text.help;
        markup = keyboard(locale);
        break;
      case "work":
        response = await this.attendance.startShift(profile);
        markup = keyboard(locale);
        break;
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
        if (command.argument) {
          const target = await this.resolveConnectTarget(command.argument);
          if (!target) {
            response = text.connectInvalid;
            break;
          }
          await this.attendance.setConnectedGroup(
            message.chat.id,
            message.chat.title,
            message.chat.username,
            target.id,
            target.title || String(target.id),
            target.username,
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