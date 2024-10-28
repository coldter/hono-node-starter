import { appEnv } from "@/pkg/env/env";
import { createStorage, type StorageValue } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import redisDriver from "unstorage/drivers/redis";
import { seconds } from "itty-time";

function createCachedStorage<T extends StorageValue = StorageValue>(base: string, ttl: number) {
  return createStorage<T>({
    driver:
      appEnv.CACHE_DRIVER === "memory"
        ? memoryDriver()
        : redisDriver({
            url: appEnv.REDIS_URL!,
            ttl,
            base,
          }),
  });
}

export const storage = {
  // TODO: add types
  firebaseUsers: createCachedStorage("firebase-users", seconds("1 hour")),
};
