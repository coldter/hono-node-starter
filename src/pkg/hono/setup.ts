import { appEnv } from "@/pkg/env/env";
import type { HonoEnv } from "@/pkg/hono/env";
import { serverStartedAsciiArt } from "@/pkg/utils/ascii";
import { serve } from "@hono/node-server";
import type { OpenAPIHono } from "@hono/zod-openapi";
import chalk from "chalk";
import { logger } from "hono/logger";

export const setupRouteLogger = <T extends HonoEnv>(app: OpenAPIHono<T>, enabled = true) =>
  enabled ? app.use(logger()) : app;

type HealthReportingOptions = {
  service: string;
  endpoint?: `/${string}`;
};
export const setupHealthReporting = <T extends HonoEnv>(
  app: OpenAPIHono<T>,
  { service, endpoint }: HealthReportingOptions,
) => {
  app.get("/ping", (c) => c.text("pong"));
  // * /health
  app.get(endpoint ?? "/health", (c) => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    c.get("logger").info("Health check", { memoryUsage, uptime });
    return c.json({
      service,
      uptime,
      memoryUsage,
      requestId: c.get("requestId"),
    });
  });
};

type HonoListenerOptions = {
  port: number;
  hostname?: string;
};
type Cleanup = () => Promise<void>;
export const setupHonoListener = <T extends HonoEnv>(
  app: OpenAPIHono<T>,
  { port, hostname }: HonoListenerOptions,
): Cleanup => {
  const server = serve(
    {
      fetch: app.fetch,
      port,
      hostname,
    },
    () => {
      appEnv.NODE_ENV !== "production" && console.info(chalk.red(serverStartedAsciiArt()));

      console.info(`
    =================================================
    🔥 Listening on the port ${chalk.bgCyanBright(port)} in ${appEnv.NODE_ENV} mode
    =================================================`);
    },
  );

  return () =>
    new Promise<void>((r) => {
      console.info("Shutting down Hono server...");
      server.close(() => r());
    });
};

export const setupRuntime = (cleanupFunctions: Array<() => Promise<void> | void>) => {
  let closing = false;
  const handleExit = async () => {
    if (closing) {
      return;
    }
    closing = true;
    await Promise.allSettled(cleanupFunctions.map((fn) => fn()));
    process.exit();
  };

  process.on("unhandledRejection", (err) => console.error(err));
  process.on("uncaughtException", (err) => console.error(err));
  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
};
