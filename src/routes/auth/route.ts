import type { App } from "@/pkg/hono/app";
import { registerV1ApiCheckProfileCompletion } from "@/routes/auth/v1_api_check_profile_completion";
import { registerV1ApiCheckUserRegistrationWithPhoneNumber } from "@/routes/auth/v1_api_check_user_registration_with_phone_number";
import { registerV1ApiCreateUserWithPhoneVerification } from "@/routes/auth/v1_api_create_user_with_phone_verification";

export const setupAuthApiRoutes = (app: App) => {
  registerV1ApiCheckProfileCompletion(app);
  registerV1ApiCheckUserRegistrationWithPhoneNumber(app);
  registerV1ApiCreateUserWithPhoneVerification(app);
};
