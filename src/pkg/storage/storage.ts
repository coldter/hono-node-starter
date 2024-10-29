import { appEnv } from "@/pkg/env/env";
import type { UserRecord } from "firebase-admin/auth";
import { seconds } from "itty-time";
import { type StorageValue, createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import redisDriver from "unstorage/drivers/redis";

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
  firebaseUsers: createCachedStorage<UserRecord>("firebase-users", seconds("1 hour")),
  // dbAccount: createCachedStorage<AccountDbType>("db-account", seconds("1 hour")),
};
