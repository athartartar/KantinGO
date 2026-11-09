export * from "./types";
export * from "./warung";
export * from "./menu";
export * from "./voucher";

// Mock data compatibility exports
export { mockWarungList as mockWarung } from "./warung";
export { mockMenuList as mockMenus } from "./menu";
export { mockVoucherList as mockVouchers } from "./voucher";

// Compatibility dengan mock.ts lama
export {
  mockUser,
  mockNotifications,
  mockCategories,
  mockPopularMenus,
  mockCartItems,
  mockCartCount,
  mockRedeemableVouchers,
  mockInitialUserVouchers,
  mockHistoryVouchers,
  mockUserVoucherCount,
} from "../mock";

export type {
  UserProfile,
  AppNotification,
  MenuCategory,
  MenuItem,
  VoucherItem,
} from "../mock";
