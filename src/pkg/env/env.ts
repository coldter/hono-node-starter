import { z } from "@hono/zod-openapi";

const stringToJSON = z.string().transform((str, ctx) => {
  try {
    return JSON.parse(str) as unknown;
  } catch (e: unknown) {
    console.error("Invalid JSON", { error: e });
    ctx.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

export const zEnv = z.object({
  VERSION: z.string().default("unknown"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "verbose"]).default("info"),
  PG_DATABASE_URL: z.string({
    message: "Postgres database URL is required",
  }),
  // OpenTelemetry
  OTEL_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  OTEL_EXPORTER_TRACES_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_TRACES_HEADERS: stringToJSON.pipe(z.record(z.string())).optional(),
  OTEL_EXPORTER_LOGS_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_LOGS_HEADERS: stringToJSON.pipe(z.record(z.string())).optional(),
  OTEL_EXPORTER_METRICS_ENDPOINT: z.string().url().optional(),
});

export const appEnv = zEnv.parse(process.env);
export type Env = z.infer<typeof zEnv>;
