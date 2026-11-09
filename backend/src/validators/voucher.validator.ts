import { z } from "zod";

export const redeemVoucherSchema = z.object({
  code: z.string().trim().min(1, "Kode voucher tidak boleh kosong"),
});

export const userVouchersQuerySchema = z.object({
  status: z.enum(["available", "used", "expired"]).optional(),
});

export type RedeemVoucherInput = z.infer<typeof redeemVoucherSchema>;
export type UserVouchersQueryInput = z.infer<typeof userVouchersQuerySchema>;
