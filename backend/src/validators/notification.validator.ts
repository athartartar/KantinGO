import { z } from "zod";

export const notificationIdParamSchema = z.object({
  id: z.string().uuid("ID notifikasi tidak valid"),
});

export type NotificationIdParamInput = z.infer<
  typeof notificationIdParamSchema
>;
