import { accounts } from "@/database/schema";
import { hasAdminAccess } from "@/middleware/guard/authz";
import { isAuthenticated } from "@/middleware/guard/is-authenticated";
import {
  errorResponses,
  successWithDataSchema,
  withPaginationSchema,
} from "@/pkg/common/common-responses";
import { paginationQuerySchema } from "@/pkg/common/common-schemas";
import { createRouteConfig } from "@/pkg/common/route-config";
import type { App } from "@/pkg/hono/app";
import { getCtxDatabase } from "@/pkg/lib/context";
import { getOrderColumn } from "@/pkg/utils/drizzle";
import { z } from "@hono/zod-openapi";
import { type SQL, and, count, eq, ilike } from "drizzle-orm";

const listAllUserRequestSchema = z.object({});

const listAllUser200ResponseSchema = z.object({
  publicId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string(),
  createdAt: z.number(),
  mobile: z.string(),
});

const route = createRouteConfig({
  tags: ["admin"],
  summary: "List all user",
  method: "post",
  path: "/v1/admin.listAllUser",
  guard: [isAuthenticated(), hasAdminAccess],
  operationId: "listAllUser",
  request: {
    query: paginationQuerySchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: listAllUserRequestSchema,
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "",
      content: {
        "application/json": {
          schema: successWithDataSchema(withPaginationSchema(listAllUser200ResponseSchema)),
        },
      },
    },
    ...errorResponses,
  },
});

export const registerV1ApiListAllUser = (app: App) => {
  app.openapi(route, async (c) => {
    const db = getCtxDatabase();

    const { limit, offset, order, sort, q } = c.req.valid("query");

    const filters: SQL[] = [];

    if (q) {
      const sanitizedQ = `%${q.trim()}%`;
      filters.push(ilike(accounts.firstName, sanitizedQ));
    }

    const orderColumn = getOrderColumn(
      {
        createdAt: accounts.createdAt,
      },
      sort,
      accounts.createdAt,
      order,
    );

    const usersQuery = db
      .select({
        publicId: accounts.publicId,
        firstName: accounts.firstName,
        lastName: accounts.lastName,
        email: accounts.email,
        createdAt: accounts.createdAt,
        mobile: accounts.mobile,
      })
      .from(accounts)
      .where(and(...filters, eq(accounts.role, "user")))
      .orderBy(orderColumn);

    const users = await usersQuery.limit(limit).offset(offset);

    const [d] = await db.select({ total: count() }).from(usersQuery.as("users"));

    return c.json(
      {
        success: true,
        data: {
          items: users,
          total: d?.total ?? 0,
        },
      },
      200,
    );
  });
};
