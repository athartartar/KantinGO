import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { POINTS_PER_VOUCHER, RUPIAH_PER_POINT } from "../config/constants";
import { db } from "../db";
import {
  notifications,
  orders,
  pointTransactions,
  userVouchers,
  users,
  vouchers,
  type PointTransaction,
} from "../db/schema";

type TransactionExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function getPointHistory(
  userId: string
): Promise<PointTransaction[]> {
  return db
    .select()
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .orderBy(desc(pointTransactions.createdAt));
}

export async function awardPoints(
  tx: TransactionExecutor,
  userId: string,
  orderId: string,
  totalAmount: number
): Promise<number> {
  const pointsToEarn = Math.floor(totalAmount / RUPIAH_PER_POINT);
  if (pointsToEarn <= 0) {
    return 0;
  }

  await tx
    .update(users)
    .set({
      points: sql`${users.points} + ${pointsToEarn}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await tx.insert(pointTransactions).values({
    userId,
    type: "earn",
    amount: pointsToEarn,
    orderId,
    description: "Poin dari transaksi pesanan",
  });

  await tx
    .update(orders)
    .set({
      pointsEarned: pointsToEarn,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  const [earnRow] = await tx
    .select({ total: sum(pointTransactions.amount) })
    .from(pointTransactions)
    .where(
      and(
        eq(pointTransactions.userId, userId),
        eq(pointTransactions.type, "earn")
      )
    );

  const totalPointsEarned = Number(earnRow?.total || 0);
  const totalRewardsEarned = Math.floor(
    totalPointsEarned / POINTS_PER_VOUCHER
  );

  const [{ count: currentRewardCount }] = await tx
    .select({ count: count() })
    .from(userVouchers)
    .innerJoin(vouchers, eq(userVouchers.voucherId, vouchers.id))
    .where(
      and(
        eq(userVouchers.userId, userId),
        eq(vouchers.isPointReward, true)
      )
    );

  const rewardsToGrant = totalRewardsEarned - Number(currentRewardCount);

  if (rewardsToGrant > 0) {
    const [rewardVoucher] = await tx
      .select()
      .from(vouchers)
      .where(
        and(
          eq(vouchers.isPointReward, true),
          eq(vouchers.isActive, true)
        )
      )
      .limit(1);

    if (rewardVoucher) {
      for (let i = 0; i < rewardsToGrant; i++) {
        await tx.insert(userVouchers).values({
          userId,
          voucherId: rewardVoucher.id,
          status: "available",
          claimedAt: new Date(),
        });

        await tx.insert(notifications).values({
          userId,
          type: "voucher",
          title: "Voucher Hadiah Poin",
          body: `Selamat! Anda mendapatkan voucher "${rewardVoucher.title}" dari akumulasi poin.`,
          orderId,
        });
      }
    }
  }

  return pointsToEarn;
}
