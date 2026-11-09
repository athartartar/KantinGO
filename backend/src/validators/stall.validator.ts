import { z } from "zod";
import { DEFAULT_PAGE_SIZE } from "../config/constants";

export const stallsQuerySchema = z.object({
  categorySlug: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(DEFAULT_PAGE_SIZE),
});

export const stallIdParamSchema = z.object({
  id: z.string().uuid("ID warung tidak valid"),
});

export type StallsQueryInput = z.infer<typeof stallsQuerySchema>;
export type StallIdParamInput = z.infer<typeof stallIdParamSchema>;
