import { pgEnum } from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "processing",
  "ready",
  "completed",
  "cancelled",
  "expired",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "expired",
]);

export const voucherTypeEnum = pgEnum("voucher_type", [
  "percentage",
  "fixed",
]);

export const userVoucherStatusEnum = pgEnum("user_voucher_status", [
  "available",
  "used",
  "expired",
]);

export const pointTransactionTypeEnum = pgEnum("point_transaction_type", [
  "earn",
  "redeem",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "order",
  "voucher",
  "promo",
  "system",
]);
