import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { adminApiRouter, adminPageHandler, userPageHandler } from "./bot/admin-api";
import { groupAdminApiRouter } from "./bot/group-admin-api";
import { userApiRouter } from "./bot/user-api";
import { logger } from "./lib/logger";
import { getAdminApiContext } from "./bot/admin-runtime";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/admin", adminPageHandler);
app.get("/user", userPageHandler);
app.get("/user-app", userPageHandler);
app.use("/api/admin", adminApiRouter);
app.use("/api/group-admin", groupAdminApiRouter);
app.use("/api/user", userApiRouter);
app.use("/api", router);

export default app;


app.use(async (error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const context = getAdminApiContext();
  const isAdminApi = req.path.startsWith("/api/admin");
  const statusCode = 500;
  const message =
    error instanceof Error
      ? error.message.slice(0, 2000)
      : "Unknown server error";

  if (isAdminApi && context) {
    const entry = {
      id:
        "system-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 8),
      actorUserId: 0,
      actorName: "System",
      role: "administrator" as const,
      action: "notification.error",
      target: req.method + " " + req.path,
      details: "[Admin API] HTTP " + statusCode + ": " + message,
      createdAt: new Date().toISOString(),
    };

    void context.attendance.createAuditLog(entry).catch((auditError: unknown) => {
      logger.error(
        { err: auditError, source: req.path },
        "Failed to persist admin API error notification",
      );
    });
  }

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(statusCode).json({
    error: "Internal server error.",
  });
});
