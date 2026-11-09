import { createMiddleware } from "hono/factory";
import { AppError } from "../lib/errors";
import { verifyAuthToken } from "../lib/jwt";

export type AuthContext = {
  Variables: {
    userId: string;
  };
};

export const requireAuth = createMiddleware<AuthContext>(async (c, next) => {
  const authHeader = c.req.header("authorization") || c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Akses ditolak, silakan masuk terlebih dahulu", 401);
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new AppError("Akses ditolak, token otentikasi tidak ditemukan", 401);
  }

  const payload = await verifyAuthToken(token);
  c.set("userId", payload.userId);

  await next();
});
