import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { stalls } from "./stalls";

export const menus = pgTable(
  "menus",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    stallId: uuid("stall_id")
      .notNull()
      .references(() => stalls.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    price: integer("price").notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
    orderCount: integer("order_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("menus_stall_id_idx").on(table.stallId),
    index("menus_category_id_idx").on(table.categoryId),
    index("menus_name_idx").on(table.name),
    index("menus_is_available_idx").on(table.isAvailable),
  ]
);

export const menuAddons = pgTable(
  "menu_addons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => menus.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("menu_addons_menu_id_idx").on(table.menuId),
    index("menu_addons_is_available_idx").on(table.isAvailable),
  ]
);
