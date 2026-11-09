import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  notifications,
  orderItemAddons,
  orderItems,
  orders,
  stalls,
  type Order,
} from "../db/schema";
import { AppError } from "../lib/errors";
import type { OrdersQueryInput } from "../validators/order.validator";
import { awardPoints } from "./point.service";

export type ReceiptAddon = {
  id: string;
  addonId: string;
  addonName: string;
  addonPrice: number;
};

export type ReceiptItem = {
  id: string;
  menuId: string;
  menuName: string;
  unitPrice: number;
  quantity: number;
  note: string | null;
  lineTotal: number;
  addons: ReceiptAddon[];
};

export type OrderReceiptDetail = {
  id: string;
  orderCode: string;
  pickupToken: string;
  pickupTime: Date;
  status:
    | "pending_payment"
    | "processing"
    | "ready"
    | "completed"
    | "cancelled"
    | "expired";
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAt: Date | null;
  readyAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  stall: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    locationNote: string | null;
  };
  items: ReceiptItem[];
};

export type OrderListItem = {
  id: string;
  orderCode: string;
  status:
    | "pending_payment"
    | "processing"
    | "ready"
    | "completed"
    | "cancelled"
    | "expired";
  pickupTime: Date;
  totalAmount: number;
  createdAt: Date;
  stall: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
  itemsSummary: string;
  itemCount: number;
};

async function buildOrderReceipt(orderId: string): Promise<OrderReceiptDetail> {
  const [row] = await db
    .select({
      order: orders,
      stall: {
        id: stalls.id,
        name: stalls.name,
        slug: stalls.slug,
        imageUrl: stalls.imageUrl,
        locationNote: stalls.locationNote,
      },
    })
    .from(orders)
    .innerJoin(stalls, eq(orders.stallId, stalls.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!row) {
    throw new AppError("Pesanan tidak ditemukan", 404);
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const itemIds = items.map((i) => i.id);
  const addonsByItemId = new Map<string, ReceiptAddon[]>();

  if (itemIds.length > 0) {
    const addons = await db
      .select()
      .from(orderItemAddons)
      .where(inArray(orderItemAddons.orderItemId, itemIds));

    for (const addon of addons) {
      const list = addonsByItemId.get(addon.orderItemId) || [];
      list.push({
        id: addon.id,
        addonId: addon.addonId,
        addonName: addon.addonName,
        addonPrice: addon.addonPrice,
      });
      addonsByItemId.set(addon.orderItemId, list);
    }
  }

  const receiptItems: ReceiptItem[] = items.map((item) => ({
    id: item.id,
    menuId: item.menuId,
    menuName: item.menuName,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    note: item.note,
    lineTotal: item.lineTotal,
    addons: addonsByItemId.get(item.id) || [],
  }));

  return {
    id: row.order.id,
    orderCode: row.order.orderCode,
    pickupToken: row.order.pickupToken,
    pickupTime: row.order.pickupTime,
    status: row.order.status,
    subtotal: row.order.subtotal,
    discountAmount: row.order.discountAmount,
    totalAmount: row.order.totalAmount,
    paidAt: row.order.paidAt,
    readyAt: row.order.readyAt,
    completedAt: row.order.completedAt,
    createdAt: row.order.createdAt,
    stall: row.stall,
    items: receiptItems,
  };
}

export async function getUserOrders(
  userId: string,
  query: OrdersQueryInput
): Promise<OrderListItem[]> {
  const conditions = [eq(orders.userId, userId)];

  if (query.status) {
    conditions.push(eq(orders.status, query.status));
  }

  const rows = await db
    .select({
      id: orders.id,
      orderCode: orders.orderCode,
      status: orders.status,
      pickupTime: orders.pickupTime,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      stallId: stalls.id,
      stallName: stalls.name,
      stallSlug: stalls.slug,
      stallImageUrl: stalls.imageUrl,
    })
    .from(orders)
    .innerJoin(stalls, eq(orders.stallId, stalls.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt));

  const orderIds = rows.map((r) => r.id);
  const itemsByOrderId = new Map<string, Array<{ name: string; quantity: number }>>();

  if (orderIds.length > 0) {
    const allItems = await db
      .select({
        orderId: orderItems.orderId,
        name: orderItems.menuName,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    for (const item of allItems) {
      const list = itemsByOrderId.get(item.orderId) || [];
      list.push({ name: item.name, quantity: item.quantity });
      itemsByOrderId.set(item.orderId, list);
    }
  }

  return rows.map((row) => {
    const items = itemsByOrderId.get(row.id) || [];
    const itemsSummary = items
      .map((i) => `${i.name} (${i.quantity}x)`)
      .join(", ");
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      id: row.id,
      orderCode: row.orderCode,
      status: row.status,
      pickupTime: row.pickupTime,
      totalAmount: row.totalAmount,
      createdAt: row.createdAt,
      stall: {
        id: row.stallId,
        name: row.stallName,
        slug: row.stallSlug,
        imageUrl: row.stallImageUrl,
      },
      itemsSummary,
      itemCount,
    };
  });
}

export async function getActiveReceipt(
  userId: string
): Promise<OrderReceiptDetail | null> {
  const [activeOrder] = await db
    .select({
      id: orders.id,
    })
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        inArray(orders.status, ["processing", "ready"])
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!activeOrder) {
    return null;
  }

  return buildOrderReceipt(activeOrder.id);
}

export async function getOrderDetail(
  userId: string,
  orderId: string
): Promise<OrderReceiptDetail> {
  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    throw new AppError("Pesanan tidak ditemukan", 404);
  }

  return buildOrderReceipt(orderId);
}

export async function completeOrder(
  userId: string,
  orderId: string
): Promise<Order> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      throw new AppError("Pesanan tidak ditemukan", 404);
    }

    if (order.status !== "ready") {
      throw new AppError(
        "Hanya pesanan yang sudah siap (ready) yang dapat diselesaikan",
        400
      );
    }

    const now = new Date();

    const [updatedOrder] = await tx
      .update(orders)
      .set({
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId))
      .returning();

    await awardPoints(tx, userId, order.id, order.totalAmount);

    await tx.insert(notifications).values({
      userId,
      type: "order",
      title: "Pesanan Selesai",
      body: `Pesanan ${order.orderCode} telah selesai. Selamat menikmati hidangan Anda!`,
      orderId: order.id,
    });

    return updatedOrder;
  });
}

export async function adminUpdateStatusToReady(
  orderId: string
): Promise<Order> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new AppError("Pesanan tidak ditemukan", 404);
    }

    if (order.status !== "processing") {
      throw new AppError(
        "Status pesanan hanya dapat diubah ke ready jika saat ini berstatus processing",
        400
      );
    }

    const now = new Date();

    const [updatedOrder] = await tx
      .update(orders)
      .set({
        status: "ready",
        readyAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId))
      .returning();

    await tx.insert(notifications).values({
      userId: order.userId,
      type: "order",
      title: "Pesanan Siap Diambil",
      body: `Pesanan ${order.orderCode} sudah siap diambil di warung dengan kode token ${order.pickupToken}.`,
      orderId: order.id,
    });

    return updatedOrder;
  });
}
