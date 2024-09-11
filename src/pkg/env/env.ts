import { z } from "@hono/zod-openapi";

export const zEnv = z.object({
  VERSION: z.string().default("unknown"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "verbose"]).default("info"),
  PG_DATABASE_URL: z.string({
    message: "Postgres database URL is required",
  }),
});

export const appEnv = zEnv.parse(process.env);
export type Env = z.infer<typeof zEnv>;
