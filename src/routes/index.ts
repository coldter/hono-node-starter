import type { App } from "@/pkg/hono/app";
import { setupAuthApiRoutes } from "@/routes/auth/route";

export const setupApiRoutes = (app: App) => {
  setupAuthApiRoutes(app);
};
