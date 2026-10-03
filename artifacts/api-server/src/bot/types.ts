export type Locale = "zh" | "en";

export type ActivityKind = "eat" | "wc" | "smoke" | "wcd";

export type ActivityLimits = Record<ActivityKind, number>;
export type ActivityCountLimits = Record<ActivityKind, number>;

export type UserProfile = {
  chatId: number;
  userId: number;
  displayName: string;
  username?: string;
  locale: Locale;
  createdAt: string;
  updatedAt: string;
};

export type ActivityRecord = {
  id: string;
  chatId: number;
  userId: number;
  displayName: string;
  kind: ActivityKind;
  startedAt: string;
  endedAt: string;
  elapsedSeconds: number;
  settledBy: "back" | "offwork";
};

export type ActiveActivity = {
  id: string;
  chatId: number;
  userId: number;
  displayName: string;
  kind: ActivityKind;
  startedAt: string;
  limitMinutes: number;
  reminderClaimedAt?: string;
  reminderSentAt?: string;
};

export type ConnectedGroup = {
  sourceChatId: number;
  sourceGroupName?: string;
  sourceUsername?: string;
  targetChatId: number;
  targetGroupName: string;
  targetUsername?: string;
  connectedAt: string;
};

export type PendingConnect = {
  sourceChatId: number;
  userId: number;
  requestedAt: string;
};

export type ManagedGroup = {
  chatId: number;
  title: string;
  username?: string;
  addedAt: string;
  updatedAt: string;
};

export type AuditLogEntry = {
  id: string;
  actorUserId: number;
  actorName: string;
  role: "owner" | "administrator";
  action: string;
  target: string;
  details: string;
  createdAt: string;
};

export type GroupWarning = {
  id: string;
  chatId: number;
  userId: number;
  displayName: string;
  kind: ActivityKind;
  message: string;
  timeoutSeconds?: number;
  createdAt: string;
};

export type MiniAppGroupAccess = {
  userId: number;
  groupId: number;
  role: "creator" | "administrator";
  expiresAt: string;
};

export type BotState = {
  users: Record<string, UserProfile>;
  activeActivities: Record<string, ActiveActivity>;
  records: ActivityRecord[];
  activityLimits?: Partial<ActivityLimits>;
  activityCountLimits?: Partial<ActivityCountLimits>;
  groupActivityLimits?: Record<string, Partial<ActivityLimits>>;
  groupActivityCountLimits?: Record<string, Partial<ActivityCountLimits>>;
  groupWarnings?: Record<string, GroupWarning[]>;
  reminderEnabled?: boolean;
  connectedGroups?: Record<string, ConnectedGroup>;
  pendingConnects?: Record<string, PendingConnect>;
  managedGroups?: Record<string, ManagedGroup>;
};

export type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type TelegramChat = {
  id: number;
  type?: string;
  title?: string;
  username?: string;
};

export type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  date?: number;
};

export type TelegramCallbackQuery = {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
};

export type TelegramChatMemberUpdated = {
  chat: TelegramChat;
  new_chat_member: {
    user: TelegramUser;
    status: string;
  };
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  my_chat_member?: TelegramChatMemberUpdated;
};

export type InlineKeyboardButton = {
  text: string;
  style?: "danger" | "success" | "primary";
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
};

export type InlineKeyboardMarkup = {
  inline_keyboard: InlineKeyboardButton[][];
};

export type ReplyKeyboardButton = {
  text: string;
  style?: "danger" | "success" | "primary";
};

export type ReplyKeyboardMarkup = {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard?: boolean;
  is_persistent?: boolean;
  one_time_keyboard?: boolean;
  input_field_placeholder?: string;
};
