import { errorResponse } from "@/pkg/errors/http";
import type { HonoEnv } from "@/pkg/hono/env";
import { getCtxUser } from "@/pkg/lib/context";
import { createMiddleware } from "hono/factory";

export const isAuthenticated = ({
  checkProfileCompletion = true,
}: {
  checkProfileCompletion?: boolean;
} = {}) => {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const user = getCtxUser();
    if (!user) {
      return errorResponse(c, "UNAUTHORIZED");
    }

    if (checkProfileCompletion) {
      // Check if user profile is completed
      if (!user.customClaims?.isProfileCompleted) {
        return errorResponse(c, "UNAUTHORIZED", "Profile is not completed");
      }
    }

    return next();
  });
};
