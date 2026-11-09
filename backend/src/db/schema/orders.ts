import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { orderStatusEnum } from "./enums";
import { menuAddons, menus } from "./menus";
import { stalls } from "./stalls";
import { userVouchers } from "./vouchers";
import { users } from "./users";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderCode: text("order_code").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    stallId: uuid("stall_id")
      .notNull()
      .references(() => stalls.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    pickupTime: timestamp("pickup_time", { withTimezone: true }).notNull(),
    subtotal: integer("subtotal").notNull(),
    discountAmount: integer("discount_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    userVoucherId: uuid("user_voucher_id").references(() => userVouchers.id, { onDelete: "set null" }),
    pointsEarned: integer("points_earned").notNull().default(0),
    pickupToken: text("pickup_token").notNull().unique(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    readyAt: timestamp("ready_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_order_code_idx").on(table.orderCode),
    index("orders_user_id_idx").on(table.userId),
    index("orders_stall_id_idx").on(table.stallId),
    index("orders_status_idx").on(table.status),
    index("orders_pickup_token_idx").on(table.pickupToken),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => menus.id, { onDelete: "restrict" }),
    menuName: text("menu_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    note: text("note"),
    lineTotal: integer("line_total").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_menu_id_idx").on(table.menuId),
  ]
);

export const orderItemAddons = pgTable(
  "order_item_addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    addonId: uuid("addon_id")
      .notNull()
      .references(() => menuAddons.id, { onDelete: "restrict" }),
    addonName: text("addon_name").notNull(),
    addonPrice: integer("addon_price").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_item_addons_order_item_id_idx").on(table.orderItemId),
    index("order_item_addons_addon_id_idx").on(table.addonId),
  ]
);
