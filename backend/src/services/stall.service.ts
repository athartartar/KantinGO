import { asc, count, desc, eq, inArray } from "drizzle-orm";
import {
  PICKUP_MIN_LEAD_MINUTES,
  PICKUP_SLOT_INTERVAL_MINUTES,
} from "../config/constants";
import { db } from "../db";
import { categories, menus, stalls, type Stall } from "../db/schema";
import { AppError } from "../lib/errors";
import type { StallsQueryInput } from "../validators/stall.validator";

export type StallsListResult = {
  items: Stall[];
  stalls: Stall[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StallCategoryGroup = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  menus: Array<typeof menus.$inferSelect>;
};

export type StallDetailResult = Stall & {
  rating: {
    average: number;
    count: number;
  };
  categories: StallCategoryGroup[];
};

function getMinutesFromMidnightInJakarta(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const formatted = formatter.format(date);
  const [hours, minutes] = formatted.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function getStalls(input: StallsQueryInput): Promise<StallsListResult> {
  const { categorySlug, page, limit } = input;
  const offset = (page - 1) * limit;

  if (categorySlug && categorySlug.trim().length > 0) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categorySlug.trim()))
      .limit(1);

    if (!category) {
      return {
        items: [],
        stalls: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const matchingStallRows = await db
      .selectDistinct({ stallId: menus.stallId })
      .from(menus)
      .where(eq(menus.categoryId, category.id));

    const matchingStallIds = matchingStallRows.map((r) => r.stallId);
    if (matchingStallIds.length === 0) {
      return {
        items: [],
        stalls: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(stalls)
      .where(inArray(stalls.id, matchingStallIds));

    const total = Number(totalCount);
    const items = await db
      .select()
      .from(stalls)
      .where(inArray(stalls.id, matchingStallIds))
      .orderBy(desc(stalls.isOpen), desc(stalls.ratingAverage))
      .limit(limit)
      .offset(offset);

    return {
      items,
      stalls: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(stalls);

  const total = Number(totalCount);
  const items = await db
    .select()
    .from(stalls)
    .orderBy(desc(stalls.isOpen), desc(stalls.ratingAverage))
    .limit(limit)
    .offset(offset);

  return {
    items,
    stalls: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStallDetail(stallId: string): Promise<StallDetailResult> {
  const [stall] = await db
    .select()
    .from(stalls)
    .where(eq(stalls.id, stallId))
    .limit(1);

  if (!stall) {
    throw new AppError("Warung tidak ditemukan", 404);
  }

  const stallMenus = await db
    .select({
      menu: menus,
      category: categories,
    })
    .from(menus)
    .innerJoin(categories, eq(menus.categoryId, categories.id))
    .where(eq(menus.stallId, stallId))
    .orderBy(asc(categories.sortOrder), asc(menus.name));

  const categoryMap = new Map<string, StallCategoryGroup>();

  for (const row of stallMenus) {
    let group = categoryMap.get(row.category.id);
    if (!group) {
      group = {
        id: row.category.id,
        name: row.category.name,
        slug: row.category.slug,
        iconUrl: row.category.iconUrl,
        sortOrder: row.category.sortOrder,
        menus: [],
      };
      categoryMap.set(row.category.id, group);
    }
    group.menus.push(row.menu);
  }

  const groupedCategories = Array.from(categoryMap.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return {
    ...stall,
    rating: {
      average: Number(stall.ratingAverage),
      count: stall.ratingCount,
    },
    categories: groupedCategories,
  };
}

export async function getPickupSlots(
  stallId: string,
  now: Date = new Date()
): Promise<string[]> {
  const [stall] = await db
    .select()
    .from(stalls)
    .where(eq(stalls.id, stallId))
    .limit(1);

  if (!stall) {
    throw new AppError("Warung tidak ditemukan", 404);
  }

  if (!stall.isOpen) {
    return [];
  }

  const [openHour, openMinute] = stall.openTime.split(":").map(Number);
  const openMinutes = openHour * 60 + openMinute;

  const [closeHour, closeMinute] = stall.closeTime.split(":").map(Number);
  const closeMinutes = closeHour * 60 + closeMinute;

  const currentMinutes = getMinutesFromMidnightInJakarta(now);
  const minLeadMinutes = currentMinutes + PICKUP_MIN_LEAD_MINUTES;

  const remainder = minLeadMinutes % PICKUP_SLOT_INTERVAL_MINUTES;
  let firstSlotMinutes =
    remainder === 0
      ? minLeadMinutes
      : minLeadMinutes + (PICKUP_SLOT_INTERVAL_MINUTES - remainder);

  if (firstSlotMinutes < openMinutes) {
    firstSlotMinutes = openMinutes;
  }

  const slotIntervalRemainder = firstSlotMinutes % PICKUP_SLOT_INTERVAL_MINUTES;
  if (slotIntervalRemainder !== 0) {
    firstSlotMinutes += (PICKUP_SLOT_INTERVAL_MINUTES - slotIntervalRemainder);
  }

  const slots: string[] = [];
  for (
    let minutes = firstSlotMinutes;
    minutes <= closeMinutes;
    minutes += PICKUP_SLOT_INTERVAL_MINUTES
  ) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }

  return slots;
}
