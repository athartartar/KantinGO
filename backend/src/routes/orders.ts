import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { orderService, reviewService } from "../services";
import {
  createReviewSchema,
  orderIdParamSchema,
  ordersQuerySchema,
} from "../validators";

export const orders = new Hono<AuthContext>()
  .get(
    "/active-receipt",
    requireAuth,
    async (c) => {
      const userId = c.get("userId");
      const data = await orderService.getActiveReceipt(userId);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/",
    requireAuth,
    zValidator("query", ordersQuerySchema, (result, c) => {
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
      const data = await orderService.getUserOrders(userId, query);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/:id",
    requireAuth,
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
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const data = await orderService.getOrderDetail(userId, id);
      return c.json(successResponse(data), 200);
    }
  )
  .post(
    "/:id/complete",
    requireAuth,
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
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const data = await orderService.completeOrder(userId, id);
      return c.json(successResponse(data), 200);
    }
  )
  .post(
    "/:id/review",
    requireAuth,
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
    zValidator("json", createReviewSchema, (result, c) => {
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
      const body = c.req.valid("json");
      const data = await reviewService.createOrderReview(userId, id, body);
      return c.json(successResponse(data), 201);
    }
  );
