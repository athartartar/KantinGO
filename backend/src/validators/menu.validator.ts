import { z } from "zod";
import { HOME_POPULAR_MENUS_LIMIT } from "../config/constants";

export const popularMenusQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(HOME_POPULAR_MENUS_LIMIT),
});

export const menuIdParamSchema = z.object({
  id: z.string().uuid("ID menu tidak valid"),
});

export type PopularMenusQueryInput = z.infer<typeof popularMenusQuerySchema>;
export type MenuIdParamInput = z.infer<typeof menuIdParamSchema>;
