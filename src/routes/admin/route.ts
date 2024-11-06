import type { App } from "@/pkg/hono/app";
import { registerV1ApiListAllUser } from "@/routes/admin/v1_api_list_all_user";

export const setupAdminApiRoutes = (app: App) => {
  registerV1ApiListAllUser(app);
};
