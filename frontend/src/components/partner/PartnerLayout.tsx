import { LogOut, Store } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { PARTNER_NAV_ITEMS } from "./partnerNavConfig";
import { getAuthUser } from "../../lib/auth";
import { useUser } from "../../lib/user";
import { useCart } from "../../lib/cart";
import { useOrders } from "../../lib/orders";
import { useVoucher } from "../../context/VoucherContext";
import { useNotifications } from "../../lib/notifications";
import logoUrl from "../../../logo_KantinGO.png";

export default function PartnerLayout() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const { logout } = useUser();
  const { clearCart } = useCart();
  const { clearOrders } = useOrders();
  const { clearVouchers } = useVoucher();
  const { clearAll: clearNotifications } = useNotifications();

  const handleLogout = () => {
    logout();
    clearCart();
    clearOrders();
    clearVouchers();
    clearNotifications();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-surface text-navy font-sans antialiased flex flex-col overflow-x-hidden">
      {/* TopNav untuk desktop (md ke atas) & header ringkas di mobile */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={logoUrl} alt="KantinGO" className="w-8 h-8 object-contain shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-navy tracking-tight truncate">
                  KantinGO
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-primary">
                  Mitra
                </span>
              </div>
              <p className="text-[11px] text-navy/55 truncate flex items-center gap-1">
                <Store className="w-3 h-3 shrink-0" />
                <span className="truncate">{authUser?.warung?.name || "Warung Mitra"}</span>
              </p>
            </div>
          </div>

          <nav aria-label="Navigasi Mitra Desktop" className="hidden md:flex items-center gap-1.5">
            {PARTNER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "text-navy/70 hover:bg-slate-100 hover:text-navy"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-12">
        <Outlet />
      </main>

      {/* BottomNav khusus mitra (hanya tampil di bawah md) */}
      <nav
        aria-label="Navigasi Bawah Mitra"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_-6px_rgba(12,18,46,0.08)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 h-16 px-1">
          {PARTNER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                    isActive ? "text-primary" : "text-navy/55 hover:text-navy"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        isActive ? "bg-blue-50 text-primary" : ""
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
