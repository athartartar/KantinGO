import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { menuService } from "../services";
import { menuIdParamSchema, popularMenusQuerySchema } from "../validators";

export const menus = new Hono()
  .get("/", async (c) => {
    const data = await menuService.getMenus();
    return c.json(successResponse(data), 200);
  })
  .get(
    "/popular",
    zValidator("query", popularMenusQuerySchema, (result, c) => {
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
      const { limit } = c.req.valid("query");
      const data = await menuService.getPopularMenus(limit);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/:id",
    zValidator("param", menuIdParamSchema, (result, c) => {
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
      const data = await menuService.getMenuDetail(id);
      return c.json(successResponse(data), 200);
    }
  );
