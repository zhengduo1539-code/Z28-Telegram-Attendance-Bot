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


const languageKeyboard = (locale: Locale): import("./types").InlineKeyboardMarkup => {
  const options: Array<{ locale: Locale; label: string }> = [
    { locale: "en", label: "🇬🇧 English" },
    { locale: "mm", label: "🇲🇲 မြန်မာ" },
    { locale: "zh", label: "🇨🇳 简体中文" },
  ];
  return {
    inline_keyboard: options.map((option) => [
      {
        text: option.locale === locale ? `✓ ${option.label}` : option.label,
        callback_data: `lang:${option.locale}`,
        ...(option.locale === locale ? { style: "primary" as const } : {}),
      },
    ]),
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
    input_field_placeholder: text.inputFieldPlaceholder,
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
    "အိမ်သာ": "wc",
    "ဆေးလိပ်": "smoke",
    "ထိုင်ခုံသို့ပြန်": "back",
    "ထိုင်ခုံသို့ ပြန်": "back",
  };
  const name = commands[value.trim()];
  return name ? { name } : undefined;
};

export const getCommandMenu = (
  locale: Locale,
  isAdmin: boolean,
): Array<{ command: string; description: string }> =>
  isAdmin ? getLocale(locale).commandMenu.admin : getLocale(locale).commandMenu.user;

export const DEFAULT_MENU_COMMANDS = getCommandMenu("en", false);
export const ADMIN_MENU_COMMANDS = getCommandMenu("en", true);

export class CommandHandler {
  private readonly adminMenuScopes = new Set<string>();
  private readonly privateMenuButtonScopes = new Set<string>();
  private readonly settlementQueues = new Map<string, Promise<void>>();

  constructor(
    private readonly telegram: TelegramClient,
    private readonly attendance: AttendanceService,
    private readonly config: BotConfig,
  ) {}

