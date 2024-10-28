import type { HonoEnv } from "@/pkg/hono/env";
import { createMiddleware } from "hono/factory";

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
    return next();
  }
  // * Verify the token

  return next();
});
