import { appEnv } from "@/pkg/env/env";
import { errorResponse } from "@/pkg/errors/http";
import type { HonoEnv } from "@/pkg/hono/env";
import { ioredis } from "@/pkg/ioredis";
import { getConnInfo } from "@hono/node-server/conninfo";
import type { MiddlewareHandler } from "hono";
import { seconds } from "itty-time";

import {
  type IRateLimiterOptions,
  type IRateLimiterPostgresOptions,
  type IRateLimiterRedisOptions,
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";

type RateLimiterMode = "success" | "fail" | "limit";

/*
 * This file contains the implementation of a rate limiter middleware.
 * It uses the `rate-limiter-flexible` library to limit the number of requests per user or IP address.
 * https://github.com/animir/node-rate-limiter-flexible#readme
 * The rate limiter is implemented as a class `RateLimiter` that extends `RateLimiterPostgres`.
 *
 * The 'success' mode decreases the available points for the user or IP address on successful requests.
 * The 'fail' (default mode does the same but for failed requests.
 * The 'limit' mode consumes points for each request without blocking.
 *
 * Additionally, there is a separate rate limiter for sign-in requests that limits the number of failed attempts per IP address and username.
 */

const getUsernameIPkey = (username?: string, ip?: string) => `${username}_${ip}`;

function rateLimiterMiddleware(
  this: RateLimiterMemory | RateLimiterRedis,
  mode: RateLimiterMode = "fail",
): MiddlewareHandler<HonoEnv> {
  if (mode === "success" || mode === "fail") {
    this.points = this.points - 1;
  }

  return async (ctx, next) => {
    const ipAddr = ctx.req.header("x-forwarded-for") || getConnInfo(ctx).remote.address;
    // TODO: get user from ctx
    // const body =
    //   ctx.req.header("content-type") === "application/json"
    //     ? await ctx.req.raw.clone().json()
    //     : undefined;
    // const user = getctx();
    // const username = body?.email || user?.id;
    const username = undefined;
    if (!ipAddr && !username) {
      return next();
    }

    const usernameIPkey = getUsernameIPkey(username, ipAddr);

    const res = await this.get(usernameIPkey);

    let retrySecs = 0;

    // Check if IP or Username + IP is already blocked
    if (res !== null && res.consumedPoints > this.points) {
      retrySecs = Math.round(res.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      ctx.header("Retry-After", String(retrySecs));
      return errorResponse(ctx, "RATE_LIMITED", "too_many_requests");
    }

    if (mode === "limit") {
      try {
        await this.consume(usernameIPkey);
      } catch (rlRejected) {
        if (rlRejected instanceof RateLimiterRes) {
          ctx.header("Retry-After", String(Math.round(rlRejected.msBeforeNext / 1000) || 1));
          return errorResponse(ctx, "RATE_LIMITED", "too_many_requests");
        }

        throw rlRejected;
      }
    }

    await next();

    if (ctx.res.status === 200) {
      if (mode === "success") {
        try {
          await this.consume(usernameIPkey);
        } catch {}
      } else if (mode === "fail") {
        await this.delete(usernameIPkey);
      }
    } else if (mode === "fail") {
      try {
        await this.consume(usernameIPkey);
      } catch {}
    }
  };
}

// Default options to limit fail requests ('fail' mode)
const defaultMemoryOptions = {
  keyPrefix: "rate_limits", // Name of table in database
  points: 1000, // 1000 requests
  duration: seconds("1 hour"), // within 1 hour
  blockDuration: seconds("10 minutes"), // Block for 10 minutes
} satisfies IRateLimiterOptions;

// const defaultRedisOptions = {
//   storeClient: ioredis,
//   points: 1000, // 1000 requests
//   duration: seconds("1 hour"), // within 1 hour
//   blockDuration: seconds("10 minutes"), // Block for 10 minutes
// } satisfies IRateLimiterRedisOptions;

export const getRateLimiterInstance = (
  options: Omit<IRateLimiterRedisOptions, "storeClient"> = defaultMemoryOptions,
) =>
  appEnv.CACHE_DRIVER === "memory"
    ? new RateLimiterMemory(options)
    : new RateLimiterRedis({ ...options, storeClient: ioredis });

export const rateLimiter = (
  options: Omit<IRateLimiterPostgresOptions, "storeClient"> = defaultMemoryOptions,
  mode: RateLimiterMode = "fail",
) => rateLimiterMiddleware.call(getRateLimiterInstance(options), mode);

export const authRateLimiter = rateLimiter(
  {
    points: 5,
    duration: seconds("1 hour"),
    blockDuration: seconds("10 minutes"),
    keyPrefix: "auth_fail",
  },
  "fail",
);
