import { appEnv } from "@/pkg/env/env";
import { RedisNoopClient } from "@/pkg/ioredis/noop-client";
import { logger } from "@/pkg/logger/logger";
import { Redis } from "ioredis";

async function createRedisClient(url: string) {
  const client = new Redis(url);

  const result = await client.ping().catch((e) => {
    logger.error("Failed to connect to Redis", { error: e });
    throw e;
  });

  logger.info("Connected to Redis", { result });

  return client;
}

export const ioredis = appEnv.REDIS_URL
  ? await createRedisClient(appEnv.REDIS_URL)
  : new RedisNoopClient();
