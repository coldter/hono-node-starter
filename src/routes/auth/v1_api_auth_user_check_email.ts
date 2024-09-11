import { isPublicAccess } from "@/middleware/guard";
import { errorResponses, successWithDataSchema } from "@/pkg/common/common-responses";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { App } from "@/pkg/hono/app";
import { z } from "@hono/zod-openapi";

const userCheckEmail = z.object({
  email: z.string().email(),
});

const route = createRouteConfig({
  tags: ["auth.user"],
  method: "post",
  path: "/v1/auth.userCheckEmail",
  guard: isPublicAccess,
  operationId: "userCheckEmail",
  summary: "Check if email is already registered",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: userCheckEmail,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: successWithDataSchema(
            z.object({
              found: z.boolean(),
            }),
          ),
        },
      },
    },
    ...errorResponses,
  },
});

export const registerV1ApiAuthUserCheckEmail = (app: App) => {
  app.openapi(route, async (c) => {
    const { email } = c.req.valid("json");
    const db = c.get("services").db;

    const user = await db.query.accounts.findFirst({
      columns: {
        email: true,
      },
      where: (t, { eq }) => eq(t.email, email.toLowerCase()),
    });

    if (!user) {
      return c.json({ success: true, data: { found: false } }, 200);
    }

    return c.json({ success: true, data: { found: true } }, 200);
  });
};
