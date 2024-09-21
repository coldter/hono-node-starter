import { db } from "@/database";
import { type Role, accounts } from "@/database/schema";
import { lucia } from "@/pkg/auth";
import type { Context } from "@/pkg/hono/app";
import type { TypeId } from "@/pkg/utils/typeid";
import { eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { UAParser } from "ua-parser-js";

type SessionInfo = {
  accountId: number;
  publicId: TypeId<"account">;
  role: Role;
};

/**
 * @description Create a Lucia session cookie for given session info, set the cookie in for the event, update last login and return the cookie.
 */
export async function createLuciaSessionCookie(c: Context, info: SessionInfo) {
  const { device, os, browser } = UAParser(c.req.header("User-Agent"));

  const userDevice =
    device.type === "mobile"
      ? `${device.type}::${device.vendor}::${device.model}`
      : `${device.vendor ?? device.model ?? device.type ?? "Unknown"}`;
  const { accountId, publicId } = info;

  const accountSession = await lucia.createSession(accountId, {
    account: { id: accountId, publicId, role: info.role },
    device: userDevice,
    os: `${browser.name}/${browser.version} ${os.name ?? "Unknown"}`,
  });

  const cookie = lucia.createSessionCookie(accountSession.id);

  setCookie(c, cookie.name, cookie.value, cookie.attributes);

  await db
    .update(accounts)
    .set({
      lastLoginAt: Date.now(),
    })
    .where(eq(accounts.id, accountId));

  return cookie;
}
