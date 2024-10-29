import { isAuthenticated } from "@/middleware/guard/is-authenticated";
import { errorResponses, successWithDataSchema } from "@/pkg/common/common-responses";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { App } from "@/pkg/hono/app";
import { getCtxFirebaseAuth, getCtxUser } from "@/pkg/lib/context";
import { storage } from "@/pkg/storage/storage";
import { z } from "@hono/zod-openapi";

const checkProfileCompletionRequestSchema = z.object({});

export const UserProviderDataSchema = z.object({
  uid: z.string(),
  providerId: z.string(),
});

const checkProfileCompletion200ResponseSchema = z.object({
  isProfileCompleted: z.boolean(),
  provider: z.array(UserProviderDataSchema),
});

const route = createRouteConfig({
  tags: ["auth"],
  summary: "Check profile completion",
  method: "post",
  path: "/v1/auth.checkProfileCompletion",
  guard: isAuthenticated({ checkProfileCompletion: false }),
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
  security: [{ bearerAuth: [] }],
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
    const user = getCtxUser()!;

    if (user.customClaims?.isProfileCompleted) {
      return c.json(
        {
          success: true,
          data: {
            isProfileCompleted: true,
            provider: user.providerData as any,
          },
        },
        200,
      );
    }

    const firebaseAuth = getCtxFirebaseAuth();
    const firebaseUser = await firebaseAuth.getUser(user.uid);

    if (
      firebaseUser.customClaims?.isProfileCompleted === true &&
      !user.customClaims?.isProfileCompleted
    ) {
      await storage.firebaseUsers.setItem(user.uid, firebaseUser);
    }

    return c.json(
      {
        success: true,
        data: {
          isProfileCompleted: firebaseUser.customClaims?.isProfileCompleted || false,
          provider: firebaseUser.providerData as any,
        },
      },
      200,
    );
  });
};
