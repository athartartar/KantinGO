import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { successResponse } from "../lib/response";
import { authService } from "../services";
import { loginSchema, registerSchema } from "../validators";

const googleLoginSchema = z.object({
  idToken: z.string().min(1, "ID token wajib diisi"),
});

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
  )
  .post(
    "/google",
    zValidator("json", googleLoginSchema, (result, c) => {
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
      const { idToken } = c.req.valid("json");
      const data = await authService.loginWithGoogle(idToken);
      return c.json(successResponse(data), 200);
    }
  );
