import { z } from "zod";

export const addCartItemSchema = z.object({
  menuId: z.string().uuid("ID menu tidak valid"),
  quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0").default(1),
  addonIds: z.array(z.string().uuid("ID add-on tidak valid")).default([]),
  note: z.string().max(255, "Catatan maksimal 255 karakter").optional().nullable(),
});

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0").optional(),
    addonIds: z.array(z.string().uuid("ID add-on tidak valid")).optional(),
    note: z.string().max(255, "Catatan maksimal 255 karakter").optional().nullable(),
  })
  .refine(
    (data) =>
      data.quantity !== undefined ||
      data.addonIds !== undefined ||
      data.note !== undefined,
    { message: "Setidaknya satu data harus diperbarui" }
  );

export const cartItemIdParamSchema = z.object({
  id: z.string().uuid("ID item keranjang tidak valid"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemIdParamInput = z.infer<typeof cartItemIdParamSchema>;
