import { boolean, index, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const stalls = pgTable(
  "stalls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    locationNote: text("location_note"),
    openTime: text("open_time").notNull(),
    closeTime: text("close_time").notNull(),
    isOpen: boolean("is_open").notNull().default(true),
    ratingAverage: numeric("rating_average", { precision: 2, scale: 1 }).notNull().default("0.0"),
    ratingCount: integer("rating_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("stalls_slug_idx").on(table.slug),
    index("stalls_name_idx").on(table.name),
    index("stalls_is_open_idx").on(table.isOpen),
  ]
);
