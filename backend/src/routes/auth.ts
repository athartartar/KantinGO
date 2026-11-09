import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { authService } from "../services";
import { loginSchema, registerSchema } from "../validators";

export const auth = new Hono()
  .post(
    "/register",
    zValidator("json", registerSchema, (result, c) => {
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
      const data = await authService.register(body);
      return c.json(successResponse(data), 201);
    }
  )
  .post(
    "/login",
    zValidator("json", loginSchema, (result, c) => {
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
      const data = await authService.login(body);
      return c.json(successResponse(data), 200);
    }
  );
