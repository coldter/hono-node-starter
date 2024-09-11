import type { App } from "@/pkg/hono/app";
import { registerV1ApiAuthUserCheckEmail } from "@/routes/auth/v1_api_auth_user_check_email";
import { registerV1ApiAuthUserSignup } from "@/routes/auth/v1_api_auth_user_signup";
import { registerV1ApiUserLoginWithEmailAndPass } from "@/routes/auth/v1_api_user_login_with_email_and_pass";

export const setupAuthApiRoutes = (app: App) => {
  registerV1ApiUserLoginWithEmailAndPass(app);
  registerV1ApiAuthUserSignup(app);
  registerV1ApiAuthUserCheckEmail(app);
};
