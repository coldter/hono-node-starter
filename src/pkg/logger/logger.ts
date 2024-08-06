import { appEnv } from "@/pkg/env/env";
import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    appEnv.NODE_ENV === "production"
      ? new transports.Console()
      : new transports.Console({
          format: format.combine(format.timestamp(), format.colorize(), format.simple()),
        }),
  ],
  exitOnError: false,
});
