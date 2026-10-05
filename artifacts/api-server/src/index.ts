import app from "./app";
import { logger } from "./lib/logger";
import { startTelegramBot } from "./bot";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

let shuttingDown = false;
let telegramRuntime: Awaited<ReturnType<typeof startTelegramBot>> | undefined;

const shutdown = (signal: NodeJS.Signals) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Shutdown signal received; stopping Z28 runtime");

  const forceExitTimer = setTimeout(() => {
    logger.error(
      { signal },
      "Graceful shutdown exceeded 25 seconds; forcing process exit",
    );
    process.exit(0);
  }, 25_000);
  forceExitTimer.unref();

  void (async () => {
    try {
      await telegramRuntime?.stop();
    } catch (error: unknown) {
      logger.error({ err: error }, "Failed to stop Telegram runtime cleanly");
    }

    server.close((error) => {
      if (error) {
        logger.error({ err: error }, "HTTP server failed to close cleanly");
      } else {
        logger.info("HTTP server closed; Z28 runtime shutdown complete");
      }

      clearTimeout(forceExitTimer);
      process.exit(0);
    });
  })();
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

void startTelegramBot(logger)
  .then((runtime) => {
    telegramRuntime = runtime;

    if (shuttingDown) {
      void runtime?.stop();
    }
  })
  .catch((error: unknown) => {
    logger.error({ err: error }, "Telegram bot failed to start");
  });
