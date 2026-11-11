import { NavLink } from "react-router-dom";
import { useCart } from "../lib/cart";
import { useOrders } from "../lib/orders";
import { NAV_ITEMS } from "./navConfig";

interface BottomNavProps {
  cartCount?: number;
}

export default function BottomNav({ cartCount }: BottomNavProps) {
  const { totalItem } = useCart();
  const { orders } = useOrders();
  const effectiveCartCount = cartCount !== undefined ? cartCount : totalItem;
  const hasReadyOrder = orders.some((o) => o.status === "siap");

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 bg-primary text-white rounded-t-3xl shadow-[0_-4px_24px_rgba(19,41,192,0.25)] px-3 pt-2"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
      aria-label="Navigasi Bawah Mobile"
    >
      <div className="grid grid-cols-5 items-end">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center relative -top-4 group cursor-pointer focus-visible:outline-hidden"
                aria-label={`Keranjang Belanja. ${effectiveCartCount} item`}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative w-14 h-14 rounded-full bg-lime text-navy flex items-center justify-center shadow-lg transition-all active:scale-95 group-focus-visible:ring-4 group-focus-visible:ring-white ${
                        isActive
                          ? "ring-4 ring-white scale-105 shadow-lime/30"
                          : "hover:brightness-105 ring-2 ring-primary/20"
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                      {effectiveCartCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 bg-navy text-lime text-[11px] font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center ring-2 ring-primary shadow-sm"
                          aria-label={`${effectiveCartCount} item dalam keranjang`}
                        >
                          {effectiveCartCount > 99 ? "99+" : effectiveCartCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] mt-1 tracking-tight transition-colors ${
                        isActive ? "text-lime font-bold" : "text-white/80"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
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
                `flex flex-col items-center justify-center py-1 transition-colors group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime rounded-xl ${
                  isActive ? "text-lime font-semibold" : "text-white/70 hover:text-white"
                }`
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform group-active:scale-90 ${
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
                  <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 transition-all ${
                      isActive ? "bg-lime scale-100" : "bg-transparent scale-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
