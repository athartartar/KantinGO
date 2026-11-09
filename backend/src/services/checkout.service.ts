import { and, eq } from "drizzle-orm";
import { PICKUP_MIN_LEAD_MINUTES } from "../config/constants";
import { db } from "../db";
import {
  cartItems,
  carts,
  orderItemAddons,
  orderItems,
  orders,
  payments,
  stalls,
  userVouchers,
  vouchers,
  type Order,
  type Payment,
} from "../db/schema";
import { generateOrderCode, generatePickupToken } from "../lib/code-generator";
import { AppError } from "../lib/errors";
import { defaultPaymentProvider } from "../lib/payment-provider";
import type { CheckoutInput } from "../validators/checkout.validator";
import { getCart } from "./cart.service";

export type CheckoutResult = {
  order: Order;
  payment: Payment;
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

export async function processCheckout(
  userId: string,
  input: CheckoutInput
): Promise<CheckoutResult> {
  const cart = await getCart(userId);

  if (cart.items.length === 0 || !cart.stallId) {
    throw new AppError("Keranjang belanja masih kosong", 400);
  }

  for (const item of cart.items) {
    if (!item.menu.isAvailable) {
      throw new AppError(
        `Menu "${item.menu.name}" tidak tersedia saat ini`,
        400
      );
    }
    for (const addon of item.addons) {
      if (!addon.isAvailable) {
        throw new AppError(
          `Add-on "${addon.name}" tidak tersedia saat ini`,
          400
        );
      }
    }
  }

  const pickupDate = new Date(input.pickupTime);
  const now = new Date();

  if (isNaN(pickupDate.getTime())) {
    throw new AppError("Format waktu penjemputan tidak valid", 400);
  }

  const minLeadTime = new Date(
    now.getTime() + PICKUP_MIN_LEAD_MINUTES * 60 * 1000
  );
  if (pickupDate < minLeadTime) {
    throw new AppError(
      "Waktu penjemputan minimal 15 menit dari sekarang",
      400
    );
  }

  const [stall] = await db
    .select()
    .from(stalls)
    .where(eq(stalls.id, cart.stallId))
    .limit(1);

  if (!stall || !stall.isOpen) {
    throw new AppError("Warung sedang tutup", 400);
  }

  const pickupMinutes = getMinutesFromMidnightInJakarta(pickupDate);
  const [openHour, openMinute] = stall.openTime.split(":").map(Number);
  const [closeHour, closeMinute] = stall.closeTime.split(":").map(Number);
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (pickupMinutes < openMinutes || pickupMinutes > closeMinutes) {
    throw new AppError(
      "Waktu penjemputan di luar jam operasional warung",
      400
    );
  }

  let discountAmount = 0;
  let appliedUserVoucherId: string | null = null;

  if (input.userVoucherId) {
    const [claimedRow] = await db
      .select({
        userVoucherId: userVouchers.id,
        type: vouchers.type,
        value: vouchers.value,
        minPurchase: vouchers.minPurchase,
        maxDiscount: vouchers.maxDiscount,
        validUntil: vouchers.validUntil,
        isActive: vouchers.isActive,
      })
      .from(userVouchers)
      .innerJoin(vouchers, eq(userVouchers.voucherId, vouchers.id))
      .where(
        and(
          eq(userVouchers.id, input.userVoucherId),
          eq(userVouchers.userId, userId),
          eq(userVouchers.status, "available")
        )
      )
      .limit(1);

    if (!claimedRow) {
      throw new AppError("Voucher tidak valid atau sudah digunakan", 400);
    }

    if (!claimedRow.isActive) {
      throw new AppError("Voucher tidak aktif", 400);
    }

    if (claimedRow.validUntil < now) {
      throw new AppError("Voucher sudah kedaluwarsa", 400);
    }

    if (cart.subtotal < claimedRow.minPurchase) {
      throw new AppError(
        `Total belanja belum memenuhi syarat minimal voucher Rp ${claimedRow.minPurchase.toLocaleString("id-ID")}`,
        400
      );
    }

    if (claimedRow.type === "percentage") {
      let calculated = Math.floor((cart.subtotal * claimedRow.value) / 100);
      if (claimedRow.maxDiscount !== null && claimedRow.maxDiscount > 0) {
        calculated = Math.min(calculated, claimedRow.maxDiscount);
      }
      discountAmount = calculated;
    } else {
      discountAmount = Math.min(claimedRow.value, cart.subtotal);
    }

    appliedUserVoucherId = claimedRow.userVoucherId;
  }

  const totalAmount = Math.max(0, cart.subtotal - discountAmount);

  return db.transaction(async (tx) => {
    const orderCode = generateOrderCode();
    const pickupToken = generatePickupToken();

    const [newOrder] = await tx
      .insert(orders)
      .values({
        orderCode,
        userId,
        stallId: cart.stallId!,
        status: "pending_payment",
        pickupTime: pickupDate,
        subtotal: cart.subtotal,
        discountAmount,
        totalAmount,
        userVoucherId: appliedUserVoucherId,
        pointsEarned: 0,
        pickupToken,
      })
      .returning();

    for (const item of cart.items) {
      const [newOrderItem] = await tx
        .insert(orderItems)
        .values({
          orderId: newOrder.id,
          menuId: item.menuId,
          menuName: item.menu.name,
          unitPrice: item.itemPrice,
          quantity: item.quantity,
          note: item.note,
          lineTotal: item.subtotal,
        })
        .returning();

      if (item.addons.length > 0) {
        await tx.insert(orderItemAddons).values(
          item.addons.map((addon) => ({
            orderItemId: newOrderItem.id,
            addonId: addon.id,
            addonName: addon.name,
            addonPrice: addon.price,
          }))
        );
      }
    }

    const paymentResult = await defaultPaymentProvider.createPayment({
      orderId: newOrder.id,
      orderCode: newOrder.orderCode,
      amount: totalAmount,
    });

    const [newPayment] = await tx
      .insert(payments)
      .values({
        orderId: newOrder.id,
        method: paymentResult.method,
        status: "pending",
        amount: totalAmount,
        qrString: paymentResult.qrString,
        externalRef: paymentResult.externalRef,
        expiresAt: paymentResult.expiresAt,
      })
      .returning();

    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    await tx
      .update(carts)
      .set({
        stallId: null,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cart.id));

    return {
      order: newOrder,
      payment: newPayment,
    };
  });
}
