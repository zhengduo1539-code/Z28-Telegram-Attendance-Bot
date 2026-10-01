import type {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  TelegramUpdate,
} from "./types";

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export class TelegramClient {
  private readonly baseUrl: string;

  constructor(
    private readonly token: string,
    private readonly requestTimeoutMs: number,
  ) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  async call<T>(
    method: string,
    payload: Record<string, unknown> = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Telegram API ${method} timed out after ${this.requestTimeoutMs}ms`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    const rawBody = await response.text();
    let body: TelegramResponse<T>;
    try {
      body = JSON.parse(rawBody) as TelegramResponse<T>;
    } catch {
      throw new Error(
        `Telegram API ${method} returned invalid JSON (HTTP ${response.status})`,
      );
    }

    if (!response.ok || !body.ok) {
      throw new Error(body.description || `Telegram API ${method} failed`);
    }
    return body.result as T;
  }

  private botUsername?: string;

  async getBotUsername(): Promise<string | undefined> {
    if (this.botUsername) return this.botUsername;
    try {
      const me = await this.call<{ username?: string }>("getMe");
      this.botUsername = me.username;
      return this.botUsername;
    } catch {
      return undefined;
    }
  }

  getChat(chatId: number | string) {
    return this.call<{
      id: number;
      type: string;
      title?: string;
      username?: string;
    }>("getChat", { chat_id: chatId });
  }

  getChatMember(chatId: number, userId: number) {
    return this.call<{ status: string }>("getChatMember", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  getChatMemberCount(chatId: number) {
    return this.call<number>("getChatMemberCount", {
      chat_id: chatId,
    });
  }

  getUpdates(offset: number | undefined, timeoutSeconds: number) {
    return this.call<TelegramUpdate[]>("getUpdates", {
      ...(offset === undefined ? {} : { offset }),
      timeout: timeoutSeconds,
      allowed_updates: ["message", "callback_query", "my_chat_member"],
    });
  }

  sendMessage(
    chatId: number,
    text: string,
    replyMarkup?: InlineKeyboardMarkup | ReplyKeyboardMarkup,
    replyToMessageId?: number,
  ) {
    return this.call("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      ...(replyToMessageId
        ? {
            reply_parameters: {
              message_id: replyToMessageId,
              allow_sending_without_reply: true,
            },
          }
        : {}),
    });
  }

  answerCallbackQuery(callbackQueryId: string) {
    return this.call("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
    });
  }

  setChatMenuButton(
    chatId: number,
    menuButton?: {
      type: "default" | "commands" | "web_app";
      text?: string;
      web_app?: { url: string };
    },
  ) {
    return this.call("setChatMenuButton", {
      chat_id: chatId,
      ...(menuButton ? { menu_button: menuButton } : {}),
    });
  }

  deleteWebhook() {
    return this.call("deleteWebhook", { drop_pending_updates: false });
  }

  setMyCommands(
    commands: Array<{ command: string; description: string }> = [
      { command: "start", description: "开始 / Start" },
      { command: "work", description: "上班 / Start work" },
      { command: "back", description: "回座 / Return to seat" },
      { command: "eat", description: "吃饭 / Meal break" },
      { command: "wc", description: "上厕所 / Toilet" },
      { command: "smoke", description: "抽烟 / Smoke break" },
      { command: "wcd", description: "WCD" },
      { command: "offwork", description: "下班 / End work" },
      { command: "help", description: "帮助 / Help" },
      { command: "lang", description: "语言 / Language" },
    ],
    scope?:
      | { type: "default" }
      | { type: "chat"; chat_id: number | string }
      | { type: "chat_member"; chat_id: number | string; user_id: number },
  ) {
    return this.call("setMyCommands", {
      commands,
      ...(scope ? { scope } : {}),
    });
  }
}
