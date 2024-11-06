import { ErrorSchema } from "@/pkg/errors/http";
import { z } from "@hono/zod-openapi";
import type { RefinementCtx } from "zod";

export const failWithErrorSchema = ErrorSchema;

const nonZeroNumberRefineFn = (value: string | undefined) => {
  if (!value) {
    return true;
  }
  return Number(value) > 0;
};

const intNumberRefineFn = (value: string | undefined) => {
  if (!value) {
    return true;
  }
  return Number(value) >= 0;
};

const nonZeroNumberTransformFn = (value: string | undefined, _ctx: RefinementCtx): number => {
  return Number(value);
};

export const paginationQuerySchema = z.object({
  q: z.string().optional(),
  sort: z.enum(["createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z
    .string()
    .default("50")
    .refine(nonZeroNumberRefineFn, "limit must be greater than 0")
    .transform(nonZeroNumberTransformFn),
  offset: z
    .string()
    .default("0")
    .refine(intNumberRefineFn, "offset must be an integer")
    .transform(nonZeroNumberTransformFn),
});
