import { z } from "zod";

export const ordersQuerySchema = z.object({
  status: z
    .enum(["pending_payment", "processing", "ready", "completed"])
    .optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid("ID pesanan tidak valid"),
});

export const adminUpdateOrderStatusSchema = z.object({
  status: z.literal("ready"),
});

export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;
export type OrderIdParamInput = z.infer<typeof orderIdParamSchema>;
export type AdminUpdateOrderStatusInput = z.infer<
  typeof adminUpdateOrderStatusSchema
>;
