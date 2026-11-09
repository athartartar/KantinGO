import { createMiddleware } from "hono/factory";
import { env } from "../config/env";
import { AppError } from "../lib/errors";

export const requireAdminKey = createMiddleware(async (c, next) => {
  const adminKey = c.req.header("x-admin-key");
  if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
    throw new AppError("Kunci admin tidak valid", 403);
  }

  await next();
});
