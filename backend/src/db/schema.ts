import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const canteens = pgTable("canteens", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  isOpen: boolean("is_open").notNull().default(true),
});

export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  canteenId: integer("canteen_id")
    .notNull()
    .references(() => canteens.id),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
});
