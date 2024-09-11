import { appEnv } from "@/pkg/env/env";
import { logger } from "@/pkg/logger/logger";
import { DrizzleLogger } from "@/pkg/logger/sql";
import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export async function createConnection(): Promise<Database> {
  const pool = new pg.Pool({
    connectionString: appEnv.PG_DATABASE_URL,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
    min: 0,
  });

  await checkDbConnection(pool);

  return drizzle(pool, {
    schema,
    logger: appEnv.NODE_ENV === "development" ? new DrizzleLogger() : false,
  });
}

export async function checkDbConnection(pool: pg.Pool): Promise<void> {
  const client = await pool.connect().catch((err) => {
    logger.error("Failed to connect to database");
    throw new Error("Failed to connect to database", { cause: err });
  });
  const res = await client.query("SELECT NOW()").catch((err) => {
    logger.error("Failed to connect to database");
    throw new Error("Failed to connect to database", { cause: err });
  });
  logger.info("Connected to database", { dbTime: res.rows[0].now });
  client.release(true);
}
