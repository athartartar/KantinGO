import { and, count, desc, eq } from "drizzle-orm";
import { HOME_POPULAR_MENUS_LIMIT, HOME_STALLS_LIMIT } from "../config/constants";
import { db } from "../db";
import { notifications, stalls, users, type Category } from "../db/schema";
import { AppError } from "../lib/errors";
import { getCategories } from "./category.service";
import { getPopularMenus, type PopularMenuItem } from "./menu.service";

export type StallSummary = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  locationNote: string | null;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  ratingAverage: string;
  ratingCount: number;
};

export type HomeDataResult = {
  greetingName: string;
  points: number;
  unreadNotificationCount: number;
  popularMenus: PopularMenuItem[];
  categories: Category[];
  stalls: StallSummary[];
};

export async function getHomeData(userId: string): Promise<HomeDataResult> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      points: users.points,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  const [unreadRows, popularMenus, categoryList, stallsList] = await Promise.all([
    db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      ),
    getPopularMenus(HOME_POPULAR_MENUS_LIMIT),
    getCategories(),
    db
      .select({
        id: stalls.id,
        name: stalls.name,
        slug: stalls.slug,
        imageUrl: stalls.imageUrl,
        locationNote: stalls.locationNote,
        openTime: stalls.openTime,
        closeTime: stalls.closeTime,
        isOpen: stalls.isOpen,
        ratingAverage: stalls.ratingAverage,
        ratingCount: stalls.ratingCount,
      })
      .from(stalls)
      .orderBy(desc(stalls.isOpen), desc(stalls.ratingAverage))
      .limit(HOME_STALLS_LIMIT),
  ]);

  const greetingName = user.name.trim().split(" ")[0] || user.name;
  const unreadNotificationCount = Number(unreadRows[0]?.count || 0);

  return {
    greetingName,
    points: user.points,
    unreadNotificationCount,
    popularMenus,
    categories: categoryList,
    stalls: stallsList,
  };
}
