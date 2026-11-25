import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

export interface PartnerNavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const PARTNER_NAV_ITEMS: readonly PartnerNavItemConfig[] = [
  { to: "/mitra", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/mitra/pesanan", label: "Pesanan", icon: ClipboardList },
  { to: "/mitra/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/mitra/dompet", label: "Dompet", icon: Wallet },
  { to: "/mitra/warung", label: "Warung", icon: Store },
] as const;
