import { Bell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { UserProfile } from "../lib/mock";
import { mockNotifications, mockUser } from "../lib/mock";
import SearchBar from "./SearchBar";

interface HomeHeaderProps {
  user?: UserProfile;
  unreadCount?: number;
  onSearch?: (query: string) => void;
}

export default function HomeHeader({
  user = mockUser,
  unreadCount,
  onSearch,
}: HomeHeaderProps) {
  const activeUnreadCount =
    unreadCount ?? mockNotifications.filter((n) => !n.isRead).length;

  const formattedPoints = new Intl.NumberFormat("id-ID").format(user.points);

  return (
    <header className="relative w-full bg-gradient-to-r from-primary via-primary to-blue-bright text-white rounded-b-[2rem] md:rounded-b-none shadow-md">
      {/* Konten Utama Header */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-10 pb-9 md:pb-12">
        <div className="flex items-start justify-between gap-4">
          {/* Kiri: Sapaan, nama user tebal, dan tagline */}
          <div className="space-y-0.5 md:space-y-1">
            <p className="text-white/80 text-xs md:text-sm font-medium tracking-wide">
              Halo,
            </p>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              {user.name}
            </h1>
            <p className="text-white/85 text-xs md:text-sm font-normal">
              Mau makan apa hari ini?
            </p>
          </div>

          {/* Kanan Atas: Pill poin lime & tombol lingkaran notifikasi */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link
              to="/voucher"
              className="inline-flex items-center gap-1.5 bg-lime text-navy font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              aria-label={`Poin Anda: ${formattedPoints} poin. Buka halaman Voucher.`}
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-navy stroke-[2.5]" aria-hidden="true" />
              <span>{formattedPoints} poin</span>
            </Link>

            <Link
              to="/notifications"
              className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-95 border border-white/20 backdrop-blur-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              aria-label={`Notifikasi. ${activeUnreadCount} belum dibaca.`}
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5 stroke-2" aria-hidden="true" />
              {activeUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-lime text-navy text-[10px] md:text-xs font-black min-w-4 h-4 md:min-w-4.5 md:h-4.5 px-1 rounded-full flex items-center justify-center ring-2 ring-primary shadow-xs">
                  {activeUnreadCount > 99 ? "99+" : activeUnreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* SearchBar: Pill putih besar menumpuk sebagian di tepi bawah header */}
      <div className="absolute left-0 right-0 -bottom-6 md:-bottom-7 z-20 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="w-full md:max-w-2xl">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
      </div>
    </header>
  );
}
