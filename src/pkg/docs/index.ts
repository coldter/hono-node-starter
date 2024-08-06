import type { App } from "@/pkg/hono/app";
import type { HonoEnv } from "@/pkg/hono/env";
import { apiReference } from "@scalar/hono-api-reference";

export const docs = (app: App, enable: boolean) => {
  if (!enable) {
    return;
  }

  app.doc31("/openapi.json", {
    servers: [{ url: "http://localhost:3100" }],
    info: {
      title: "Api Reference",
      version: "v1",
    },
    openapi: "3.1.0",
  });

  app.get("/docs", (c) => {
    return apiReference<HonoEnv>({
      spec: {
        url: "openapi.json",
      },
      theme: "deepSpace",
      servers: [
        {
          url: `${c.req.url.replace(/\/docs*$/, "")}`,
          description: "Current",
        },
        {
          url: "http://localhost:3100",
          description: "Localhost",
        },
        {
          url: "{CUSTOM_URL}",
          description: "Custom",
          variables: {
            CUSTOM_URL: {
              default: "http://localhost:3100",
            },
          },
        },
      ],
    })(c, async () => {});
  });
};
