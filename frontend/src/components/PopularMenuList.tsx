import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, RefreshCw, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { getMenus, getWarungs } from "../lib/api";
import type { MenuItem } from "../lib/mock";
import { mockPopularMenus } from "../lib/mock";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface PopularMenuListProps {
  onAddToCart?: (menu: MenuItem) => void;
}

export default function PopularMenuList({ onAddToCart }: PopularMenuListProps) {
  const {
    data: menus = mockPopularMenus,
    isLoading,
    isError,
    refetch,
  } = useQuery<MenuItem[]>({
    queryKey: ["menus"],
    queryFn: async () => {
      try {
        const raw = await getMenus();
        if (!raw || raw.length === 0) return mockPopularMenus;
        const warungs = await getWarungs();
        const canteenMap = new Map(warungs.map((w) => [String(w.id), w.name || w.nama || "Kantin"]));

        return raw.map((item, index) => ({
          id: typeof item.id === "number" ? item.id : index + 1,
          canteenId: Number(item.warungId) || 1,
          canteenName: canteenMap.get(String(item.warungId)) || item.canteenName || `Kantin #${item.warungId}`,
          name: item.nama || item.name || "Menu",
          price: item.harga ?? item.price ?? 0,
          description: item.deskripsi || item.description || "",
          imageUrl:
            item.gambar ||
            item.imageUrl ||
            mockPopularMenus.find(
              (m) => (m.name || "").toLowerCase() === (item.nama || item.name || "").toLowerCase()
            )?.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
          isAvailable: item.isAvailable ?? true,
          rating: item.rating ?? 4.8,
          soldCount: item.soldCount || 120,
          categoryId: item.categoryId || "heavy",
        }));
      } catch {
        return mockPopularMenus;
      }
    },
    initialData: mockPopularMenus,
  });

  const handleAdd = (menu: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(menu);
    }
  };

  return (
    <section
      aria-labelledby="popular-menu-heading"
      className="bg-primary text-white rounded-3xl p-4 md:p-6 shadow-soft"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="popular-menu-heading"
          className="text-lg md:text-xl font-bold tracking-tight text-white"
        >
          Menu Populer
        </h2>
        <Link
          to="/warung"
          className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white hover:text-lime text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer backdrop-blur-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime"
          aria-label="Lihat semua menu populer"
        >
          <span>Lihat semua</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
        </Link>
      </div>

      {isLoading && (
        <div
          role="status"
          aria-label="Memuat menu populer"
          className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:pt-0"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[145px] min-w-[145px] bg-white rounded-2xl p-3 shadow-xs animate-pulse space-y-2 md:w-full md:min-w-0"
            >
              <div className="w-full aspect-square bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                <div className="w-7 h-7 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
          <span className="sr-only">Memuat data menu...</span>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="bg-white/10 rounded-2xl p-6 text-center space-y-3 border border-white/20"
        >
          <p className="text-white/90 text-sm">Gagal memuat menu dari server</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-lime text-navy font-bold text-xs rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && menus.length === 0 && (
        <div className="bg-white/10 rounded-2xl p-8 text-center space-y-2 border border-white/10">
          <Utensils className="w-8 h-8 text-white/50 mx-auto" aria-hidden="true" />
          <p className="text-white/80 text-sm">Belum ada menu populer tersedia.</p>
        </div>
      )}

      {!isLoading && menus.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:pt-0">
          {menus.map((menu, index) => (
            <article
              key={menu.id}
              className={`w-[145px] min-w-[145px] shrink-0 snap-start bg-white text-navy rounded-2xl p-3 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group md:w-full md:min-w-0 ${
                index >= 4 ? "md:hidden" : ""
              }`}
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-slate-100 shrink-0">
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="font-bold text-sm text-navy line-clamp-1 leading-snug"
                    title={menu.name}
                  >
                    {menu.name}
                  </h3>
                  <p
                    className="text-[11px] text-navy/60 line-clamp-1 mt-0.5"
                    title={menu.canteenName}
                  >
                    {menu.canteenName}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-xs md:text-sm text-primary">
                    {formatRupiah(menu.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdd(menu)}
                    className="w-7 h-7 rounded-full bg-primary hover:bg-blue-bright active:scale-90 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label={`Tambah ${menu.name} ke keranjang seharga ${formatRupiah(menu.price)}`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
