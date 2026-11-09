import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { homeService } from "../services";

export const home = new Hono<AuthContext>().get(
  "/",
  requireAuth,
  async (c) => {
    const userId = c.get("userId");
    const data = await homeService.getHomeData(userId);
    return c.json(successResponse(data), 200);
  }
);
