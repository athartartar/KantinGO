import { and, eq, ilike, or } from "drizzle-orm";
import { DEFAULT_SEARCH_LIMIT } from "../config/constants";
import { db } from "../db";
import { menus, stalls, type Stall } from "../db/schema";

export type SearchMenuItem = {
  id: string;
  stallId: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isAvailable: boolean;
  orderCount: number;
  stallName: string;
};

export type SearchResult = {
  menus: SearchMenuItem[];
  stalls: Stall[];
};

export async function searchCatalog(
  query: string,
  limit = DEFAULT_SEARCH_LIMIT
): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      menus: [],
      stalls: [],
    };
  }

  const pattern = `%${trimmed}%`;

  const [matchingMenus, matchingStalls] = await Promise.all([
    db
      .select({
        id: menus.id,
        stallId: menus.stallId,
        categoryId: menus.categoryId,
        name: menus.name,
        description: menus.description,
        imageUrl: menus.imageUrl,
        price: menus.price,
        isAvailable: menus.isAvailable,
        orderCount: menus.orderCount,
        stallName: stalls.name,
      })
      .from(menus)
      .innerJoin(stalls, eq(menus.stallId, stalls.id))
      .where(
        and(
          eq(menus.isAvailable, true),
          or(ilike(menus.name, pattern), ilike(menus.description, pattern))
        )
      )
      .limit(limit),
    db
      .select()
      .from(stalls)
      .where(
        or(ilike(stalls.name, pattern), ilike(stalls.description, pattern))
      )
      .limit(limit),
  ]);

  return {
    menus: matchingMenus,
    stalls: matchingStalls,
  };
}
