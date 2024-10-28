import { errorResponse, handleError, handleZodError } from "@/pkg/errors/http";
import type { HonoEnv } from "@/pkg/hono/env";
import { inActiveSpan } from "@/pkg/otel/helpers";
import { opentelemetry } from "@/pkg/otel/hono";
import { typeIdGenerator, validateTypeId } from "@/pkg/utils/typeid";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context as GenericContext, Next } from "hono";
import { contextStorage } from "hono/context-storage";
import { prettyJSON } from "hono/pretty-json";

function setupCommonIgnoreRoutes<T extends HonoEnv>(app: OpenAPIHono<T>) {
  app.get("/favicon.ico", (c) =>
    c.body(null, {
      status: 204,
      headers: {
        "Cache-Control": "public, max-age=604800", // 1 week
      },
    }),
  );
}

function assignRequestId<T extends HonoEnv>(c: GenericContext<T>, next: Next) {
  // * Set the request id
  const headerId = c.req.header("x-request-id");
  const requestId = validateTypeId("request", headerId) ? headerId : typeIdGenerator("request");
  c.set("requestId", requestId);

  c.res.headers.set("x-request-id", requestId);

  // * Set the span context
  inActiveSpan((span) => {
    span?.setAttributes({
      request_id: requestId,
    });
  });

  return next();
}

export function newApp() {
  // defaultHook
  const app = new OpenAPIHono<HonoEnv>({
    defaultHook: handleZodError,
  });

  app.use(contextStorage());
  app.use(opentelemetry("api/hono"));
  app.use(assignRequestId);
  setupCommonIgnoreRoutes(app);

  app.use(prettyJSON());
  app.onError(handleError);

  app.notFound((c) => errorResponse(c, "ROUTE_NOT_FOUND", "route not found"));

  return app;
}

export type App = ReturnType<typeof newApp>;
export type Context = GenericContext<HonoEnv>;
