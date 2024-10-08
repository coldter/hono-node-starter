import { commonTableColumns } from "@/database/utils";
import { typeIdDataType as publicId } from "@/pkg/utils/typeid";
import { isNotNull, relations } from "drizzle-orm";
import { bigint, boolean, integer, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const roleEnum = ["user", "admin"] as const;
export type Role = (typeof roleEnum)[number];

const foreignKey = (columnName: string) => integer(columnName);

// TODO: add indexes and foreign keys

export const accounts = pgTable(
  "accounts",
  {
    ...commonTableColumns,
    publicId: publicId("account", "public_id").notNull(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name"),
    email: varchar("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    role: varchar("role", { enum: roleEnum }).notNull().default("user"),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    lastLoginAt: bigint("last_login_at", { mode: "number" }),
    mobile: varchar("mobile", { length: 20 }),
  },
  (t) => ({
    publicIdIndex: uniqueIndex("public_id_idx_acc").on(t.publicId),
    emailIndex: uniqueIndex("email_idx").on(t.email),
    roleMobileIndex: uniqueIndex("role_mobile_idx").on(t.role, t.mobile).where(isNotNull(t.mobile)),
  }),
);

export const accountRelations = relations(accounts, (r) => ({
  sessions: r.many(sessions),
}));

export type AccountDbType = typeof accounts.$inferSelect;
export type InsertAccountDbType = typeof accounts.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    ...commonTableColumns,
    publicId: publicId("accountSession", "public_id").notNull(),
    accountId: foreignKey("account_id").notNull(),
    accountPublicId: publicId("account", "account_public_id").notNull(),
    sessionToken: varchar("session_token", { length: 255 }).notNull(),
    device: varchar("device", { length: 255 }).notNull(),
    os: varchar("os", { length: 255 }).notNull(),
    expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  },
  (t) => ({
    publicIdIndex: uniqueIndex("public_id_idx_ses").on(t.publicId),
    accountIdIndex: uniqueIndex("account_id_idx").on(t.accountId),
    sessionTokenIndex: uniqueIndex("session_token_idx").on(t.sessionToken),
    expiresAtIndex: uniqueIndex("expires_at_idx").on(t.expiresAt),
  }),
);

export const sessionRelations = relations(sessions, (r) => ({
  account: r.one(accounts, {
    fields: [sessions.accountId],
    references: [accounts.id],
  }),
}));

export type SessionDbType = typeof sessions.$inferSelect;
export type InsertSessionDbType = typeof sessions.$inferInsert;
