import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { voucherService } from "../services";
import {
  redeemVoucherSchema,
  userVouchersQuerySchema,
} from "../validators";

export const vouchers = new Hono<AuthContext>()
  .get("/summary", requireAuth, async (c) => {
    const userId = c.get("userId");
    const data = await voucherService.getVouchersSummary(userId);
    return c.json(successResponse(data), 200);
  })
  .get(
    "/me",
    requireAuth,
    zValidator("query", userVouchersQuerySchema, (result, c) => {
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
      const query = c.req.valid("query");
      const data = await voucherService.getUserVouchers(userId, query);
      return c.json(successResponse(data), 200);
    }
  )
  .post(
    "/redeem",
    requireAuth,
    zValidator("json", redeemVoucherSchema, (result, c) => {
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
      const { code } = c.req.valid("json");
      const data = await voucherService.redeemVoucher(userId, code);
      return c.json(successResponse(data), 201);
    }
  );
