import { db } from "@/database";
import type { HonoEnv } from "@/pkg/hono/env";
import { logger } from "@/pkg/logger/logger";
import type { MiddlewareHandler } from "hono";

export function init(): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    const requestId = c.get("requestId");
    c.set("logger", logger.child({ requestId }));

    // * Set the services context
    c.set("services", {
      db: db,
    });

    await next();
  };
}
