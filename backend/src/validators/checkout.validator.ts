import { z } from "zod";

export const checkoutSchema = z.object({
  pickupTime: z.string().datetime({ message: "Format waktu penjemputan tidak valid" }),
  userVoucherId: z.string().uuid("ID voucher tidak valid").optional().nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
