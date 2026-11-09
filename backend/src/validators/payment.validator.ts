import { z } from "zod";

export const paymentIdParamSchema = z.object({
  id: z.string().uuid("ID pembayaran tidak valid"),
});

export const paymentWebhookSchema = z.object({
  paymentId: z.string().uuid().optional(),
  externalRef: z.string().optional(),
  orderCode: z.string().optional(),
});

export type PaymentIdParamInput = z.infer<typeof paymentIdParamSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
