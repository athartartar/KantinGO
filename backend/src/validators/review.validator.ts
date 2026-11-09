import { z } from "zod";
import { DEFAULT_PAGE_SIZE } from "../config/constants";

export const createReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating minimal 1")
    .max(5, "Rating maksimal 5"),
  comment: z
    .string()
    .max(500, "Ulasan maksimal 500 karakter")
    .optional()
    .nullable(),
});

export const stallReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(DEFAULT_PAGE_SIZE),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type StallReviewsQueryInput = z.infer<typeof stallReviewsQuerySchema>;
