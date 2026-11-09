import type { cartItemAddons, cartItems, carts } from "./carts";
import type { categories } from "./categories";
import type { menuAddons, menus } from "./menus";
import type { notifications } from "./notifications";
import type { orderItemAddons, orderItems, orders } from "./orders";
import type { payments } from "./payments";
import type { pointTransactions } from "./points";
import type { reviews } from "./reviews";
import type { stalls } from "./stalls";
import type { users } from "./users";
import type { userVouchers, vouchers } from "./vouchers";

export * from "./enums";
export * from "./users";
export * from "./categories";
export * from "./stalls";
export * from "./menus";
export * from "./carts";
export * from "./vouchers";
export * from "./orders";
export * from "./points";
export * from "./payments";
export * from "./reviews";
export * from "./notifications";
export * from "./relations";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Stall = typeof stalls.$inferSelect;
export type NewStall = typeof stalls.$inferInsert;

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;

export type MenuAddon = typeof menuAddons.$inferSelect;
export type NewMenuAddon = typeof menuAddons.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type CartItemAddon = typeof cartItemAddons.$inferSelect;
export type NewCartItemAddon = typeof cartItemAddons.$inferInsert;

export type Voucher = typeof vouchers.$inferSelect;
export type NewVoucher = typeof vouchers.$inferInsert;

export type UserVoucher = typeof userVouchers.$inferSelect;
export type NewUserVoucher = typeof userVouchers.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type OrderItemAddon = typeof orderItemAddons.$inferSelect;
export type NewOrderItemAddon = typeof orderItemAddons.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type NewPointTransaction = typeof pointTransactions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
