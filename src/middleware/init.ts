import { db } from "@/database";
import { firebaseAuth } from "@/pkg/firebase/auth";
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
    // * Set the firebaseAuth context
    c.set("firebaseAuth", firebaseAuth);

    await next();
  };
}
