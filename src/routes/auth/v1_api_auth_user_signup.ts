import { accounts } from "@/database/schema";
import { isPublicAccess } from "@/middleware/guard";
import { errorResponses, successWithDataSchema } from "@/pkg/common/common-responses";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { TErrorSchema } from "@/pkg/errors/http";
import type { App } from "@/pkg/hono/app";
import { createLuciaSessionCookie } from "@/pkg/utils/session";
import { typeIdGenerator } from "@/pkg/utils/typeid";
import { z } from "@hono/zod-openapi";
import { count, eq, or } from "drizzle-orm";
import { Argon2id } from "oslo/password";

const userSignupWithEmailRequestSchema = z.object({
  firstName: z.string().min(1).max(255).openapi({
    default: "John",
    description: "First name of the user",
  }),
  lastName: z.string().min(1).max(255).optional().openapi({
    default: "Doe",
    description: "Last name of the user",
  }),
  email: z.string().email().openapi({
    default: "test@test.com",
    description: "Email of the user",
  }),
  password: z.string().min(8).max(255).openapi({
    default: "password",
    description: "Password of the user must be at least 8 characters",
  }),
  mobile: z.string().min(10).max(20).optional().openapi({
    default: "1234567890",
    description: "Mobile number of the user",
  }),
});

const userSignupWithEmail200ResponseSchema = z.object({
  user: z.object({}),
  accessToken: z.string().openapi({
    default: "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    description: "Access token for the user",
  }),
});

const route = createRouteConfig({
  tags: ["auth.user"],
  method: "post",
  path: "/v1/auth.userSignupWithEmail",
  guard: isPublicAccess,
  operationId: "userSignupWithEmail",
  summary: "Signup User with email",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: userSignupWithEmailRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User signed up successfully",
      content: {
        "application/json": {
          schema: successWithDataSchema(userSignupWithEmail200ResponseSchema),
        },
      },
    },
    ...errorResponses,
  },
});

export const registerV1ApiAuthUserSignup = (app: App) => {
  app.openapi(route, async (c) => {
    const input = c.req.valid("json");
    const { db } = c.get("services");

    const [exits = { count: 0 }] = await db
      .select({
        count: count(accounts.id),
      })
      .from(accounts)
      .where(
        or(
          eq(accounts.email, input.email),
          input.mobile ? eq(accounts.mobile, input.mobile) : undefined,
        ),
      );

    if (exits?.count > 0) {
      return c.json<TErrorSchema, 400>(
        {
          success: false,
          error: {
            message: "User already exists with this email or mobile",
            code: "NOT_UNIQUE",
          },
          requestId: c.get("requestId"),
        },
        400,
      );
    }

    const response = await db.transaction(async (trx) => {
      const passwordHash = await new Argon2id().hash(input.password);
      const publicId = typeIdGenerator("account");

      const [user] = await trx
        .insert(accounts)
        .values({
          passwordHash,
          publicId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          mobile: input.mobile,
        })
        .returning({
          id: accounts.id,
          publicId: accounts.publicId,
          role: accounts.role,
        });

      return user;
    });

    if (!response) {
      return c.json<TErrorSchema, 500>(
        {
          success: false,
          error: {
            message: "Failed to create user",
            code: "INTERNAL_SERVER_ERROR",
          },
          requestId: c.get("requestId"),
        },
        500,
      );
    }

    const sessionCookie = await createLuciaSessionCookie(c, {
      accountId: response.id,
      publicId: response.publicId,
      role: response.role,
    });

    return c.json(
      {
        success: true,
        data: {
          user: {
            email: input.email,
            emailVerified: false,
            publicId: response.publicId,
            role: response.role,
          },
          accessToken: sessionCookie.value,
        },
      },
      200,
    );
  });
};
