import { randomUUID } from "node:crypto";
import { accounts } from "@/database/schema";
import { isPublicAccess } from "@/middleware/guard";
import { errorResponses, successWithDataSchema } from "@/pkg/common/common-responses";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { App } from "@/pkg/hono/app";
import { getCtxDatabase, getCtxFirebaseAuth } from "@/pkg/lib/context";
import { formatMobileNumber, isMobileNumberValid } from "@/pkg/utils/phone-number";
import { typeIdGenerator } from "@/pkg/utils/typeid";
import { z } from "@hono/zod-openapi";
import { pascalCase } from "change-case";
import { Argon2id } from "oslo/password";

const createUserWithPhoneVerificationRequestSchema = z.object({
  mobile: z
    .string()
    .refine(
      (value) => {
        return isMobileNumberValid(value);
      },
      {
        message: "Invalid phone number",
      },
    )
    .transform((value) => {
      return formatMobileNumber(value);
    }),
  firstName: z.string().transform((value) => {
    return pascalCase(value.trim().toLowerCase());
  }),
  lastName: z.string().transform((value) => {
    return pascalCase(value.trim().toLowerCase());
  }),
  email: z
    .string()
    .email()
    .transform((v) => {
      return v.trim().toLowerCase();
    })
    .optional(),
});

const createUserWithPhoneVerification200ResponseSchema = z.object({
  publicId: z.string(),
  email: z.string().optional(),
  mobile: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
});

const route = createRouteConfig({
  tags: ["auth"],
  summary: "Create user with phone verification",
  method: "post",
  path: "/v1/auth.createUserWithPhoneVerification",
  guard: isPublicAccess,
  operationId: "createUserWithPhoneVerification",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createUserWithPhoneVerificationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: successWithDataSchema(createUserWithPhoneVerification200ResponseSchema),
        },
      },
    },
    ...errorResponses,
  },
});

export const registerV1ApiCreateUserWithPhoneVerification = (app: App) => {
  app.openapi(route, async (c) => {
    const db = getCtxDatabase();
    const firebaseAuth = getCtxFirebaseAuth();

    const body = c.req.valid("json");

    const data = await db.transaction(async (trx) => {
      const [insertedUser] = await trx
        .insert(accounts)
        .values({
          email: body.email ?? `${randomUUID()}@example.com`,
          firstName: body.firstName,
          lastName: body.lastName,
          passwordHash: await new Argon2id().hash(randomUUID()),
          mobile: body.mobile,
          publicId: typeIdGenerator("account"),
          role: "user",
        })
        .returning();

      if (!insertedUser) {
        throw new Error("Failed to create user");
      }

      await firebaseAuth.createUser({
        uid: insertedUser.publicId,
        phoneNumber: body.mobile,
        email: body.email,
        displayName: `${body.firstName} ${body.lastName}`,
        emailVerified: false,
      });

      await firebaseAuth.setCustomUserClaims(insertedUser.publicId, {
        role: insertedUser.role,
        isProfileCompleted: true,
      });

      return insertedUser;
    });

    return c.json(
      {
        success: true,
        data: {
          publicId: data.publicId,
          email: data.email,
          mobile: data.mobile,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
      200,
    );
  });
};
