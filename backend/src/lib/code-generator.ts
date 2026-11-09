import crypto from "node:crypto";
import { ORDER_CODE_PREFIX } from "../config/constants";

export function generateOrderCode(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();

  return `${ORDER_CODE_PREFIX}-${year}${month}${day}-${randomSuffix}`;
}

export function generatePickupToken(): string {
  return String(crypto.randomInt(100000, 1000000));
}
