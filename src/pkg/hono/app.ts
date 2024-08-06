import { errorResponse, handleError, handleZodError } from "@/pkg/errors/http";
import type { HonoEnv } from "@/pkg/hono/env";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context as GenericContext } from "hono";
import { prettyJSON } from "hono/pretty-json";

export function newApp() {
  // defaultHook
  const app = new OpenAPIHono<HonoEnv>({
    defaultHook: handleZodError,
  });

  app.use(prettyJSON());
  app.onError(handleError);

  app.notFound((c) => errorResponse(c, "ROUTE_NOT_FOUND", "route not found"));

  return app;
}

export type App = ReturnType<typeof newApp>;
export type Context = GenericContext<HonoEnv>;
