import { index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { menuAddons, menus } from "./menus";
import { stalls } from "./stalls";
import { users } from "./users";

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    stallId: uuid("stall_id").references(() => stalls.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("carts_stall_id_idx").on(table.stallId),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => menus.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cart_items_cart_id_idx").on(table.cartId),
    index("cart_items_menu_id_idx").on(table.menuId),
  ]
);

export const cartItemAddons = pgTable(
  "cart_item_addons",
  {
    cartItemId: uuid("cart_item_id")
      .notNull()
      .references(() => cartItems.id, { onDelete: "cascade" }),
    addonId: uuid("addon_id")
      .notNull()
      .references(() => menuAddons.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.cartItemId, table.addonId] }),
    index("cart_item_addons_addon_id_idx").on(table.addonId),
  ]
);
