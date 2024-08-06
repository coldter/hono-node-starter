import type { Database } from "@/database/db";
import type { HttpBindings } from "@hono/node-server";
import type { Logger } from "winston";

export type ServiceContext = {
  db: Database;
};
export type HonoEnv = {
  Bindings: HttpBindings;
  Variables: {
    services: ServiceContext;
    requestId: string;
    logger: Logger;
  };
};
