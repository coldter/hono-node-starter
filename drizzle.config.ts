import { appEnv } from "@/pkg/env/env";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/database/schema/index.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: appEnv.PG_DATABASE_URL,
  },
} satisfies Config;
