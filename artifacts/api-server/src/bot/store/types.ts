import type { BotState, MiniAppGroupAccess } from "../types";

export interface BotStore {
  load(): Promise<BotState>;
  save(state: BotState): Promise<void>;
  update(mutator: (state: BotState) => void): Promise<BotState>;
  getMiniAppGroupAccess(userId: number, groupId: number): Promise<MiniAppGroupAccess | undefined>;
  cacheMiniAppGroupAccess(
    userId: number,
    groupId: number,
    role: MiniAppGroupAccess["role"],
  ): Promise<MiniAppGroupAccess>;
  clearMiniAppGroupAccess(userId: number, groupId: number): Promise<void>;
}