import { NavLink } from "react-router-dom";
import { useCart } from "../lib/cart";
import { useOrders } from "../lib/orders";
import { NAV_ITEMS } from "./navConfig";

interface TopNavProps {
  cartCount?: number;
}

export default function TopNav({ cartCount }: TopNavProps) {
  const { totalItem } = useCart();
  const { orders } = useOrders();
  const effectiveCartCount = cartCount !== undefined ? cartCount : totalItem;
  const hasReadyOrder = orders.some((o) => o.status === "siap");

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-primary text-white shadow-md border-b border-primary/20">
      <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-2 group cursor-pointer rounded-lg p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          aria-label="KantinGO - Beranda"
        >
          <span className="text-2xl font-black tracking-tight text-white select-none">
            Kantin<span className="text-lime">GO</span>
          </span>
        </NavLink>

        {/* Menu Navigasi Desktop */}
        <nav
          className="flex items-center gap-1.5 lg:gap-2"
          aria-label="Navigasi Utama Desktop"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            if (item.isCart) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 bg-lime text-navy px-4 py-2 rounded-full font-bold text-sm shadow-sm transition-all hover:brightness-105 active:scale-95 ml-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
                      isActive
                        ? "ring-2 ring-white ring-offset-2 ring-offset-primary"
                        : ""
                    }`
                  }
                  aria-label={`Keranjang Belanja. ${effectiveCartCount} item`}
                >
                  <Icon className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>{item.label}</span>
                  {effectiveCartCount > 0 && (
                    <span
                      className="bg-navy text-lime text-xs font-extrabold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center shadow-xs"
                      aria-label={`${effectiveCartCount} item dalam keranjang`}
                    >
                      {effectiveCartCount > 99 ? "99+" : effectiveCartCount}
                    </span>
                  )}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${
                    isActive
                      ? "text-lime bg-white/10 font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon
                        className={`w-4 h-4 transition-transform ${
                          isActive ? "stroke-[2.5] text-lime" : "stroke-2"
                        }`}
                        aria-hidden="true"
                      />
                      {item.to === "/status" && hasReadyOrder && (
                        <span
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime ring-2 ring-primary animate-pulse"
                          title="Pesanan siap diambil"
                        />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
