import type { App } from "@/pkg/hono/app";
import { setupAdminApiRoutes } from "@/routes/admin/route";
import { setupAuthApiRoutes } from "@/routes/auth/route";

export const setupApiRoutes = (app: App) => {
  setupAuthApiRoutes(app);
  setupAdminApiRoutes(app);
};
