import { logger } from "@/pkg/logger/logger";
import chalk from "chalk";
import { highlight } from "cli-highlight";
import type { Logger } from "drizzle-orm";

export class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    logger.info(
      chalk.cyanBright("DB Query: ") + highlight(query, { language: "sql", ignoreIllegals: true }),
      {
        params,
      },
    );
  }
}
