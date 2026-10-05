import type { Logger } from "pino";
import { ActivityReminderScheduler } from "./activity-reminder-scheduler";
import { AttendanceService } from "./attendance-service";
import { CommandHandler } from "./command-handler";
import { getBotConfig } from "./config";
import { TelegramPollingBot } from "./polling";
import { setAdminApiContext } from "./admin-runtime";
import { setBotStatus } from "./runtime";
import { MongoBotStore } from "./store/mongo-store";
import { TelegramClient } from "./telegram-client";

const MAX_START_RETRY_DELAY_MS = 30_000;

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export type TelegramBotRuntimeHandle = {
  stop: () => Promise<void>;
};

export const startTelegramBot = async (logger: Logger): Promise<TelegramBotRuntimeHandle | undefined> => {
  const config = getBotConfig();
  if (!config.token) {
    setBotStatus({ enabled: false, running: false });
    logger.warn(
      "TELEGRAM_BOT_TOKEN is not configured; API health endpoint is running but Telegram polling is disabled",
    );
    return undefined;
  }

  if (!config.mongodbUri) {
    const message = "MONGODB_URI is required when Telegram bot polling is enabled.";
    setBotStatus({ enabled: true, running: false, lastError: message });
    logger.error(message);
    return undefined;
  }

  setBotStatus({ enabled: true, running: false, lastError: undefined });

  let retryDelayMs = config.pollIntervalMs;
  let store: MongoBotStore | undefined;
  let telegram: TelegramClient | undefined;
  let pollingBot: TelegramPollingBot | undefined;

  while (true) {
    try {
      const currentStore = new MongoBotStore(config.mongodbUri, config.dataPath);
      store = currentStore;
      await currentStore.load();
      const attendance = new AttendanceService(currentStore, config);
      const telegramClient = new TelegramClient(
        config.token,
        config.telegramRequestTimeoutMs,
      );
      telegram = telegramClient;
      setAdminApiContext({ attendance, config, telegram: telegramClient });
      const handler = new CommandHandler(telegramClient, attendance, config);
      pollingBot = new TelegramPollingBot(
        config,
        logger,
        handler,
        telegramClient,
      );
      await pollingBot.start();

      const reminders = new ActivityReminderScheduler(
        attendance,
        telegramClient,
        logger,
      );
      reminders.start();

      return {
        stop: async () => {
          reminders.stop();
          pollingBot?.stop();
          telegram?.close();
          await store?.close();
        },
      };
    } catch (error: unknown) {
      pollingBot?.stop();
      telegram?.close();

      try {
        await store?.close();
      } catch (closeError: unknown) {
        logger.error(
          { err: closeError },
          "Failed to close MongoDB connection after bot startup failure",
        );
      }

      pollingBot = undefined;
      telegram = undefined;
      store = undefined;

      const message = error instanceof Error ? error.message : String(error);
      setBotStatus({ enabled: true, running: false, lastError: message });
      logger.error(
        { err: error, retryDelayMs },
        "Telegram bot startup failed; retrying",
      );
      await sleep(retryDelayMs);
      retryDelayMs = Math.min(retryDelayMs * 2, MAX_START_RETRY_DELAY_MS);
    }
  }
};

export { getBotStatus } from "./runtime";
