import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import type { Request } from "express";

const MAX_INIT_DATA_AGE_MS = 10 * 60 * 1000;
const FUTURE_CLOCK_SKEW_MS = 60 * 1000;
const ADMIN_SESSION_TTL_MS = 30 * 60 * 1000;

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
  maxAgeMs = MAX_INIT_DATA_AGE_MS,
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
    now - authTime > maxAgeMs ||
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


const encodeSessionPayload = (payload: object): string =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

const signAdminSession = (payload: string, botToken: string): string =>
  hexHmac(botToken, "Z28AdminSession:" + payload);

export const createAdminSession = (
  user: TelegramWebAppUser,
  botToken: string,
): string => {
  const payload = encodeSessionPayload({
    v: 1,
    uid: user.id,
    user,
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
    nonce: randomBytes(12).toString("base64url"),
  });
  return payload + "." + signAdminSession(payload, botToken);
};

export const getAdminSession = (
  token: string,
  botToken: string,
): TelegramWebAppUser | undefined => {
  if (!token || !botToken) return undefined;
  const separator = token.lastIndexOf(".");
  if (separator <= 0 || separator >= token.length - 1) return undefined;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!/^[a-f0-9]{64}$/i.test(signature)) return undefined;

  const expected = Buffer.from(signAdminSession(payload, botToken), "hex");
  const received = Buffer.from(signature, "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return undefined;
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return undefined;
  }

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("v" in decoded) ||
    (decoded as { v?: unknown }).v !== 1 ||
    !("uid" in decoded) ||
    typeof (decoded as { uid?: unknown }).uid !== "number" ||
    !Number.isSafeInteger((decoded as { uid: number }).uid) ||
    (decoded as { uid: number }).uid <= 0 ||
    !("exp" in decoded) ||
    typeof (decoded as { exp?: unknown }).exp !== "number" ||
    !Number.isFinite((decoded as { exp: number }).exp) ||
    (decoded as { exp: number }).exp <= Date.now() ||
    !("user" in decoded) ||
    typeof (decoded as { user?: unknown }).user !== "object" ||
    (decoded as { user: { id?: unknown } }).user === null ||
    (decoded as { user: { id?: unknown } }).user.id !== (decoded as { uid: number }).uid
  ) {
    return undefined;
  }

  return (decoded as { user: TelegramWebAppUser }).user;
};
