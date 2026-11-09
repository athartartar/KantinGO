import { relations } from "drizzle-orm";
import { carts, cartItemAddons, cartItems } from "./carts";
import { categories } from "./categories";
import { menuAddons, menus } from "./menus";
import { notifications } from "./notifications";
import { orderItemAddons, orderItems, orders } from "./orders";
import { payments } from "./payments";
import { pointTransactions } from "./points";
import { reviews } from "./reviews";
import { stalls } from "./stalls";
import { users } from "./users";
import { userVouchers, vouchers } from "./vouchers";

export const usersRelations = relations(users, ({ one, many }) => ({
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  userVouchers: many(userVouchers),
  orders: many(orders),
  pointTransactions: many(pointTransactions),
  reviews: many(reviews),
  notifications: many(notifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  menus: many(menus),
}));

export const stallsRelations = relations(stalls, ({ many }) => ({
  menus: many(menus),
  orders: many(orders),
  reviews: many(reviews),
  carts: many(carts),
}));

export const menusRelations = relations(menus, ({ one, many }) => ({
  stall: one(stalls, {
    fields: [menus.stallId],
    references: [stalls.id],
  }),
  category: one(categories, {
    fields: [menus.categoryId],
    references: [categories.id],
  }),
  addons: many(menuAddons),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const menuAddonsRelations = relations(menuAddons, ({ one, many }) => ({
  menu: one(menus, {
    fields: [menuAddons.menuId],
    references: [menus.id],
  }),
  cartItemAddons: many(cartItemAddons),
  orderItemAddons: many(orderItemAddons),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  stall: one(stalls, {
    fields: [carts.stallId],
    references: [stalls.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one, many }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  menu: one(menus, {
    fields: [cartItems.menuId],
    references: [menus.id],
  }),
  addons: many(cartItemAddons),
}));

export const cartItemAddonsRelations = relations(cartItemAddons, ({ one }) => ({
  cartItem: one(cartItems, {
    fields: [cartItemAddons.cartItemId],
    references: [cartItems.id],
  }),
  addon: one(menuAddons, {
    fields: [cartItemAddons.addonId],
    references: [menuAddons.id],
  }),
}));

export const vouchersRelations = relations(vouchers, ({ many }) => ({
  userVouchers: many(userVouchers),
}));

export const userVouchersRelations = relations(userVouchers, ({ one }) => ({
  user: one(users, {
    fields: [userVouchers.userId],
    references: [users.id],
  }),
  voucher: one(vouchers, {
    fields: [userVouchers.voucherId],
    references: [vouchers.id],
  }),
  usedOrder: one(orders, {
    fields: [userVouchers.usedOrderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  stall: one(stalls, {
    fields: [orders.stallId],
    references: [stalls.id],
  }),
  userVoucher: one(userVouchers, {
    fields: [orders.userVoucherId],
    references: [userVouchers.id],
  }),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
  review: one(reviews, {
    fields: [orders.id],
    references: [reviews.orderId],
  }),
  items: many(orderItems),
  pointTransactions: many(pointTransactions),
  notifications: many(notifications),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menu: one(menus, {
    fields: [orderItems.menuId],
    references: [menus.id],
  }),
  addons: many(orderItemAddons),
}));

export const orderItemAddonsRelations = relations(orderItemAddons, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [orderItemAddons.orderItemId],
    references: [orderItems.id],
  }),
  addon: one(menuAddons, {
    fields: [orderItemAddons.addonId],
    references: [menuAddons.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  stall: one(stalls, {
    fields: [reviews.stallId],
    references: [stalls.id],
  }),
}));

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pointTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [pointTransactions.orderId],
    references: [orders.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [notifications.orderId],
    references: [orders.id],
  }),
}));
