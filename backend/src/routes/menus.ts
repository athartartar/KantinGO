import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { menus as menusTable } from "../db/schema";

export const menus = new Hono().get("/", async (c) => {
  const data = await db
    .select()
    .from(menusTable)
    .where(eq(menusTable.isAvailable, true));
  return c.json(data);
});
