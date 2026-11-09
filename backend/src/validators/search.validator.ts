import { z } from "zod";
import { DEFAULT_SEARCH_LIMIT } from "../config/constants";

export const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  limit: z.coerce.number().int().positive().max(50).default(DEFAULT_SEARCH_LIMIT),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
