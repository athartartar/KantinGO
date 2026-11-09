import { sign, verify } from "hono/jwt";
import { JWT_EXPIRY_SECONDS } from "../config/constants";
import { env } from "../config/env";
import { AppError } from "./errors";

export type AuthPayload = {
  userId: string;
  exp: number;
};

export async function generateToken(userId: string): Promise<string> {
  const payload: AuthPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS,
  };

  return sign(payload, env.JWT_SECRET, "HS256");
}

export async function verifyAuthToken(token: string): Promise<AuthPayload> {
  try {
    const payload = await verify(token, env.JWT_SECRET, "HS256");
    if (!payload || typeof payload !== "object" || !("userId" in payload)) {
      throw new AppError("Sesi login tidak valid", 401);
    }
    return payload as AuthPayload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Sesi login telah kedaluwarsa atau tidak valid", 401);
  }
}
