import { and, count, desc, eq, sum } from "drizzle-orm";
import { db } from "../db";
import {
  orders,
  reviews,
  stalls,
  users,
  type Review,
} from "../db/schema";
import { AppError } from "../lib/errors";
import type {
  CreateReviewInput,
  StallReviewsQueryInput,
} from "../validators/review.validator";

export type StallReviewItem = {
  id: string;
  orderId: string;
  stallId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type StallReviewsResult = {
  items: StallReviewItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function createOrderReview(
  userId: string,
  orderId: string,
  input: CreateReviewInput
): Promise<Review> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      throw new AppError("Pesanan tidak ditemukan", 404);
    }

    if (order.status !== "completed") {
      throw new AppError(
        "Hanya pesanan yang sudah selesai yang dapat diulas",
        400
      );
    }

    const [existingReview] = await tx
      .select()
      .from(reviews)
      .where(eq(reviews.orderId, orderId))
      .limit(1);

    if (existingReview) {
      throw new AppError("Pesanan ini sudah pernah diulas", 400);
    }

    const [newReview] = await tx
      .insert(reviews)
      .values({
        orderId,
        userId,
        stallId: order.stallId,
        rating: input.rating,
        comment: input.comment || null,
      })
      .returning();

    const [stats] = await tx
      .select({
        totalRating: sum(reviews.rating),
        reviewCount: count(),
      })
      .from(reviews)
      .where(eq(reviews.stallId, order.stallId));

    const newCount = Number(stats?.reviewCount || 0);
    const totalScore = Number(stats?.totalRating || 0);
    const newAverage =
      newCount > 0 ? (totalScore / newCount).toFixed(1) : "0.0";

    await tx
      .update(stalls)
      .set({
        ratingAverage: newAverage,
        ratingCount: newCount,
        updatedAt: new Date(),
      })
      .where(eq(stalls.id, order.stallId));

    return newReview;
  });
}

export async function getStallReviews(
  stallId: string,
  query: StallReviewsQueryInput
): Promise<StallReviewsResult> {
  const [stall] = await db
    .select({ id: stalls.id })
    .from(stalls)
    .where(eq(stalls.id, stallId))
    .limit(1);

  if (!stall) {
    throw new AppError("Warung tidak ditemukan", 404);
  }

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.stallId, stallId));

  const total = Number(totalCount);
  const offset = (query.page - 1) * query.limit;

  const items = await db
    .select({
      id: reviews.id,
      orderId: reviews.orderId,
      stallId: reviews.stallId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.stallId, stallId))
    .orderBy(desc(reviews.createdAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}
