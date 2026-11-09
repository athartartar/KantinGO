import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { paymentService } from "../services";
import {
  paymentIdParamSchema,
  paymentWebhookSchema,
} from "../validators";

export const payments = new Hono<AuthContext>()
  .post(
    "/webhook",
    zValidator("json", paymentWebhookSchema, (result, c) => {
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
      const body = c.req.valid("json");
      const data = await paymentService.handleWebhook(body);
      return c.json(successResponse(data), 200);
    }
  )
  .post(
    "/:id/simulate-paid",
    requireAuth,
    zValidator("param", paymentIdParamSchema, (result, c) => {
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
      const { id } = c.req.valid("param");
      const data = await paymentService.simulatePaid(id);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/:id",
    requireAuth,
    zValidator("param", paymentIdParamSchema, (result, c) => {
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
      const { id } = c.req.valid("param");
      const data = await paymentService.getPaymentDetail(id, userId);
      return c.json(successResponse(data), 200);
    }
  );
