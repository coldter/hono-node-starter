import { bigint, serial } from "drizzle-orm/pg-core";

export const lifecycleDates = {
  createdAt: bigint("created_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: bigint("updated_at", { mode: "number" })
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now()),
};

export const commonTableColumns = {
  ...lifecycleDates,
  id: serial("id").primaryKey(),
};
