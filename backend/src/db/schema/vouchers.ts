import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userVoucherStatusEnum, voucherTypeEnum } from "./enums";
import { users } from "./users";

export const vouchers = pgTable(
  "vouchers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    type: voucherTypeEnum("type").notNull(),
    value: integer("value").notNull(),
    minPurchase: integer("min_purchase").notNull().default(0),
    maxDiscount: integer("max_discount"),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isPointReward: boolean("is_point_reward").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vouchers_code_idx").on(table.code),
    index("vouchers_is_active_idx").on(table.isActive),
    index("vouchers_is_point_reward_idx").on(table.isPointReward),
  ]
);

export const userVouchers = pgTable(
  "user_vouchers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    voucherId: uuid("voucher_id")
      .notNull()
      .references(() => vouchers.id, { onDelete: "cascade" }),
    status: userVoucherStatusEnum("status").notNull().default("available"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).defaultNow().notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    usedOrderId: uuid("used_order_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_vouchers_user_id_idx").on(table.userId),
    index("user_vouchers_voucher_id_idx").on(table.voucherId),
    index("user_vouchers_status_idx").on(table.status),
  ]
);
