import type {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  TelegramUpdate,
} from "./types";

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
  parameters?: { retry_after?: number };
};

type RequestPriority = "high" | "normal" | "low";

type QueuedRequest<T> = {
  method: string;
  payload: Record<string, unknown>;
  priority: RequestPriority;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

const API_MIN_INTERVAL_MS = 40;
const MAX_QUEUE_SIZE = 500;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500;
const RETRY_MAX_MS = 30_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const isRetryableStatus = (status: number) => status === 408 || status === 425 || status === 429 || status >= 500;
const retryDelay = (attempt: number) => Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);

export class TelegramClient {
  private readonly baseUrl: string;
  private queue: Array<QueuedRequest<unknown>> = [];
  private processing = false;
  private lastRequestAt = 0;

  constructor(
    private readonly token: string,
    private readonly requestTimeoutMs: number,
  ) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  async call<T>(
    method: string,
    payload: Record<string, unknown> = {},
    priority: RequestPriority = "normal",
  ): Promise<T> {
    // Long polling must not occupy the outbound queue.
    if (method === "getUpdates") return this.performCall<T>(method, payload);

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      throw new Error(`Telegram API request queue is full; rejected ${method}`);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        method,
        payload,
        priority,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.queue.sort((a, b) => ({ high: 0, normal: 1, low: 2 }[a.priority] - { high: 0, normal: 1, low: 2 }[b.priority]));
      void this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length) {
        const request = this.queue.shift()!;
        const waitMs = Math.max(0, API_MIN_INTERVAL_MS - (Date.now() - this.lastRequestAt));
        if (waitMs) await sleep(waitMs);
        try {
          request.resolve(await this.performCall(request.method, request.payload));
        } catch (error) {
          request.reject(error);
        }
      }
    } finally {
      this.processing = false;
      if (this.queue.length) void this.processQueue();
    }
  }

  private async performCall<T>(method: string, payload: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.performSingleCall<T>(method, payload);
      } catch (error: unknown) {
        const retryAfterMs = error instanceof TelegramRateLimitError ? error.retryAfterMs : undefined;
        const retryable = error instanceof TelegramRateLimitError || error instanceof TelegramRetryableError;
        if (!retryable || attempt >= MAX_RETRIES) throw error;
        await sleep(retryAfterMs ?? retryDelay(attempt));
      }
    }
  }

  private async performSingleCall<T>(method: string, payload: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);
    try {
      this.lastRequestAt = Date.now();
      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const rawBody = await response.text();
      let body: TelegramResponse<T>;
      try {
        body = JSON.parse(rawBody) as TelegramResponse<T>;
      } catch {
        if (isRetryableStatus(response.status)) {
          throw new TelegramRetryableError(`Telegram API ${method} returned invalid JSON (HTTP ${response.status})`);
        }
        throw new Error(`Telegram API ${method} returned invalid JSON (HTTP ${response.status})`);
      }
      if (!response.ok || !body.ok) {
        const message = body.description || `Telegram API ${method} failed`;
        if (response.status === 429 || body.parameters?.retry_after !== undefined) {
          const seconds = body.parameters?.retry_after;
          throw new TelegramRateLimitError(message, Math.min(
            Number.isFinite(seconds) && seconds !== undefined ? Math.max(0, seconds * 1000) : retryDelay(0),
            RETRY_MAX_MS,
          ));
        }
        if (isRetryableStatus(response.status)) throw new TelegramRetryableError(message);
        throw new Error(message);
      }
      return body.result as T;
    } catch (error: unknown) {
      if (error instanceof TelegramRateLimitError || error instanceof TelegramRetryableError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new TelegramRetryableError(`Telegram API ${method} timed out after ${this.requestTimeoutMs}ms`);
      }
      if (error instanceof TypeError) {
        throw new TelegramRetryableError(`Telegram API ${method} network request failed: ${error.message}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private botUsername?: string;

  async getBotUsername(): Promise<string | undefined> {
    if (this.botUsername) return this.botUsername;
    try {
      const me = await this.call<{ username?: string }>("getMe", {}, "high");
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
    }>("getChat", { chat_id: chatId }, "low");
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


class TelegramRateLimitError extends Error {
  constructor(message: string, readonly retryAfterMs: number) {
    super(message);
    this.name = "TelegramRateLimitError";
  }
}

class TelegramRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TelegramRetryableError";
  }
}
