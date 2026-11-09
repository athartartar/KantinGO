import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { pointService } from "../services";

export const points = new Hono<AuthContext>().get(
  "/history",
  requireAuth,
  async (c) => {
    const userId = c.get("userId");
    const data = await pointService.getPointHistory(userId);
    return c.json(successResponse(data), 200);
  }
);
