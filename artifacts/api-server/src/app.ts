import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { adminApiRouter, adminPageHandler } from "./bot/admin-api";
import { groupAdminApiRouter } from "./bot/group-admin-api";
import { userApiRouter } from "./bot/user-api";
import { logger } from "./lib/logger";

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
app.use("/api/admin", adminApiRouter);
app.use("/api/group-admin", groupAdminApiRouter);
app.use("/api/user", userApiRouter);
app.use("/api", router);

export default app;
