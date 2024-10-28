import { authMiddleware } from "@/middleware/auth";
import { init } from "@/middleware/init";
import { rateLimiter } from "@/middleware/rate-limiter";
import { docs } from "@/pkg/docs";
import { appEnv } from "@/pkg/env/env";
import { newApp } from "@/pkg/hono/app";
import {
  setupHealthReporting,
  setupHonoListener,
  setupRouteLogger,
  setupRuntime,
} from "@/pkg/hono/setup";
import { setupApiRoutes } from "@/routes";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { seconds } from "itty-time";

const app = newApp();

app.use("*", init());
app.use("*", cors({ credentials: true, origin: "*" }));
app.use("*", secureHeaders());
app.use("*", authMiddleware);
// * Rate limiter middleware
app.use(
  "*",
  rateLimiter(
    {
      points: 50,
      duration: seconds("1 hour"),
      blockDuration: seconds("10 minutes"),
    },
    "fail",
  ),
);

setupHealthReporting(app, { service: "ApiService" });
setupRouteLogger(app, appEnv.NODE_ENV === "development");

// * Register API routes
setupApiRoutes(app);

// Init OpenAPI docs
docs(app, appEnv.NODE_ENV !== "production");

const cleanup = setupHonoListener(app, { port: appEnv.PORT });

setupRuntime([cleanup]);
