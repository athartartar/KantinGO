import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/index";
import { AppError } from "../lib/errors";
import { comparePassword, hashPassword } from "../lib/password";
import type { SafeUser } from "./auth.service";
import type { UpdatePasswordInput, UpdateProfileInput } from "../validators/user.validator";

function sanitizeUser(user: typeof users.$inferSelect): SafeUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function getProfile(userId: string): Promise<SafeUser> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  return sanitizeUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!existingUser) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return sanitizeUser(updatedUser);
}

export async function updatePassword(userId: string, input: UpdatePasswordInput): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new AppError("Pengguna tidak ditemukan", 404);
  }

  const isOldPasswordValid = await comparePassword(input.oldPassword, user.passwordHash);
  if (!isOldPasswordValid) {
    throw new AppError("Kata sandi lama tidak sesuai", 400);
  }

  const newPasswordHash = await hashPassword(input.newPassword);

  await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
