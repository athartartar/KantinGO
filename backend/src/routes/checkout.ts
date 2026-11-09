import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { checkoutService } from "../services";
import { checkoutSchema } from "../validators";

export const checkout = new Hono<AuthContext>().post(
  "/",
  requireAuth,
  zValidator("json", checkoutSchema, (result, c) => {
    if (!result.success && "error" in result) {
      return c.json(
        {
          success: false,
          message: result.error.issues[0]?.message || "Data input tidak valid",
        },
        400
      );
    }
  }),
  async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");
    const data = await checkoutService.processCheckout(userId, body);
    return c.json(successResponse(data), 201);
  }
);
