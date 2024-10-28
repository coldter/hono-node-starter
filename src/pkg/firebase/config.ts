import { appEnv } from "@/pkg/env/env";
import type { ServiceAccount } from "firebase-admin";

export const serviceAccount = {
  clientEmail: appEnv.FIREBASE_CLIENT_EMAIL,
  privateKey: appEnv.FIREBASE_PRIVATE_KEY,
  projectId: appEnv.FIREBASE_PROJECT_ID,
} satisfies ServiceAccount;
