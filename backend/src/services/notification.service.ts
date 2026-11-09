import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { notifications, type Notification } from "../db/schema";
import { AppError } from "../lib/errors";

export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function markAsRead(
  userId: string,
  notificationId: string
): Promise<Notification> {
  const [notification] = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .limit(1);

  if (!notification) {
    throw new AppError("Notifikasi tidak ditemukan", 404);
  }

  const [updated] = await db
    .update(notifications)
    .set({
      isRead: true,
    })
    .where(eq(notifications.id, notificationId))
    .returning();

  return updated;
}

export async function markAllAsRead(
  userId: string
): Promise<{ updatedCount: number }> {
  const updatedRows = await db
    .update(notifications)
    .set({
      isRead: true,
    })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    )
    .returning({ id: notifications.id });

  return {
    updatedCount: updatedRows.length,
  };
}
