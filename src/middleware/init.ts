import { db } from "@/database";
import type { HonoEnv } from "@/pkg/hono/env";
import { logger } from "@/pkg/logger/logger";
import { typeIdGenerator, validateTypeId } from "@/pkg/utils/typeid";
import type { MiddlewareHandler } from "hono";

export function init(): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    // * Set the request id
    const headerId = c.req.header("x-request-id");
    const requestId = validateTypeId("request", headerId) ? headerId : typeIdGenerator("request");
    c.set("requestId", requestId);
    c.set("logger", logger.child({ requestId }));
    c.res.headers.set("x-request-id", requestId);

    // * Set the services context
    c.set("services", {
      db: db,
    });

    await next();
  };
}
