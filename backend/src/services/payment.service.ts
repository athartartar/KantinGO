import { eq, sql } from "drizzle-orm";
import { env } from "../config/env";
import { db } from "../db";
import {
  menus,
  notifications,
  orderItems,
  orders,
  payments,
  userVouchers,
  type Order,
  type Payment,
} from "../db/schema";
import { AppError } from "../lib/errors";
import type { PaymentWebhookInput } from "../validators/payment.validator";

export type PaymentWithOrderResult = {
  payment: Payment;
  order: Order;
};

export async function processPaymentSuccess(
  paymentId: string
): Promise<PaymentWithOrderResult> {
  return db.transaction(async (tx) => {
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      throw new AppError("Pembayaran tidak ditemukan", 404);
    }

    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, payment.orderId))
      .limit(1);

    if (!order) {
      throw new AppError("Pesanan tidak ditemukan", 404);
    }

    if (payment.status === "paid") {
      return {
        payment,
        order,
      };
    }

    const now = new Date();

    if (payment.status === "expired" || payment.status === "failed") {
      throw new AppError(
        "Pembayaran tidak dapat diproses karena sudah kedaluwarsa atau gagal",
        400
      );
    }

    if (payment.status === "pending" && payment.expiresAt < now) {
      await tx
        .update(payments)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(payments.id, payment.id));

      await tx
        .update(orders)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      throw new AppError("Waktu pembayaran telah kedaluwarsa", 400);
    }

    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status: "paid",
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(payments.id, payment.id))
      .returning();

    const [updatedOrder] = await tx
      .update(orders)
      .set({
        status: "processing",
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(orders.id, order.id))
      .returning();

    if (order.userVoucherId) {
      await tx
        .update(userVouchers)
        .set({
          status: "used",
          usedAt: now,
          usedOrderId: order.id,
          updatedAt: now,
        })
        .where(eq(userVouchers.id, order.userVoucherId));
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    for (const item of items) {
      await tx
        .update(menus)
        .set({
          orderCount: sql`${menus.orderCount} + ${item.quantity}`,
          updatedAt: now,
        })
        .where(eq(menus.id, item.menuId));
    }

    await tx.insert(notifications).values({
      userId: order.userId,
      type: "order",
      title: "Pembayaran Berhasil",
      body: `Pembayaran sebesar Rp ${payment.amount.toLocaleString("id-ID")} untuk pesanan ${order.orderCode} berhasil. Warung sedang menyiapkan pesanan Anda.`,
      orderId: order.id,
    });

    return {
      payment: updatedPayment,
      order: updatedOrder,
    };
  });
}

export async function getPaymentDetail(
  paymentId: string,
  userId?: string
): Promise<PaymentWithOrderResult> {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) {
    throw new AppError("Pembayaran tidak ditemukan", 404);
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, payment.orderId))
    .limit(1);

  if (!order) {
    throw new AppError("Pesanan tidak ditemukan", 404);
  }

  if (userId && order.userId !== userId) {
    throw new AppError("Akses ditolak untuk data pembayaran ini", 403);
  }

  const now = new Date();
  if (payment.status === "pending" && payment.expiresAt < now) {
    return db.transaction(async (tx) => {
      const [expiredPayment] = await tx
        .update(payments)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(payments.id, payment.id))
        .returning();

      const [expiredOrder] = await tx
        .update(orders)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(orders.id, order.id))
        .returning();

      return {
        payment: expiredPayment,
        order: expiredOrder,
      };
    });
  }

  return {
    payment,
    order,
  };
}

export async function simulatePaid(
  paymentId: string
): Promise<PaymentWithOrderResult> {
  if (env.NODE_ENV === "production") {
    throw new AppError(
      "Simulasi pembayaran hanya tersedia di lingkungan non-produksi",
      403
    );
  }

  return processPaymentSuccess(paymentId);
}

export async function handleWebhook(
  payload: PaymentWebhookInput
): Promise<PaymentWithOrderResult> {
  if (payload.paymentId) {
    return processPaymentSuccess(payload.paymentId);
  }

  if (payload.externalRef) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.externalRef, payload.externalRef))
      .limit(1);

    if (!payment) {
      throw new AppError("Pembayaran tidak ditemukan", 404);
    }

    return processPaymentSuccess(payment.id);
  }

  if (payload.orderCode) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderCode, payload.orderCode))
      .limit(1);

    if (!order) {
      throw new AppError("Pesanan tidak ditemukan", 404);
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    if (!payment) {
      throw new AppError("Pembayaran tidak ditemukan", 404);
    }

    return processPaymentSuccess(payment.id);
  }

  throw new AppError(
    "Data pembayaran tidak valid dalam payload webhook",
    400
  );
}
