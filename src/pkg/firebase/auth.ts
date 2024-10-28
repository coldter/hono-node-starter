import { app } from "@/pkg/firebase/app";
import { getAuth } from "firebase-admin/auth";

export const firebaseAuth = getAuth(app);
