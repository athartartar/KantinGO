import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { categoryService } from "../services";

export const categories = new Hono().get("/", async (c) => {
  const data = await categoryService.getCategories();
  return c.json(successResponse(data), 200);
});
