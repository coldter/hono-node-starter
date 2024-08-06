import { createConnection } from "@/database/db";

export const db = await createConnection();
