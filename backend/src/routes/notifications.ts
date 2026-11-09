import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { notificationService } from "../services";
import { notificationIdParamSchema } from "../validators";

export const notifications = new Hono<AuthContext>()
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId");
    const data = await notificationService.getNotifications(userId);
    return c.json(successResponse(data), 200);
  })
  .patch("/read-all", requireAuth, async (c) => {
    const userId = c.get("userId");
    const data = await notificationService.markAllAsRead(userId);
    return c.json(successResponse(data), 200);
  })
  .patch(
    "/:id/read",
    requireAuth,
    zValidator("param", notificationIdParamSchema, (result, c) => {
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
      const data = await notificationService.markAsRead(userId, id);
      return c.json(successResponse(data), 200);
    }
  );
