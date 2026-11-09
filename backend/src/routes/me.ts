import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { requireAuth, type AuthContext } from "../middleware/auth";
import { userService } from "../services";
import { updatePasswordSchema, updateProfileSchema } from "../validators";

export const me = new Hono<AuthContext>()
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId");
    const data = await userService.getProfile(userId);
    return c.json(successResponse(data), 200);
  })
  .patch(
    "/",
    requireAuth,
    zValidator("json", updateProfileSchema, (result, c) => {
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
      const data = await userService.updateProfile(userId, body);
      return c.json(successResponse(data), 200);
    }
  )
  .patch(
    "/password",
    requireAuth,
    zValidator("json", updatePasswordSchema, (result, c) => {
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
      await userService.updatePassword(userId, body);
      return c.json(successResponse({ message: "Kata sandi berhasil diperbarui" }), 200);
    }
  );
