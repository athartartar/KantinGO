import { desc, eq } from "drizzle-orm";
import { HOME_POPULAR_MENUS_LIMIT } from "../config/constants";
import { db } from "../db";
import {
  categories,
  menuAddons,
  menus,
  stalls,
  type Menu,
  type MenuAddon,
} from "../db/schema";
import { AppError } from "../lib/errors";

export type PopularMenuItem = Menu & {
  stallName: string;
  stall: {
    id: string;
    name: string;
    slug: string;
  };
};

export type MenuDetailResult = Menu & {
  stall: {
    id: string;
    name: string;
    slug: string;
    isOpen: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  addons: MenuAddon[];
};

export async function getPopularMenus(
  limit = HOME_POPULAR_MENUS_LIMIT
): Promise<PopularMenuItem[]> {
  const rows = await db
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
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
      stallName: stalls.name,
      stallSlug: stalls.slug,
    })
    .from(menus)
    .innerJoin(stalls, eq(menus.stallId, stalls.id))
    .where(eq(menus.isAvailable, true))
    .orderBy(desc(menus.orderCount))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    stallId: row.stallId,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    price: row.price,
    isAvailable: row.isAvailable,
    orderCount: row.orderCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    stallName: row.stallName,
    stall: {
      id: row.stallId,
      name: row.stallName,
      slug: row.stallSlug,
    },
  }));
}

export async function getMenuDetail(menuId: string): Promise<MenuDetailResult> {
  const [row] = await db
    .select({
      menu: menus,
      stall: stalls,
      category: categories,
    })
    .from(menus)
    .innerJoin(stalls, eq(menus.stallId, stalls.id))
    .innerJoin(categories, eq(menus.categoryId, categories.id))
    .where(eq(menus.id, menuId))
    .limit(1);

  if (!row) {
    throw new AppError("Menu tidak ditemukan", 404);
  }

  const addons = await db
    .select()
    .from(menuAddons)
    .where(eq(menuAddons.menuId, menuId));

  return {
    ...row.menu,
    stall: {
      id: row.stall.id,
      name: row.stall.name,
      slug: row.stall.slug,
      isOpen: row.stall.isOpen,
    },
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
    },
    addons,
  };
}

export async function getMenus(): Promise<Menu[]> {
  return db
    .select()
    .from(menus)
    .where(eq(menus.isAvailable, true));
}
