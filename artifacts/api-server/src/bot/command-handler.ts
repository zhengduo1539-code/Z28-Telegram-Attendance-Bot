import type { AttendanceService } from "./attendance-service";
import type { BotConfig } from "./config";
import { activityLabel, getLocale } from "./locales";
import {
  BOT_REPLY_CATEGORIES,
  BOT_REPLY_KEYS,
  BOT_REPLY_KEYS_BY_CATEGORY,
  BOT_REPLY_LABELS,
  BOT_REPLY_VARIABLES,
  validateBotReplyTemplate,
  type BotReplyCategory,
  type BotReplyMessageKey,
} from "./bot-reply-messages";
import type {
  ActivityKind,
  Locale,
  ReplyKeyboardButton,
  ReplyKeyboardEmojiKey,
  ReplyKeyboardEmojiIds,
  ReplyKeyboardMarkup,
  TelegramCallbackQuery,
  TelegramMessage,
  TelegramMessageEntity,
  TelegramUpdate,
  UserProfile,
} from "./types";
import { renderActivityReplyTemplate } from "./activity-reply-messages";
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



const getDefaultBotReplyPreview = (locale: Locale, key: BotReplyMessageKey): string => {
  const text = getLocale(locale);
  const userName = "{user_name}";
  const userId = 123456789;
  const activity = "{activity}";
  const sampleCounts = { eat: 1, wc: 2, smoke: 3, wcd: 4 };
  const sampleLimits = { eat: 30, wc: 5, smoke: 5, wcd: 10 };

  switch (key) {
    case "startWelcome": return text.startWelcome;
    case "help": return text.help;
    case "languageChanged": return text.languageChanged;
    case "languagePicker": return text.languagePicker;
    case "unknownLanguage": return text.unknownLanguage;
    case "unknownCommand": return text.unknownCommand;
    case "idInfo": return text.idInfo(123456789, userId);
    case "botStats": return text.botStats(12, 3);
    case "botStatsPrivate": return text.botStatsPrivate;
    case "workCheckIn": return text.workCheckIn(userName, userId, "{checked_at}");
    case "noActive": return text.noActive(userName, userId);
    case "alreadyActive": return text.alreadyActive(userName, userId, activity);
    case "started": return text.started(userName, userId, activity, "{time}", 1, 30);
    case "settled":
      return text.settled(
        userName, userId, activity, "{start_time}", 120, 30, 120, 300, sampleCounts,
      );
    case "dailyCountLimitReached": return text.dailyCountLimitReached(userName, userId, activity, 3);
    case "timeoutReminder": return text.timeoutReminder(userName, userId, activity);
    case "groupTimeoutNotification":
      return text.groupTimeoutNotification(
        "{group_name}", 123456789, "{username}", userName, userId, activity, 60, "{warning_time}",
      );
    case "shiftEnded": return text.shiftEnded("{time}");
    case "adminOnly": return text.adminOnly;
    case "adminPrivate": return text.adminPrivate;
    case "adminPanelPrompt": return text.adminPanelPrompt;
    case "adminMiniAppUnavailable": return text.adminMiniAppUnavailable;
    case "limitPrivate": return text.limitPrivate;
    case "limitUsage": return text.limitUsage;
    case "unknownActivity": return text.unknownActivity;
    case "invalidLimit": return text.invalidLimit;
    case "limits": return text.limits(sampleLimits);
    case "limitUpdated": return text.limitUpdated(activity, 30);
    case "countLimitPrivate": return text.countLimitPrivate;
    case "countLimitUsage": return text.countLimitUsage;
    case "invalidCountLimit": return text.invalidCountLimit;
    case "countLimits": return text.countLimits(sampleCounts);
    case "countLimitUpdated": return text.countLimitUpdated(activity, 3);
    case "reminderPrivate": return text.reminderPrivate;
    case "reminderUsage": return text.reminderUsage;
    case "reminderStatus": return text.reminderStatus(true);
    case "reminderUpdated": return text.reminderUpdated(true);
    case "connectPrompt": return text.connectPrompt;
    case "connectUsage": return text.connectUsage;
    case "connectAdminOnly": return text.connectAdminOnly;
    case "connectSuccess": return text.connectSuccess("{group_name}", 123456789);
    case "connectSelf": return text.connectSelf;
    case "connectInvalid": return text.connectInvalid;
    default: return BOT_REPLY_LABELS[key];
  }
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

const keyboard = (
  locale: Locale,
  activityNames: Partial<Record<ActivityKind, string>> = {},
  iconCustomEmojiIds: ReplyKeyboardEmojiIds = {},
  selective = false,
): ReplyKeyboardMarkup => {
  const text = getLocale(locale).buttons;
  const makeButton = (
    buttonText: string,
    iconKey: keyof ReplyKeyboardEmojiIds,
    style?: ReplyKeyboardButton["style"],
  ): ReplyKeyboardButton => {
    const iconCustomEmojiId = iconCustomEmojiIds[iconKey];
    return {
      text: buttonText,
      ...(iconCustomEmojiId
        ? { icon_custom_emoji_id: iconCustomEmojiId }
        : {}),
      ...(style ? { style } : {}),
    };
  };

  return {
    keyboard: [
      [
        makeButton(activityNames.wc?.trim() || text.wc, "wc"),
        makeButton(activityNames.smoke?.trim() || text.smoke, "smoke"),
        makeButton(activityNames.wcd?.trim() || text.wcd, "wcd"),
      ],
      [makeButton(text.back, "back", "primary")],
    ],
    resize_keyboard: true,
    is_persistent: true,
    one_time_keyboard: false,
    input_field_placeholder: text.inputFieldPlaceholder,
    ...(selective ? { selective: true } : {}),
  };
};

const isGroupChat = (chatType?: string): boolean =>
  chatType === "group" || chatType === "supergroup";

const buttonCommand = (
  value: string,
  activityNames: Partial<Record<ActivityKind, string>> = {},
): Command | undefined => {
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

  for (const kind of ["eat", "wc", "smoke", "wcd"] as const) {
    const label = activityNames[kind]?.trim();
    if (label && !Object.prototype.hasOwnProperty.call(commands, label)) {
      commands[label] = kind;
    }
  }

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

const REPLY_KEYBOARD_EMOJI_KEYS: ReplyKeyboardEmojiKey[] = ["wc", "smoke", "wcd", "back"];
const SETMSG_PENDING_TTL_MS = 5 * 60 * 1_000;
const BOT_REPLY_LOCALES: Array<{ locale: Locale; label: string }> = [
  { locale: "en", label: "🇬🇧 English" },
  { locale: "mm", label: "🇲🇲 မြန်မာ" },
  { locale: "zh", label: "🇨🇳 简体中文" },
];
const isLocale = (value: string | undefined): value is Locale =>
  value === "en" || value === "mm" || value === "zh";
const isBotReplyCategory = (value: string | undefined): value is BotReplyCategory =>
  value !== undefined && (BOT_REPLY_CATEGORIES as readonly string[]).includes(value);
const localeName = (locale: Locale): string =>
  BOT_REPLY_LOCALES.find((item) => item.locale === locale)?.label || locale;
const botReplyCategoryForKey = (key: BotReplyMessageKey): BotReplyCategory =>
  BOT_REPLY_CATEGORIES.find((category) =>
    BOT_REPLY_KEYS_BY_CATEGORY[category].includes(key),
  ) || "general";

const encodeCustomEmojiEntitiesForTemplate = (
  text: string,
  entities: TelegramMessageEntity[] | undefined,
): string => {
  let result = text;
  const customEmojiEntities = [...(entities || [])]
    .filter((entity) =>
      entity.type === "custom_emoji" &&
      /^\d+$/.test(entity.custom_emoji_id || "") &&
      Number.isInteger(entity.offset) &&
      Number.isInteger(entity.length) &&
      entity.offset >= 0 &&
      entity.length > 0 &&
      entity.offset + entity.length <= text.length,
    )
    .sort((left, right) => right.offset - left.offset);

  // Telegram offsets use UTF-16 code units, matching JavaScript string indexes.
  // Replace right-to-left so replacing an emoji does not shift earlier offsets.
  for (const entity of customEmojiEntities) {
    const alternative = result.slice(entity.offset, entity.offset + entity.length);
    if (!alternative || !entity.custom_emoji_id) continue;
    const marker = `[[tg-emoji:${entity.custom_emoji_id}:${encodeURIComponent(alternative)}]]`;
    result =
      result.slice(0, entity.offset) +
      marker +
      result.slice(entity.offset + entity.length);
  }
  return result;
};

export class CommandHandler {
  private readonly adminMenuScopes = new Set<string>();
  private readonly privateMenuButtonScopes = new Set<string>();
  private readonly settlementQueues = new Map<string, Promise<void>>();
  private readonly pendingReplyKeyboardEmoji = new Map<number, {
    chatId: number;
    key: ReplyKeyboardEmojiKey;
    expiresAt: number;
  }>();
  private readonly pendingBotReplyMessage = new Map<number, {
    chatId: number;
    locale: Locale;
    key: BotReplyMessageKey;
    expiresAt: number;
  }>();

  constructor(
    private readonly telegram: TelegramClient,
    private readonly attendance: AttendanceService,
    private readonly config: BotConfig,
  ) {}

  private async replyKeyboard(
    locale: Locale,
    activityNames: Partial<Record<ActivityKind, string>> = {},
    selective = false,
  ): Promise<ReplyKeyboardMarkup> {
    return keyboard(
      locale,
      activityNames,
      await this.attendance.getReplyKeyboardEmojiIds(),
      selective,
    );
  }

  private isConfiguredAdmin(userId: number): boolean {
    return this.config.botOwnerId === userId || this.config.adminIds.includes(userId);
  }

  private replyKeyboardButtonLabel(locale: Locale, key: ReplyKeyboardEmojiKey): string {
    return getLocale(locale).setmsgLabels[key];
  }

  private parseReplyKeyboardEmojiKey(value: string | undefined): ReplyKeyboardEmojiKey | undefined {
    if (!value) return undefined;
    const aliases: Record<string, ReplyKeyboardEmojiKey> = {
      wc: "wc", toilet: "wc", smoke: "smoke", wcd: "wcd", back: "back", return: "back",
    };
    return aliases[value.trim().toLowerCase()];
  }

  private buildSetmsgMenu(locale: Locale, emojiIds: ReplyKeyboardEmojiIds): import("./types").InlineKeyboardMarkup {
    const labels = getLocale(locale).setmsgLabels;
    const rows: import("./types").InlineKeyboardButton[][] = REPLY_KEYBOARD_EMOJI_KEYS.map((key) => [
      { text: `${labels[key]} · ${emojiIds[key] ? labels.configured : labels.notConfigured}`, callback_data: `setmsg:select:${key}` },
      { text: labels.clear, callback_data: `setmsg:clear:${key}`, style: "danger" },
    ]);
    rows.push([
      { text: labels.clearAll, callback_data: "setmsg:clear_all", style: "danger" },
      { text: labels.cancel, callback_data: "setmsg:cancel" },
    ]);
    rows.push([{ text: getLocale(locale).setmsgRootLabels.back, callback_data: "setmsg:menu:root" }]);
    return { inline_keyboard: rows };
  }

  private buildSetmsgRootMenu(locale: Locale): import("./types").InlineKeyboardMarkup {
    const labels = getLocale(locale).setmsgRootLabels;
    return {
      inline_keyboard: [
        [
          { text: labels.emoji, callback_data: "setmsg:mode:emoji" },
          { text: labels.replies, callback_data: "setmsg:mode:text" },
        ],
        [{ text: labels.cancel, callback_data: "setmsg:cancel" }],
      ],
    };
  }

  private buildBotReplyLocaleMenu(locale: Locale): import("./types").InlineKeyboardMarkup {
    const rows = BOT_REPLY_LOCALES.map((option) => [
      {
        text: option.label,
        callback_data: `setmsg:locale:${option.locale}`,
        ...(option.locale === locale ? { style: "primary" as const } : {}),
      },
    ]);
    rows.push([{ text: getLocale(locale).setmsgRootLabels.back, callback_data: "setmsg:mode:text" }]);
    return { inline_keyboard: rows };
  }

  private buildBotReplyCategoryMenu(uiLocale: Locale, targetLocale: Locale): import("./types").InlineKeyboardMarkup {
    const text = getLocale(uiLocale);
    const labels = text.setmsgTextCategories;
    return {
      inline_keyboard: [
        [
          { text: labels.general, callback_data: `setmsg:category:${targetLocale}:general` },
          { text: labels.attendance, callback_data: `setmsg:category:${targetLocale}:attendance` },
        ],
        [
          { text: labels.admin, callback_data: `setmsg:category:${targetLocale}:admin` },
          { text: labels.connect, callback_data: `setmsg:category:${targetLocale}:connect` },
        ],
        [{ text: text.setmsgRootLabels.back, callback_data: "setmsg:mode:text" }],
        [{ text: text.setmsgRootLabels.cancel, callback_data: "setmsg:cancel" }],
      ],
    };
  }

  private async buildBotReplyKeyMenu(
    uiLocale: Locale,
    targetLocale: Locale,
    category: BotReplyCategory,
  ): Promise<import("./types").InlineKeyboardMarkup> {
    const text = getLocale(uiLocale);
    const labels = text.setmsgRootLabels;
    const configured = await this.attendance.getBotReplyMessages(targetLocale);
    const keys = BOT_REPLY_KEYS_BY_CATEGORY[category];
    const rows: import("./types").InlineKeyboardButton[][] = [];
    for (let index = 0; index < keys.length; index += 2) {
      rows.push(keys.slice(index, index + 2).map((key) => ({
        text: `${configured[key] ? "✅" : "▫️"} ${BOT_REPLY_LABELS[key]}`,
        callback_data: `setmsg:key:${targetLocale}:${key}`,
      })));
    }
    rows.push([
      {
        text: labels.resetAllText,
        callback_data: `setmsg:cleartexts:${targetLocale}`,
        style: "danger",
      },
    ]);
    rows.push([
      {
        text: labels.back,
        callback_data: `setmsg:locale:${targetLocale}`,
      },
      {
        text: labels.cancel,
        callback_data: "setmsg:cancel",
      },
    ]);
    return { inline_keyboard: rows };
  }

  private async startBotReplyTextSetup(
    chatId: number,
    userId: number,
    uiLocale: Locale,
    targetLocale: Locale,
    key: BotReplyMessageKey,
    replyToMessageId?: number,
  ): Promise<void> {
    this.pendingBotReplyMessage.set(userId, {
      chatId,
      locale: targetLocale,
      key,
      expiresAt: Date.now() + SETMSG_PENDING_TTL_MS,
    });
    const currentTemplate = await this.attendance.getBotReplyTemplate(targetLocale, key);
    const currentMessage = currentTemplate
      ? renderActivityReplyTemplate(currentTemplate, {})
      : getDefaultBotReplyPreview(targetLocale, key);
    await this.telegram.sendMessage(
      chatId,
      getLocale(uiLocale).setmsgTextPrompt(
        BOT_REPLY_LABELS[key],
        localeName(targetLocale),
        [...BOT_REPLY_VARIABLES[key]],
        currentMessage,
        currentTemplate !== undefined,
      ),
      undefined,
      replyToMessageId,
    );
  }

  private async handlePendingBotReplyText(message: TelegramMessage): Promise<boolean> {
    if (!message.text || !message.from || message.from.is_bot || message.chat.type !== "private") return false;
    const pending = this.pendingBotReplyMessage.get(message.from.id);
    if (!pending || pending.chatId !== message.chat.id) return false;

    const uiLocale = await this.attendance.getLocale(message.chat.id, message.from.id);
    const uiText = getLocale(uiLocale);
    const incomingCommand = parseCommand(message.text);

    if (pending.expiresAt <= Date.now()) {
      this.pendingBotReplyMessage.delete(message.from.id);
      if (incomingCommand) return false;
      await this.telegram.sendMessage(message.chat.id, uiText.setmsgExpired);
      return true;
    }

    if (incomingCommand?.name === "cancel") {
      this.pendingBotReplyMessage.delete(message.from.id);
      await this.telegram.sendMessage(message.chat.id, uiText.setmsgCancelled);
      return true;
    }

    if (incomingCommand?.name === "reset") {
      this.pendingBotReplyMessage.delete(message.from.id);
      await this.attendance.setBotReplyTemplate(pending.locale, pending.key);
      await this.telegram.sendMessage(
        message.chat.id,
        uiText.setmsgTextCleared(BOT_REPLY_LABELS[pending.key], localeName(pending.locale)),
        await this.buildBotReplyKeyMenu(uiLocale, pending.locale, botReplyCategoryForKey(pending.key)),
      );
      return true;
    }

    if (incomingCommand) {
      this.pendingBotReplyMessage.delete(message.from.id);
      return false;
    }

    const template = encodeCustomEmojiEntitiesForTemplate(message.text, message.entities);
    const validationError = validateBotReplyTemplate(pending.key, template);
    if (validationError) {
      await this.telegram.sendMessage(message.chat.id, uiText.setmsgTextInvalid(validationError));
      return true;
    }

    await this.attendance.setBotReplyTemplate(pending.locale, pending.key, template);
    this.pendingBotReplyMessage.delete(message.from.id);
    await this.telegram.sendMessage(
      message.chat.id,
      uiText.setmsgTextSaved(BOT_REPLY_LABELS[pending.key], localeName(pending.locale)),
      await this.buildBotReplyKeyMenu(uiLocale, pending.locale, botReplyCategoryForKey(pending.key)),
      message.message_id,
    );
    return true;
  }

  private async startReplyKeyboardEmojiSetup(chatId: number, userId: number, locale: Locale, key: ReplyKeyboardEmojiKey, replyToMessageId?: number): Promise<void> {
    this.pendingReplyKeyboardEmoji.set(userId, { chatId, key, expiresAt: Date.now() + SETMSG_PENDING_TTL_MS });
    await this.telegram.sendMessage(chatId, getLocale(locale).setmsgPrompt(this.replyKeyboardButtonLabel(locale, key)), undefined, replyToMessageId);
  }

  private async handlePendingReplyKeyboardEmoji(message: TelegramMessage): Promise<boolean> {
    if (!message.text || !message.from || message.from.is_bot || message.chat.type !== "private") return false;
    const pending = this.pendingReplyKeyboardEmoji.get(message.from.id);
    if (!pending || pending.chatId !== message.chat.id) return false;
    const locale = await this.attendance.getLocale(message.chat.id, message.from.id);
    const text = getLocale(locale);
    const incomingCommand = parseCommand(message.text);
    if (pending.expiresAt <= Date.now()) {
      this.pendingReplyKeyboardEmoji.delete(message.from.id);
      if (incomingCommand) return false;
      await this.telegram.sendMessage(message.chat.id, text.setmsgExpired);
      return true;
    }
    if (incomingCommand?.name === "cancel") {
      this.pendingReplyKeyboardEmoji.delete(message.from.id);
      await this.telegram.sendMessage(message.chat.id, text.setmsgCancelled);
      return true;
    }
    if (incomingCommand) {
      this.pendingReplyKeyboardEmoji.delete(message.from.id);
      return false;
    }
    const entities = (message.entities || []).filter(
      (entity) => entity.type === "custom_emoji" && /^\d+$/.test(entity.custom_emoji_id || ""),
    );
    const entity = entities[0];
    const validStandaloneCustomEmoji = entities.length === 1 && entity !== undefined &&
      entity.offset === 0 && entity.length === message.text.length && message.text.trim() === message.text;
    if (!validStandaloneCustomEmoji || !entity?.custom_emoji_id) {
      await this.telegram.sendMessage(message.chat.id, text.setmsgInvalidEmoji);
      return true;
    }
    this.pendingReplyKeyboardEmoji.delete(message.from.id);
    await this.attendance.setReplyKeyboardEmojiId(pending.key, entity.custom_emoji_id);
    const settings = await this.attendance.getUserInteractionSettings(message.chat.id, message.from.id);
    const confirmation = text.setmsgSaved(this.replyKeyboardButtonLabel(locale, pending.key));
    try {
      await this.telegram.sendMessage(message.chat.id, confirmation, await this.replyKeyboard(locale, settings.activityNames), message.message_id);
    } catch {
      await this.telegram.sendMessage(message.chat.id, `${confirmation}\n\n${text.setmsgIconNotVisible}`, undefined, message.message_id);
    }
    return true;
  }

  private async handleSetmsgCommand(message: TelegramMessage, profile: Omit<UserProfile, "createdAt" | "updatedAt">, argument?: string): Promise<void> {
    const text = getLocale(profile.locale);
    if (!this.isConfiguredAdmin(profile.userId)) {
      await this.telegram.sendMessage(message.chat.id, await this.attendance.renderBotReplyMessage(profile.locale, "adminOnly", text.adminOnly), undefined, message.message_id);
      return;
    }
    if (message.chat.type !== "private" || message.chat.id !== profile.userId) {
      await this.telegram.sendMessage(message.chat.id, text.setmsgPrivate, undefined, message.message_id);
      return;
    }
    const arg = argument?.trim().toLowerCase();
    if (arg === "reset" || arg === "clear" || arg === "all") {
      this.pendingReplyKeyboardEmoji.delete(profile.userId);
      this.pendingBotReplyMessage.delete(profile.userId);
      await this.attendance.clearReplyKeyboardEmojiIds();
      const settings = await this.attendance.getUserInteractionSettings(message.chat.id, profile.userId);
      await this.telegram.sendMessage(message.chat.id, text.setmsgClearedAll, await this.replyKeyboard(profile.locale, settings.activityNames), message.message_id);
      return;
    }
    if (arg === "text" || arg === "texts" || arg === "replies") {
      this.pendingReplyKeyboardEmoji.delete(profile.userId);
      this.pendingBotReplyMessage.delete(profile.userId);
      await this.telegram.sendMessage(message.chat.id, text.setmsgTextChooseLocale, this.buildBotReplyLocaleMenu(profile.locale), message.message_id);
      return;
    }
    if (arg === "emoji" || arg === "icons") {
      this.pendingBotReplyMessage.delete(profile.userId);
      await this.telegram.sendMessage(message.chat.id, text.setmsgEmojiMenu, this.buildSetmsgMenu(profile.locale, await this.attendance.getReplyKeyboardEmojiIds()), message.message_id);
      return;
    }
    if (arg) {
      const emojiKey = this.parseReplyKeyboardEmojiKey(arg);
      if (emojiKey) {
        this.pendingBotReplyMessage.delete(profile.userId);
        await this.startReplyKeyboardEmojiSetup(message.chat.id, profile.userId, profile.locale, emojiKey, message.message_id);
        return;
      }
      const replyKey = BOT_REPLY_KEYS.find((key) =>
        key.toLowerCase() === arg || key.toLowerCase().replace(/^[a-z]/, (letter) => letter) === arg ||
        ({ welcome: "startWelcome", stats: "botStats", userids: "idInfo" } as Record<string, string>)[arg] === key,
      );
      if (replyKey) {
        this.pendingReplyKeyboardEmoji.delete(profile.userId);
        await this.startBotReplyTextSetup(message.chat.id, profile.userId, profile.locale, profile.locale, replyKey, message.message_id);
        return;
      }
      await this.telegram.sendMessage(message.chat.id, text.setmsgUsage, undefined, message.message_id);
      return;
    }
    this.pendingReplyKeyboardEmoji.delete(profile.userId);
    this.pendingBotReplyMessage.delete(profile.userId);
    await this.telegram.sendMessage(message.chat.id, text.setmsgMenu, this.buildSetmsgRootMenu(profile.locale), message.message_id);
  }

  private async handleSetmsgCallback(callback: TelegramCallbackQuery, message: TelegramMessage, action?: string, value?: string, extra?: string): Promise<void> {
    if (!callback.from || callback.from.is_bot) return;
    const locale = await this.attendance.getLocale(message.chat.id, callback.from.id);
    const text = getLocale(locale);
    if (!this.isConfiguredAdmin(callback.from.id)) {
      await this.telegram.sendMessage(message.chat.id, await this.attendance.renderBotReplyMessage(locale, "adminOnly", text.adminOnly));
      return;
    }
    if (message.chat.type !== "private" || message.chat.id !== callback.from.id) {
      await this.telegram.sendMessage(message.chat.id, text.setmsgPrivate);
      return;
    }
    if (action === "menu" && value === "root") {
      this.pendingBotReplyMessage.delete(callback.from.id);
      this.pendingReplyKeyboardEmoji.delete(callback.from.id);
      await this.telegram.sendMessage(message.chat.id, text.setmsgMenu, this.buildSetmsgRootMenu(locale), message.message_id);
      return;
    }
    if (action === "mode" && value === "emoji") {
      this.pendingBotReplyMessage.delete(callback.from.id);
      await this.telegram.sendMessage(message.chat.id, text.setmsgEmojiMenu, this.buildSetmsgMenu(locale, await this.attendance.getReplyKeyboardEmojiIds()), message.message_id);
      return;
    }
    if (action === "mode" && value === "text") {
      this.pendingReplyKeyboardEmoji.delete(callback.from.id);
      this.pendingBotReplyMessage.delete(callback.from.id);
      await this.telegram.sendMessage(message.chat.id, text.setmsgTextChooseLocale, this.buildBotReplyLocaleMenu(locale), message.message_id);
      return;
    }
    if (action === "locale" && isLocale(value)) {
      await this.telegram.sendMessage(
        message.chat.id,
        text.setmsgTextChooseCategory(localeName(value)),
        this.buildBotReplyCategoryMenu(locale, value),
        message.message_id,
      );
      return;
    }
    if (action === "category" && isLocale(value) && isBotReplyCategory(extra)) {
      await this.telegram.sendMessage(
        message.chat.id,
        text.setmsgTextChooseMessage(localeName(value), text.setmsgTextCategories[extra]),
        await this.buildBotReplyKeyMenu(locale, value, extra),
        message.message_id,
      );
      return;
    }
    if ((action === "key" || action === "resettext") && isLocale(value) && extra &&
        (BOT_REPLY_KEYS as readonly string[]).includes(extra)) {
      const key = extra as BotReplyMessageKey;
      const category = botReplyCategoryForKey(key);
      if (action === "resettext") {
        await this.attendance.setBotReplyTemplate(value, key);
        await this.telegram.sendMessage(
          message.chat.id,
          text.setmsgTextCleared(BOT_REPLY_LABELS[key], localeName(value)),
          await this.buildBotReplyKeyMenu(locale, value, category),
          message.message_id,
        );
        return;
      }
      await this.startBotReplyTextSetup(message.chat.id, callback.from.id, locale, value, key, message.message_id);
      return;
    }
    if (action === "cleartexts" && isLocale(value)) {
      await this.attendance.clearBotReplyTemplates(value);
      await this.telegram.sendMessage(
        message.chat.id,
        text.setmsgTextClearedAll(localeName(value)),
        this.buildBotReplyCategoryMenu(locale, value),
        message.message_id,
      );
      return;
    }
    if (action === "cancel") {
      this.pendingBotReplyMessage.delete(callback.from.id);
      this.pendingReplyKeyboardEmoji.delete(callback.from.id);
      await this.telegram.sendMessage(message.chat.id, text.setmsgCancelled);
      return;
    }
    if (action === "clear_all") {
      this.pendingReplyKeyboardEmoji.delete(callback.from.id);
      await this.attendance.clearReplyKeyboardEmojiIds();
      const settings = await this.attendance.getUserInteractionSettings(message.chat.id, callback.from.id);
      await this.telegram.sendMessage(message.chat.id, text.setmsgClearedAll, await this.replyKeyboard(locale, settings.activityNames), message.message_id);
      return;
    }
    const key = this.parseReplyKeyboardEmojiKey(value);
    if (!key || (action !== "select" && action !== "clear")) {
      await this.telegram.sendMessage(message.chat.id, text.setmsgEmojiMenu, this.buildSetmsgMenu(locale, await this.attendance.getReplyKeyboardEmojiIds()), message.message_id);
      return;
    }
    if (action === "select") {
      await this.startReplyKeyboardEmojiSetup(message.chat.id, callback.from.id, locale, key, message.message_id);
      return;
    }
    const emojiIds = await this.attendance.getReplyKeyboardEmojiIds();
    if (!emojiIds[key]) {
      await this.telegram.sendMessage(message.chat.id, text.setmsgNothingToClear);
      return;
    }
    this.pendingReplyKeyboardEmoji.delete(callback.from.id);
    await this.attendance.setReplyKeyboardEmojiId(key);
    const settings = await this.attendance.getUserInteractionSettings(message.chat.id, callback.from.id);
    await this.telegram.sendMessage(message.chat.id, text.setmsgClearedButton(this.replyKeyboardButtonLabel(locale, key)), await this.replyKeyboard(locale, settings.activityNames), message.message_id);
  }

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
    if (await this.handlePendingBotReplyText(message)) return;
    if (await this.handlePendingReplyKeyboardEmoji(message)) return;
    const interactionSettings =
      await this.attendance.getUserInteractionSettings(
        message.chat.id,
        message.from.id,
      );
    const currentLocale = interactionSettings.locale;
    const activityNames = interactionSettings.activityNames;
    const command =
      parseCommand(message.text) || buttonCommand(message.text, activityNames);
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
    if (command.name === "setmsg") {
      await this.handleSetmsgCommand(message, profile, command.argument);
      return;
    }
    if (command.name === "lang" || command.name === "language") {
      if (!command.argument) {
        await this.telegram.sendMessage(
          message.chat.id,
          await this.attendance.renderBotReplyMessage(currentLocale, "languagePicker", getLocale(currentLocale).languagePicker),
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
          await this.attendance.renderBotReplyMessage(currentLocale, "unknownLanguage", getLocale(currentLocale).unknownLanguage),
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
        `${await this.attendance.renderBotReplyMessage(requestedLocale, "languageChanged", getLocale(requestedLocale).languageChanged)}\n\n${await this.attendance.renderBotReplyMessage(requestedLocale, "help", getLocale(requestedLocale).help)}` ,
        await this.replyKeyboard(requestedLocale, activityNames, isGroupChat(message.chat.type)),
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
        response = await this.attendance.renderBotReplyMessage(locale, "startWelcome", text.startWelcome);
        markup = await this.replyKeyboard(locale, activityNames, isGroupChat(message.chat.type));
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
          response = await this.attendance.renderBotReplyMessage(locale, "adminOnly", text.adminOnly);
          break;
        }
        if (message.chat.type !== "private") {
          response = await this.attendance.renderBotReplyMessage(locale, "adminPrivate", text.adminPrivate);
          break;
        }
        if (!this.config.adminMiniAppUrl) {
          response = await this.attendance.renderBotReplyMessage(locale, "adminMiniAppUnavailable", text.adminMiniAppUnavailable);
          break;
        }
        response = await this.attendance.renderBotReplyMessage(locale, "adminPanelPrompt", text.adminPanelPrompt);
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
        response = await this.attendance.renderBotReplyMessage(locale, "help", text.help);
        markup = await this.replyKeyboard(locale, activityNames, isGroupChat(message.chat.type));
        break;
      case "id": {
        response = await this.attendance.renderBotReplyMessage(locale, "idInfo", text.idInfo(message.chat.id, message.from.id), { chat_id: message.chat.id, user_id: message.from.id });
        break;
      }
      case "stats": {
        const isAdmin =
          this.config.botOwnerId === profile.userId ||
          this.config.adminIds.includes(profile.userId);
        if (!isAdmin) {
          response = await this.attendance.renderBotReplyMessage(locale, "adminOnly", text.adminOnly);
          break;
        }
        if (message.chat.type !== "private") {
          response = await this.attendance.renderBotReplyMessage(locale, "botStatsPrivate", text.botStatsPrivate);
          break;
        }
        const stats = await this.attendance.getBotStats();
        response = await this.attendance.renderBotReplyMessage(locale, "botStats", text.botStats(stats.privateUsers, stats.groups), { private_users: stats.privateUsers, groups: stats.groups });
        break;
      }
      case "work":
        response = await this.attendance.workCheckIn(profile);
        markup = await this.replyKeyboard(locale, activityNames, isGroupChat(message.chat.type));
        break;
      case "back":
        response = await this.handleSettlement(profile, "back");
        markup = await this.replyKeyboard(locale, activityNames, isGroupChat(message.chat.type));
        break;
      case "eat":
      case "wc":
      case "smoke":
      case "wcd":
        response = await this.attendance.startActivity(profile, command.name);
        markup = await this.replyKeyboard(locale, activityNames, isGroupChat(message.chat.type));
        break;
      case "offwork":
        response = await this.handleSettlement(profile, "offwork");
        markup = await this.replyKeyboard(locale, activityNames, isGroupChat(message.chat.type));
        break;
      case "connect":
        if (message.chat.type === "private") {
          response = await this.attendance.renderBotReplyMessage(locale, "connectUsage", text.connectUsage);
          break;
        }
        if (!(await this.isGroupAdmin(message))) {
          response = await this.attendance.renderBotReplyMessage(locale, "connectAdminOnly", text.connectAdminOnly);
          break;
        }
        if (command.argument) {
          const target = await this.resolveConnectTarget(command.argument);
          if (!target) {
            response = await this.attendance.renderBotReplyMessage(locale, "connectInvalid", text.connectInvalid);
            break;
          }
          if (target.id === message.chat.id) {
            response = await this.attendance.renderBotReplyMessage(locale, "connectSelf", text.connectSelf);
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
          response = await this.attendance.renderBotReplyMessage(locale, "connectSuccess", text.connectSuccess(target.title || String(target.id), target.id), { group_name: target.title || String(target.id), group_id: target.id });
          break;
        }
        await this.attendance.beginConnect(message.chat.id, profile.userId);
        response = await this.attendance.renderBotReplyMessage(locale, "connectPrompt", text.connectPrompt);
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
        response = await this.attendance.renderBotReplyMessage(locale, "unknownCommand", text.unknownCommand);
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
    if (!isConfiguredAdmin && !isGroupAdmin) return this.attendance.renderBotReplyMessage(profile.locale, "adminOnly", text.adminOnly);
    if (message.chat.type !== "private" && !isGroupAdmin && !isConfiguredAdmin) {
      return this.attendance.renderBotReplyMessage(profile.locale, "countLimitPrivate", text.countLimitPrivate);
    }

    const parts = argument?.split(/\s+/).filter(Boolean) || [];
    if (parts.length === 0) {
      const limits = await this.attendance.getActivityCountLimits();
      return this.attendance.renderBotReplyMessage(profile.locale, "countLimits", text.countLimits(limits), {
        eat_count: limits.eat ?? "unlimited", wc_count: limits.wc ?? "unlimited",
        smoke_count: limits.smoke ?? "unlimited", wcd_count: limits.wcd ?? "unlimited",
      });
    }
    if (parts.length !== 2) return this.attendance.renderBotReplyMessage(profile.locale, "countLimitUsage", text.countLimitUsage);

    const kind = parts[0] as ActivityKind;
    if (!["eat", "wc", "smoke", "wcd"].includes(kind)) return this.attendance.renderBotReplyMessage(profile.locale, "unknownActivity", text.unknownActivity);
    const count = Number(parts[1]);
    if (!Number.isInteger(count) || count <= 0) return this.attendance.renderBotReplyMessage(profile.locale, "invalidCountLimit", text.invalidCountLimit);

    await this.attendance.setActivityCountLimit(kind, count);
    const activity = activityLabel(kind, profile.locale);
    return this.attendance.renderBotReplyMessage(profile.locale, "countLimitUpdated", text.countLimitUpdated(activity, count), { activity, count });
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
    if (!isAdmin) return this.attendance.renderBotReplyMessage(profile.locale, "adminOnly", text.adminOnly);
    if (message.chat.type !== "private") return this.attendance.renderBotReplyMessage(profile.locale, "reminderPrivate", text.reminderPrivate);

    if (!argument) {
      const enabled = await this.attendance.isActivityReminderEnabled();
      return this.attendance.renderBotReplyMessage(profile.locale, "reminderStatus", text.reminderStatus(enabled), { enabled: enabled ? "on" : "off" });
    }
    if (argument !== "on" && argument !== "off") return this.attendance.renderBotReplyMessage(profile.locale, "reminderUsage", text.reminderUsage);

    const enabled = argument === "on";
    await this.attendance.setActivityReminderEnabled(enabled);
    return this.attendance.renderBotReplyMessage(profile.locale, "reminderUpdated", text.reminderUpdated(enabled), { enabled: enabled ? "on" : "off" });
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
    if (!isConfiguredAdmin && !isGroupAdmin) return this.attendance.renderBotReplyMessage(profile.locale, "adminOnly", text.adminOnly);
    if (message.chat.type !== "private" && !isGroupAdmin && !isConfiguredAdmin) {
      return this.attendance.renderBotReplyMessage(profile.locale, "limitPrivate", text.limitPrivate);
    }

    const parts = argument?.split(/\s+/).filter(Boolean) || [];
    if (parts.length === 0) {
      const limits = await this.attendance.getActivityLimits();
      return this.attendance.renderBotReplyMessage(profile.locale, "limits", text.limits(limits), {
        eat_minutes: limits.eat, wc_minutes: limits.wc, smoke_minutes: limits.smoke, wcd_minutes: limits.wcd,
      });
    }
    if (parts.length !== 2) return this.attendance.renderBotReplyMessage(profile.locale, "limitUsage", text.limitUsage);

    const kind = parts[0] as ActivityKind;
    if (!["eat", "wc", "smoke", "wcd"].includes(kind)) {
      return this.attendance.renderBotReplyMessage(profile.locale, "unknownActivity", text.unknownActivity);
    }
    const minutes = Number(parts[1]);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      return this.attendance.renderBotReplyMessage(profile.locale, "invalidLimit", text.invalidLimit);
    }

    await this.attendance.setActivityLimit(kind, minutes);
    const activity = activityLabel(kind, profile.locale);
    return this.attendance.renderBotReplyMessage(profile.locale, "limitUpdated", text.limitUpdated(activity, minutes), { activity, minutes });
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
    const [namespace, action, value] = callback.data?.split(":") || [];
    if (!message || !namespace || !callback.from || callback.from.is_bot) return;

    if (namespace === "setmsg") {
      const [, , , extra] = callback.data?.split(":") || [];
      await this.handleSetmsgCallback(callback, message, action, value, extra);
      return;
    }
    if (!action) return;

    if (namespace === "lang") {
      const requestedLocale = action === "eng" ? "en" : action;
      if (
        requestedLocale !== "zh" &&
        requestedLocale !== "en" &&
        requestedLocale !== "mm"
      ) {
        return;
      }

      const interactionSettings = await this.attendance.getUserInteractionSettings(
        message.chat.id,
        callback.from.id,
      );
      const currentLocale = interactionSettings.locale;
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

      const groupChat = isGroupChat(message.chat.type);
      const originalUserMessageId = message.reply_to_message?.message_id;
      const replyToMessageId =
        groupChat && originalUserMessageId !== undefined
          ? originalUserMessageId
          : message.message_id;
      await this.telegram.sendMessage(
        message.chat.id,
        `${await this.attendance.renderBotReplyMessage(requestedLocale, "languageChanged", getLocale(requestedLocale).languageChanged)}\n\n${await this.attendance.renderBotReplyMessage(requestedLocale, "help", getLocale(requestedLocale).help)}` ,
        await this.replyKeyboard(
          requestedLocale,
          interactionSettings.activityNames,
          groupChat && originalUserMessageId !== undefined,
        ),
        replyToMessageId,
      );
      return;
    }

    const syntheticMessage: TelegramMessage = {
      message_id: isGroupChat(message.chat.type)
        ? message.reply_to_message?.message_id ?? message.message_id
        : message.message_id,
      chat: message.chat,
      from: callback.from,
      text: action === "back" ? "/back" : `/${action}`,
      ...(message.reply_to_message ? { reply_to_message: message.reply_to_message } : {}),
    };
    await this.handleMessage(syntheticMessage);
  }
}

export { keyboard };