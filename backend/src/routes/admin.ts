import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAdminKey } from "../middleware/admin";
import { orderService } from "../services";
import {
  adminUpdateOrderStatusSchema,
  orderIdParamSchema,
} from "../validators";

export const admin = new Hono().patch(
  "/orders/:id/status",
  requireAdminKey,
  zValidator("param", orderIdParamSchema, (result, c) => {
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
  zValidator("json", adminUpdateOrderStatusSchema, (result, c) => {
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
    const data = await orderService.adminUpdateStatusToReady(id);
    return c.json(successResponse(data), 200);
  }
);
