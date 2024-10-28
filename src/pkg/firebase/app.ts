import { serviceAccount } from "@/pkg/firebase/config";
import { cert, initializeApp } from "firebase-admin/app";

export const app = initializeApp({
  credential: cert(serviceAccount),
});
