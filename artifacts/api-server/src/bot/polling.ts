import type { Logger } from "pino";
import type { BotConfig } from "./config";
import { ADMIN_MENU_COMMANDS, CommandHandler } from "./command-handler";
import { setBotStatus } from "./runtime";
import { TelegramClient } from "./telegram-client";

const MAX_RETRY_DELAY_MS = 30_000;

export class TelegramPollingBot {
  private stopped = false;
  private offset?: number;
  private consecutiveErrors = 0;

  constructor(
    private readonly config: BotConfig,
    private readonly logger: Logger,
    private readonly handler: CommandHandler,
    private readonly telegram: TelegramClient,
  ) {}

  async start() {
    await this.telegram.deleteWebhook();
    await this.telegram.setMyCommands();

    if (this.config.adminMiniAppUrl) {
      await this.telegram.setChatMenuButton(undefined, {
        type: "web_app",
        text: "Open Mini App",
        web_app: { url: this.config.adminMiniAppUrl },
      });
      this.logger.info(
        { miniAppUrl: this.config.adminMiniAppUrl },
        "Telegram Mini App menu button configured for all private chats",
      );
    } else {
      this.logger.warn(
        "Telegram Mini App menu button was not configured because no Mini App URL is available",
      );
    }

    const adminIds = new Set<number>([
      ...(this.config.botOwnerId ? [this.config.botOwnerId] : []),
      ...this.config.adminIds,
    ]);
    await Promise.allSettled(
      [...adminIds].map((userId) =>
        this.telegram.setMyCommands(ADMIN_MENU_COMMANDS, {
          type: "chat",
          chat_id: userId,
        }),
      ),
    );

    setBotStatus({ enabled: true, running: true, lastError: undefined });
    this.logger.info("Telegram polling started");
    void this.loop().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      setBotStatus({ running: false, lastError: message });
      this.logger.error({ err: error }, "Telegram polling loop stopped");
    });
  }

  stop() {
    this.stopped = true;
    setBotStatus({ running: false });
  }

  private async loop() {
    while (!this.stopped) {
      try {
        const updates = await this.telegram.getUpdates(this.offset, 25);
        this.consecutiveErrors = 0;
        setBotStatus({ lastError: undefined });
        for (const update of updates) {
          try {
            await this.handler.handleUpdate(update);
            setBotStatus({ lastUpdateAt: new Date().toISOString() });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            setBotStatus({ lastError: message });
            this.logger.error(
              { err: error, updateId: update.update_id },
              "Telegram update handling failed; continuing polling",
            );
          } finally {
            this.offset = update.update_id + 1;
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.consecutiveErrors += 1;
        const retryDelayMs = Math.min(
          this.config.pollIntervalMs *
            2 ** Math.min(this.consecutiveErrors - 1, 5),
          MAX_RETRY_DELAY_MS,
        );
        setBotStatus({ lastError: message, running: true });
        this.logger.error(
          { err: error, retryDelayMs },
          "Telegram polling failed; retrying",
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }
}
