import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama tidak boleh kosong").optional(),
  phone: z.string().trim().optional(),
  avatarUrl: z.string().trim().url("Format URL avatar tidak valid").optional(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Kata sandi lama wajib diisi"),
  newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
