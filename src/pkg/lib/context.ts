import type { HonoEnv } from "@/pkg/hono/env";
import { getContext } from "hono/context-storage";

// ! If call outside of hono request context these will throw context not found error

/**
 * @throws {Error} context not found
 */
export const getCtxDatabase = () => {
  return getContext<HonoEnv>().get("services").db;
};

/**
 * @throws {Error} context not found
 */
export const getCtxLogger = () => {
  return getContext<HonoEnv>().get("logger");
};

/**
 * @throws {Error} context not found
 */
export const getCtxRequestId = () => {
  return getContext<HonoEnv>().get("requestId");
};

/**
 * @throws {Error} context not found
 */
export const getCtxFirebaseAuth = () => {
  return getContext<HonoEnv>().get("firebaseAuth");
};

/**
 * @throws {Error} context not found
 */
export const getCtxUser = () => {
  return getContext<HonoEnv>().get("user");
};
