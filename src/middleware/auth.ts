import { ApiError } from "@/pkg/errors/http";
import { firebaseAuth } from "@/pkg/firebase/auth";
import type { HonoEnv } from "@/pkg/hono/env";
import { storage } from "@/pkg/storage/storage";
import { FirebaseAuthError } from "firebase-admin/auth";
import { createMiddleware } from "hono/factory";

// TODO: add opentelemetry tracing

function getBearerAuthToken(authToken?: string) {
  if (!authToken) {
    return null;
  }
  const [type, token] = authToken.split(" ");
  if (type !== "Bearer") {
    return null;
  }
  return token;
}

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const authorizationToken = c.req.header("Authorization");
  const token = getBearerAuthToken(authorizationToken);
  if (!token) {
    c.set("user", null);
    c.set("decodedIdToken", null);
    return next();
  }
  // * Verify the token
  const decodedToken = await firebaseAuth.verifyIdToken(token).catch((e: unknown) => {
    if (e instanceof FirebaseAuthError) {
      throw new ApiError({ code: "UNAUTHORIZED", message: e.message });
    }
    throw e;
  });
  let user = await storage.firebaseUsers.getItem(decodedToken.uid);

  if (!user) {
    user = await firebaseAuth.getUser(decodedToken.uid).catch((e) => {
      c.get("logger").error(e);
      if (e instanceof FirebaseAuthError) {
        throw new ApiError({ code: "UNAUTHORIZED", message: e.message });
      }
      throw e;
    });
    await storage.firebaseUsers.setItem(decodedToken.uid, user);
  }

  // let account: AccountDbType | null = null;
  // if (user) {
  //   account = await storage.dbAccount.getItem(user.uid);

  //   if (!account) {
  //     const { db } = c.get("services");
  //     const dbAccount = await db.query.accounts.findFirst({
  //       where: (fields, operators) => {
  //         return operators.eq(fields.publicId, typeIdValidator("account").parse(user.uid));
  //       },
  //     });
  //     if (!dbAccount) {
  //       throw new ApiError({ code: "UNAUTHORIZED", message: "Account not found" });
  //     }
  //     account = dbAccount;
  //     await storage.dbAccount.setItem(user.uid, account);
  //   }
  // }

  c.set("decodedIdToken", decodedToken);
  c.set("user", user);
  // c.set("account", account);

  return next();
});
