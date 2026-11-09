import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { searchService } from "../services";
import { searchQuerySchema } from "../validators";

export const search = new Hono().get(
  "/",
  zValidator("query", searchQuerySchema, (result, c) => {
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
    const { q, limit } = c.req.valid("query");
    const data = await searchService.searchCatalog(q, limit);
    return c.json(successResponse(data), 200);
  }
);
