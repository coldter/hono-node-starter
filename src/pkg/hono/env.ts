import type { Database } from "@/database/db";
import type { HttpBindings } from "@hono/node-server";
import type { Auth } from "firebase-admin/auth";
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
    firebaseAuth: Auth;
    // TODO: fix type of user
    user: object | null;
  };
};
