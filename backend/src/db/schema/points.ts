import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pointTransactionTypeEnum } from "./enums";
import { orders } from "./orders";
import { users } from "./users";

export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: pointTransactionTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("point_transactions_user_id_idx").on(table.userId),
    index("point_transactions_type_idx").on(table.type),
    index("point_transactions_order_id_idx").on(table.orderId),
  ]
);
