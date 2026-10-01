import type { AttendanceService } from "./attendance-service";
import type { BotConfig } from "./config";
import type { TelegramClient } from "./telegram-client";
import type { TelegramClient } from "./telegram-client";

export type AdminApiContext = {
  attendance: AttendanceService;
  config: BotConfig;
  telegram: TelegramClient;
};

let context: AdminApiContext | undefined;

export const setAdminApiContext = (next: AdminApiContext): void => {
  context = next;
};

export const getAdminApiContext = (): AdminApiContext | undefined => context;
