import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

const MAX_INIT_DATA_AGE_MS = 10 * 60 * 1000;
const FUTURE_CLOCK_SKEW_MS = 60 * 1000;

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type ValidatedAdminUser = {
  user: TelegramWebAppUser;
  authDate: number;
  startParam?: string;
};

const hexHmac = (key: string | Buffer, value: string) =>
  createHmac("sha256", key).update(value).digest("hex");

export const validateTelegramInitData = (
  initData: string,
  botToken: string,
  now = Date.now(),
): ValidatedAdminUser | undefined => {
  if (!initData || !botToken) return undefined;

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
    return undefined;
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isInteger(authDate) || authDate <= 0) return undefined;

  const authTime = authDate * 1000;
  if (
    now - authTime > MAX_INIT_DATA_AGE_MS ||
    authTime - now > FUTURE_CLOCK_SKEW_MS
  ) {
    return undefined;
  }

  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => key + "=" + value)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = hexHmac(secretKey, dataCheckString);

  const expected = Buffer.from(calculatedHash, "hex");
  const received = Buffer.from(receivedHash, "hex");
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return undefined;
  }

  const rawUser = params.get("user");
  if (!rawUser) return undefined;

  let user: unknown;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return undefined;
  }

  if (
    typeof user !== "object" ||
    user === null ||
    !("id" in user) ||
    typeof (user as { id?: unknown }).id !== "number" ||
    !Number.isSafeInteger((user as { id: number }).id) ||
    (user as { id: number }).id <= 0
  ) {
    return undefined;
  }

  const startParam = params.get("start_param")?.trim() || undefined;

  return {
    user: user as TelegramWebAppUser,
    authDate,
    ...(startParam ? { startParam } : {}),
  };
};

export const getTelegramInitData = (request: Request): string =>
  request.header("x-telegram-init-data")?.trim() || "";

export const getTelegramStartParam = (request: Request): string =>
  request.header("x-telegram-start-param")?.trim() || "";

export const isConfiguredAdmin = (
  userId: number,
  ownerId: number | undefined,
  adminIds: number[],
): boolean => ownerId === userId || adminIds.includes(userId);
