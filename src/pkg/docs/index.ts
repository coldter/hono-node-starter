import type { App } from "@/pkg/hono/app";
import type { HonoEnv } from "@/pkg/hono/env";
import type { OpenAPIObjectConfigure } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

const customCss: string = `
  .darklight-reference-promo {
      display: none !important;
  }
`;

type ExtractConfig<T> = T extends (...args: any[]) => any ? never : T;
type OpenAPIObjectConfig = ExtractConfig<OpenAPIObjectConfigure<any, any>>;
type TagObject = NonNullable<OpenAPIObjectConfig["tags"]>[number];

export const docs = (app: App, enable: boolean) => {
  if (!enable) {
    return;
  }

  const registry = app.openAPIRegistry;

  registry.registerComponent("securitySchemes", "bearerAuth", {
    scheme: "bearer",
    description: "firebase bearer token",
    type: "http",
    bearerFormat: "JWT",
  });

  const commonTags: TagObject[] = [
    {
      name: "auth",
      description:
        "Authentication related endpoints. With complimentary endpoint to firebase auth.",
    },
  ];

  app.doc31("/openapi.json", {
    servers: [{ url: "http://localhost:3100" }],
    info: {
      title: "Api Reference",
      version: "v1",
    },
    openapi: "3.1.0",
    tags: commonTags,
    security: [{ bearerAuth: [] }],
  });

  app.get("/docs", (c) => {
    return apiReference<HonoEnv>({
      spec: {
        url: "openapi.json",
      },
      theme: "deepSpace",
      customCss: customCss,
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
