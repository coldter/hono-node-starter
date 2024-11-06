import type { AccountDbType } from "@/database/schema";
import { errorResponse } from "@/pkg/errors/http";
import type { HonoEnv } from "@/pkg/hono/env";
import { getCtxDatabase, getCtxFirebaseAuth, getCtxUser } from "@/pkg/lib/context";
import type { TypeId } from "@/pkg/utils/typeid";
import { createMiddleware } from "hono/factory";

export const checkRole = ({
  role = "user",
}: {
  role?: AccountDbType["role"];
} = {}) => {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const user = getCtxUser();
    if (!user) {
      return errorResponse(c, "UNAUTHORIZED");
    }

    if (!user.customClaims?.role) {
      // If customClaims is not set, then check against the database role
      const db = getCtxDatabase();

      const accountData = await db.query.accounts.findFirst({
        columns: {
          role: true,
        },
        where: (t, { eq }) => {
          return eq(t.publicId, user.uid as TypeId<"account">);
        },
      });

      if (!accountData) {
        return errorResponse(c, "UNAUTHORIZED", "Account not found");
      }

      if (role !== accountData.role) {
        return errorResponse(c, "UNAUTHORIZED", `Role is not allowed ${role}`);
      }

      c.executionCtx.waitUntil(
        (async () => {
          const firebaseAuth = getCtxFirebaseAuth();
          return await firebaseAuth.setCustomUserClaims(user.uid, {
            role,
          });
        })(),
      );
    } else if (role !== user.customClaims.role) {
      return errorResponse(c, "UNAUTHORIZED", `Role is not allowed ${role}`);
    }

    return next();
  });
};

export const hasAdminAccess = checkRole({ role: "admin" });
