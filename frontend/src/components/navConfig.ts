import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Home,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";

export interface NavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  isCart?: boolean;
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/voucher", label: "Voucher", icon: Ticket },
  { to: "/cart", label: "Cart", icon: ShoppingBag, isCart: true },
  { to: "/status", label: "Status", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
] as const;
