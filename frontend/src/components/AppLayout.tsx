import { ClipboardList, Home, ShoppingBag, Ticket, User } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/voucher", label: "Voucher", icon: Ticket },
  { to: "/cart", label: "Keranjang", icon: ShoppingBag },
  { to: "/status", label: "Status", icon: ClipboardList },
  { to: "/profile", label: "Profil", icon: User },
];

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-[15rem] border-r border-neutral-200 bg-white shrink-0 sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-600 tracking-tight">KantinGO</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-6">
          <Outlet />
        </main>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 px-2 pt-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "text-orange-600"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