  async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (update.my_chat_member) {
      await this.handleMyChatMember(update.my_chat_member);
      return;
    }
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

    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      await this.attendance.recordManagedGroup(
        message.chat.id,
        message.chat.title || String(message.chat.id),
        message.chat.username,
      );
    }

    // Do not race a language change with the menu refresh for the previous locale.
    // Language commands update both the command menu and Mini App button explicitly
    // after the new locale has been saved.
    const isLanguageCommand =
      command?.name === "lang" || command?.name === "language";
    if (!isLanguageCommand) {
      void this.ensureAdminCommandMenu(message, profile.userId, profile.locale);
    }

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
      if (target.id === message.chat.id) {
        await this.telegram.sendMessage(
          message.chat.id,
          getLocale(currentLocale).connectSelf,
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
      if (!command.argument) {
        await this.telegram.sendMessage(
          message.chat.id,
          getLocale(currentLocale).languagePicker,
          languageKeyboard(currentLocale),
          message.message_id,
        );
        return;
      }

      const requestedLocale =
        command.argument === "eng" ? "en" : command.argument;
      if (
        requestedLocale !== "zh" &&
        requestedLocale !== "en" &&
        requestedLocale !== "mm"
      ) {
        await this.telegram.sendMessage(
          message.chat.id,
          getLocale(currentLocale).unknownLanguage,
          undefined,
          message.message_id,
        );
        return;
      }

      const profile = profileFromUser(message, requestedLocale);
      if (!profile) return;
      await this.attendance.setLocale(profile, requestedLocale);
      await this.ensureAdminCommandMenu(
        message,
        profile.userId,
        requestedLocale,
      );

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
          const rows: import("./types").InlineKeyboardButton[][] = [];

          if (botUsername) {
            rows.push([
              {
                text:
                  text.telegramUi.addBotToGroupButton,
                style: "primary",
                url: `https://t.me/${botUsername}?startgroup=attendance`,
              },
            ]);
          }

          if (rows.length) {
            addGroupMarkup = { inline_keyboard: rows };
          }
        }
        break;
      }
      case "admin": {
        const isConfiguredAdmin =
          this.config.botOwnerId === profile.userId ||
          this.config.adminIds.includes(profile.userId);
        if (!isConfiguredAdmin) {
          response = text.adminOnly;
          break;
        }
        if (message.chat.type !== "private") {
          response = text.adminPrivate;
          break;
        }
        if (!this.config.adminMiniAppUrl) {
          response = text.adminMiniAppUnavailable;
          break;
        }
        response = text.adminPanelPrompt;
        markup = {
          inline_keyboard: [
            [
              {
                text:
                  text.telegramUi.adminMenuButton,
                style: "primary",
                web_app: { url: this.config.adminMiniAppUrl },
              },
            ],
          ],
        };
        break;
      }
      case "help":
        response = text.help;
        markup = keyboard(locale);
        break;
      case "id": {
        response = text.idInfo(message.chat.id, message.from.id);
        break;
      }
      case "stats": {
        const isAdmin =
          this.config.botOwnerId === profile.userId ||
          this.config.adminIds.includes(profile.userId);
        if (!isAdmin) {
          response = text.adminOnly;
          break;
        }
        if (message.chat.type !== "private") {
          response = text.botStatsPrivate;
          break;
        }
        const stats = await this.attendance.getBotStats();
        response = text.botStats(stats.privateUsers, stats.groups);
        break;
      }
      case "work":
        response = await this.attendance.workCheckIn(profile);
        markup = keyboard(locale);
        break;
      case "back":
        response = await this.handleSettlement(profile, "back");
        markup = keyboard(locale);
        break;
      case "eat":
      case "wc":
      case "smoke":
      case "wcd":
        response = await this.attendance.startActivity(profile, command.name);
        markup = keyboard(locale);
        break;
      case "offwork":
        response = await this.handleSettlement(profile, "offwork");
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
          if (target.id === message.chat.id) {
            response = text.connectSelf;
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
    if (
      (command.name === "help" ||
        command.name === "limit" ||
        command.name === "limits" ||
        command.name === "countlimit" ||
        command.name === "countlimits" ||
        command.name === "connect") &&
      (message.chat.type === "group" || message.chat.type === "supergroup") &&
      (await this.isGroupAdmin(message))
    ) {
      const groupPanel = await this.getGroupAdminPanelMarkup(message, locale);
      if (groupPanel) addGroupMarkup = groupPanel;
    }

    await this.telegram.sendMessage(
      message.chat.id,
      response,
      markup,
      message.message_id,
    );
    if (addGroupMarkup) {
      const isGroupPanel =
        message.chat.type === "group" || message.chat.type === "supergroup";
      await this.telegram.sendMessage(
        message.chat.id,
        isGroupPanel
          ? text.telegramUi.groupAdminPanelPrompt
          : text.telegramUi.addBotToGroupPrompt,
        addGroupMarkup,
      );
    }
  }

  private async handleSettlement(
    profile: Omit<UserProfile, "createdAt" | "updatedAt">,
    settledBy: "back" | "offwork",
  ): Promise<string> {
    const key = `${profile.chatId}:${profile.userId}`;
    const previous = this.settlementQueues.get(key) || Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.settlementQueues.set(key, current);

    await previous;
    try {
      const result = await this.attendance.settle(profile, settledBy);
      if (
        settledBy === "back" &&
        result.timeoutNotification &&
        result.notificationChatId &&
        result.pendingActivityId
      ) {
        try {
          await this.telegram.sendMessage(
            result.notificationChatId,
            result.timeoutNotification,
          );
          await this.attendance.completePendingActivity(
            profile.chatId,
            profile.userId,
            result.pendingActivityId,
          );
        } catch {
          // Keep the temporary activity when warning delivery fails so the
          // warning can be retried on the next Back to Seat action.
        }
      }
      return result.response;
    } finally {
      release();
      if (this.settlementQueues.get(key) === current) {
        this.settlementQueues.delete(key);
      }
    }
  }

  private async ensureAdminCommandMenu(
    message: TelegramMessage,
    userId: number,
    locale: Locale,
  ): Promise<void> {
    const isConfiguredAdmin =
      this.config.botOwnerId === userId || this.config.adminIds.includes(userId);

    if (message.chat.type === "private") {
      await this.ensurePrivateMenuButton(
        message.chat.id,
        userId,
        locale,
        isConfiguredAdmin
          ? this.config.adminMiniAppUrl
          : this.config.userMiniAppUrl,
      );
    }

    const text = getLocale(locale);
    const commands = isConfiguredAdmin
      ? text.commandMenu.admin
      : text.commandMenu.user;

    const scope =
      message.chat.type === "private"
        ? { type: "chat" as const, chat_id: message.chat.id }
        : message.chat.type === "group" || message.chat.type === "supergroup"
          ? isConfiguredAdmin
            ? {
                type: "chat_member" as const,
                chat_id: message.chat.id,
                user_id: userId,
              }
            : undefined
          : undefined;

    if (!scope) return;

    const scopeKey =
      scope.type === "chat"
        ? `private:${scope.chat_id}:${isConfiguredAdmin ? "admin" : "default"}:${locale}`
        : `member:${scope.chat_id}:${scope.user_id}:admin`;

    if (this.adminMenuScopes.has(scopeKey)) return;

    try {
      await this.telegram.setMyCommands(commands, scope);
      this.adminMenuScopes.add(scopeKey);
    } catch {
      // Command-menu configuration must not interrupt normal bot handling.
    }
  }

  private async ensurePrivateMenuButton(
    chatId: number,
    userId: number,
    locale: Locale,
    miniAppUrl: string | undefined,
  ): Promise<void> {
    const isConfiguredAdmin =
      this.config.botOwnerId === userId || this.config.adminIds.includes(userId);
    const scopeKey = `private:${chatId}:${isConfiguredAdmin && miniAppUrl ? "admin" : "default"}:${locale}`;
    if (this.privateMenuButtonScopes.has(scopeKey)) return;

    try {
      if (miniAppUrl) {
        await this.telegram.setChatMenuButton(chatId, {
          type: "web_app",
          text: isConfiguredAdmin
            ? getLocale(locale).telegramUi.adminMenuButton
            : getLocale(locale).telegramUi.userMenuButton,
          web_app: { url: miniAppUrl },
        });
      } else {
        await this.telegram.setChatMenuButton(chatId);
      }
      this.privateMenuButtonScopes.add(scopeKey);
    } catch {
      // Menu-button configuration must not interrupt normal bot handling.
    }
  }

  private async getGroupAdminPanelMarkup(
    message: TelegramMessage,
    locale: Locale,
  ): Promise<import("./types").InlineKeyboardMarkup | undefined> {
    if (
      message.chat.type !== "group" &&
      message.chat.type !== "supergroup"
    ) {
      return undefined;
    }

    const botUsername = await this.telegram.getBotUsername();
    if (!botUsername) return undefined;

    const startParam = `group_${message.chat.id}`;
    const url = `https://t.me/${botUsername}?startapp=${encodeURIComponent(startParam)}`;
    return {
      inline_keyboard: [
        [
          {
            text: getLocale(locale).telegramUi.openGroupAdminPanelButton,
            style: "primary",
            url,
          },
        ],
      ],
    };
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
    const isConfiguredAdmin =
      this.config.botOwnerId === profile.userId ||
      this.config.adminIds.includes(profile.userId);
    const isGroupAdmin =
      message.chat.type === "group" || message.chat.type === "supergroup"
        ? await this.isGroupAdmin(message)
        : false;
    if (!isConfiguredAdmin && !isGroupAdmin) return text.adminOnly;
    if (message.chat.type !== "private" && !isGroupAdmin && !isConfiguredAdmin) {
      return text.countLimitPrivate;
    }

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
    const isConfiguredAdmin =
      this.config.botOwnerId === profile.userId ||
      this.config.adminIds.includes(profile.userId);
    const isGroupAdmin =
      message.chat.type === "group" || message.chat.type === "supergroup"
        ? await this.isGroupAdmin(message)
        : false;
    if (!isConfiguredAdmin && !isGroupAdmin) return text.adminOnly;
    if (message.chat.type !== "private" && !isGroupAdmin && !isConfiguredAdmin) {
      return text.limitPrivate;
    }

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

  private async handleMyChatMember(update: NonNullable<TelegramUpdate["my_chat_member"]>) {
    const chat = update.chat;
    if (chat.type !== "group" && chat.type !== "supergroup") return;

    const activeStatuses = new Set(["member", "administrator"]);
    if (activeStatuses.has(update.new_chat_member.status)) {
      await this.attendance.recordManagedGroup(
        chat.id,
        chat.title || String(chat.id),
        chat.username,
      );
      return;
    }

    if (update.new_chat_member.status === "left" || update.new_chat_member.status === "kicked") {
      await this.attendance.removeManagedGroup(chat.id);
    }
  }

  private async handleCallback(callback: TelegramCallbackQuery) {
    await this.telegram.answerCallbackQuery(callback.id);
    const message = callback.message;
    const [namespace, action] = callback.data?.split(":") || [];
    if (!message || !action || !callback.from || callback.from.is_bot) return;

    if (namespace === "lang") {
      const requestedLocale = action === "eng" ? "en" : action;
      if (
        requestedLocale !== "zh" &&
        requestedLocale !== "en" &&
        requestedLocale !== "mm"
      ) {
        return;
      }

      const currentLocale = await this.attendance.getLocale(
        message.chat.id,
        callback.from.id,
      );
      const syntheticMessage: TelegramMessage = {
        message_id: message.message_id,
        chat: message.chat,
        from: callback.from,
        text: "/lang",
      };
      const profile = profileFromUser(syntheticMessage, currentLocale);
      if (!profile) return;

      await this.attendance.setLocale(profile, requestedLocale);
      await this.ensureAdminCommandMenu(
        message,
        profile.userId,
        requestedLocale,
      );

      await this.telegram.sendMessage(
        message.chat.id,
        `${getLocale(requestedLocale).languageChanged}\n\n${getLocale(requestedLocale).help}`,
        keyboard(requestedLocale),
        message.message_id,
      );
      return;
    }

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