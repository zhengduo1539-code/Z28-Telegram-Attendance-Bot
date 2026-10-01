import type { AttendanceService } from "./attendance-service";
import type { BotConfig } from "./config";

export type AdminApiContext = {
  attendance: AttendanceService;
  config: BotConfig;
};

let context: AdminApiContext | undefined;

export const setAdminApiContext = (next: AdminApiContext): void => {
  context = next;
};

export const getAdminApiContext = (): AdminApiContext | undefined => context;
