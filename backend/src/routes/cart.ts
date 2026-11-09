import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { cartService } from "../services";
import {
  addCartItemSchema,
  cartItemIdParamSchema,
  updateCartItemSchema,
} from "../validators";

export const cart = new Hono<AuthContext>()
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId");
    const data = await cartService.getCart(userId);
    return c.json(successResponse(data), 200);
  })
  .post(
    "/items",
    requireAuth,
    zValidator("json", addCartItemSchema, (result, c) => {
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
      const data = await cartService.addItem(userId, body);
      return c.json(successResponse(data), 201);
    }
  )
  .patch(
    "/items/:id",
    requireAuth,
    zValidator("param", cartItemIdParamSchema, (result, c) => {
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
    zValidator("json", updateCartItemSchema, (result, c) => {
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
      const data = await cartService.updateItem(userId, id, body);
      return c.json(successResponse(data), 200);
    }
  )
  .delete(
    "/items/:id",
    requireAuth,
    zValidator("param", cartItemIdParamSchema, (result, c) => {
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
      const data = await cartService.removeItem(userId, id);
      return c.json(successResponse(data), 200);
    }
  )
  .delete("/", requireAuth, async (c) => {
    const userId = c.get("userId");
    const data = await cartService.clearCart(userId);
    return c.json(successResponse(data), 200);
  });
