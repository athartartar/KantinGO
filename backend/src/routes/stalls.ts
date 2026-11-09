import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { successResponse } from "../lib/response";
import { reviewService, stallService } from "../services";
import {
  stallIdParamSchema,
  stallReviewsQuerySchema,
  stallsQuerySchema,
} from "../validators";

export const stalls = new Hono()
  .get(
    "/",
    zValidator("query", stallsQuerySchema, (result, c) => {
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
      const query = c.req.valid("query");
      const data = await stallService.getStalls(query);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/:id/pickup-slots",
    zValidator("param", stallIdParamSchema, (result, c) => {
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
      const data = await stallService.getPickupSlots(id);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/:id/reviews",
    zValidator("param", stallIdParamSchema, (result, c) => {
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
    zValidator("query", stallReviewsQuerySchema, (result, c) => {
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
      const query = c.req.valid("query");
      const data = await reviewService.getStallReviews(id, query);
      return c.json(successResponse(data), 200);
    }
  )
  .get(
    "/:id",
    zValidator("param", stallIdParamSchema, (result, c) => {
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
      const data = await stallService.getStallDetail(id);
      return c.json(successResponse(data), 200);
    }
  );
