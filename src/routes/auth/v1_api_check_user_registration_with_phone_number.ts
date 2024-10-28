import { isPublicAccess } from "@/middleware/guard";
import { errorResponses, successWithDataSchema } from "@/pkg/common/common-responses";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { App } from "@/pkg/hono/app";
import { formatMobileNumber, isMobileNumberValid } from "@/pkg/utils/phone-number";
import { z } from "@hono/zod-openapi";

const checkUserRegistrationWithPhoneNumberRequestSchema = z.object({
  mobile: z.string().refine(
    (value) => {
      return isMobileNumberValid(value);
    },
    {
      message: "Invalid phone number",
    },
  ),
});

const checkUserRegistrationWithPhoneNumber200ResponseSchema = z.object({
  isRegistered: z.boolean(),
  mobile: z.string(),
});

const route = createRouteConfig({
  tags: ["auth"],
  summary: "Check user registration with phone number",
  method: "post",
  path: "/v1/auth.checkUserRegistrationWithPhoneNumber",
  guard: isPublicAccess,
  operationId: "checkUserRegistrationWithPhoneNumber",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: checkUserRegistrationWithPhoneNumberRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: successWithDataSchema(checkUserRegistrationWithPhoneNumber200ResponseSchema),
        },
      },
    },
    ...errorResponses,
  },
});

export const registerV1ApiCheckUserRegistrationWithPhoneNumber = (app: App) => {
  app.openapi(route, async (c) => {
    const body = c.req.valid("json");
    return c.json(
      {
        success: true,
        data: {
          isRegistered: false,
          mobile: formatMobileNumber(body.mobile),
        },
      },
      200,
    );
  });
};
