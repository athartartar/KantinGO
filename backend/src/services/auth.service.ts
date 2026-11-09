import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type User } from "../db/schema/index";
import { AppError } from "../lib/errors";
import { generateToken } from "../lib/jwt";
import { comparePassword, hashPassword } from "../lib/password";
import type { LoginInput, RegisterInput } from "../validators/auth.validator";

export type SafeUser = Omit<User, "passwordHash">;

function sanitizeUser(user: User): SafeUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email));

  if (existingUsers.length > 0) {
    throw new AppError("Email sudah terdaftar", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const [newUser] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone || null,
    })
    .returning();

  const token = await generateToken(newUser.id);

  return {
    user: sanitizeUser(newUser),
    token,
  };
}

export async function login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email));

  if (!user) {
    throw new AppError("Email atau kata sandi tidak valid", 401);
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Email atau kata sandi tidak valid", 401);
  }

  const token = await generateToken(user.id);

  return {
    user: sanitizeUser(user),
    token,
  };
}
