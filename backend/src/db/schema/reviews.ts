import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { stalls } from "./stalls";
import { users } from "./users";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stallId: uuid("stall_id")
      .notNull()
      .references(() => stalls.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reviews_order_id_idx").on(table.orderId),
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_stall_id_idx").on(table.stallId),
    check("reviews_rating_range", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ]
);
