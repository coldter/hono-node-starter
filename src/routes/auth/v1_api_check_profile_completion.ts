import { isPublicAccess } from "@/middleware/guard";
import { errorResponses, successWithDataSchema } from "@/pkg/common/common-responses";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { App } from "@/pkg/hono/app";
import { z } from "@hono/zod-openapi";

const checkProfileCompletionRequestSchema = z.object({});

const checkProfileCompletion200ResponseSchema = z.object({});

const route = createRouteConfig({
  tags: ["auth"],
  summary: "Check profile completion",
  method: "post",
  path: "/v1/auth.checkProfileCompletion",
  guard: isPublicAccess,
  operationId: "checkProfileCompletion",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: checkProfileCompletionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: successWithDataSchema(checkProfileCompletion200ResponseSchema),
        },
      },
    },
    ...errorResponses,
  },
});

export const registerV1ApiCheckProfileCompletion = (app: App) => {
  app.openapi(route, async (c) => {
    return c.json({ success: true, data: {} }, 200);
  });
};
