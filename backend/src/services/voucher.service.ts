import { and, count, desc, eq } from "drizzle-orm";
import {
  POINTS_PER_VOUCHER,
  VOUCHER_POPULAR_MENUS_LIMIT,
} from "../config/constants";
import { db } from "../db";
import { userVouchers, users, vouchers } from "../db/schema";
import { AppError } from "../lib/errors";
import { getPopularMenus, type PopularMenuItem } from "./menu.service";
import type { UserVouchersQueryInput } from "../validators/voucher.validator";

export type VoucherSummaryResult = {
  ownedCount: number;
  points: number;
  pointsPerVoucher: number;
  progressPercent: number;
  popularMenus: PopularMenuItem[];
};

export type UserVoucherDetail = {
  id: string;
  voucherId: string;
  status: "available" | "used" | "expired";
  claimedAt: Date;
  usedAt: Date | null;
  code: string;
  title: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  validUntil: Date;
  isPointReward: boolean;
};

export async function getVouchersSummary(
  userId: string
): Promise<VoucherSummaryResult> {
  const [user] = await db
    .select({
      points: users.points,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  const [ownedResult, popularMenus] = await Promise.all([
    db
      .select({ count: count() })
      .from(userVouchers)
      .where(
        and(
          eq(userVouchers.userId, userId),
          eq(userVouchers.status, "available")
        )
      ),
    getPopularMenus(VOUCHER_POPULAR_MENUS_LIMIT),
  ]);

  const ownedCount = Number(ownedResult[0]?.count || 0);
  const points = user.points;
  const progressPercent =
    ((points % POINTS_PER_VOUCHER) / POINTS_PER_VOUCHER) * 100;

  return {
    ownedCount,
    points,
    pointsPerVoucher: POINTS_PER_VOUCHER,
    progressPercent,
    popularMenus,
  };
}

export async function getUserVouchers(
  userId: string,
  query: UserVouchersQueryInput
): Promise<UserVoucherDetail[]> {
  const conditions = [eq(userVouchers.userId, userId)];

  if (query.status) {
    conditions.push(eq(userVouchers.status, query.status));
  }

  const rows = await db
    .select({
      id: userVouchers.id,
      voucherId: userVouchers.voucherId,
      status: userVouchers.status,
      claimedAt: userVouchers.claimedAt,
      usedAt: userVouchers.usedAt,
      code: vouchers.code,
      title: vouchers.title,
      description: vouchers.description,
      type: vouchers.type,
      value: vouchers.value,
      minPurchase: vouchers.minPurchase,
      maxDiscount: vouchers.maxDiscount,
      validUntil: vouchers.validUntil,
      isPointReward: vouchers.isPointReward,
    })
    .from(userVouchers)
    .innerJoin(vouchers, eq(userVouchers.voucherId, vouchers.id))
    .where(and(...conditions))
    .orderBy(desc(userVouchers.claimedAt));

  return rows;
}

export async function redeemVoucher(
  userId: string,
  code: string
): Promise<UserVoucherDetail> {
  const [voucher] = await db
    .select()
    .from(vouchers)
    .where(eq(vouchers.code, code.trim()))
    .limit(1);

  if (!voucher) {
    throw new AppError("Kode voucher tidak ditemukan", 404);
  }

  if (!voucher.isActive) {
    throw new AppError("Voucher tidak aktif", 400);
  }

  if (voucher.validUntil < new Date()) {
    throw new AppError("Voucher sudah kedaluwarsa", 400);
  }

  const [alreadyClaimed] = await db
    .select()
    .from(userVouchers)
    .where(
      and(
        eq(userVouchers.userId, userId),
        eq(userVouchers.voucherId, voucher.id)
      )
    )
    .limit(1);

  if (alreadyClaimed) {
    throw new AppError("Voucher sudah pernah Anda klaim", 400);
  }

  const [newUserVoucher] = await db
    .insert(userVouchers)
    .values({
      userId,
      voucherId: voucher.id,
      status: "available",
      claimedAt: new Date(),
    })
    .returning();

  return {
    id: newUserVoucher.id,
    voucherId: voucher.id,
    status: newUserVoucher.status,
    claimedAt: newUserVoucher.claimedAt,
    usedAt: newUserVoucher.usedAt,
    code: voucher.code,
    title: voucher.title,
    description: voucher.description,
    type: voucher.type,
    value: voucher.value,
    minPurchase: voucher.minPurchase,
    maxDiscount: voucher.maxDiscount,
    validUntil: voucher.validUntil,
    isPointReward: voucher.isPointReward,
  };
}
