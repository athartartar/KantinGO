import { useQuery } from "@tanstack/react-query";
import { Plus, SearchX, Utensils, X } from "lucide-react";
import { useState } from "react";
import CategoryList from "../components/CategoryList";
import HomeHeader from "../components/HomeHeader";
import PopularMenuList from "../components/PopularMenuList";
import WarungCard from "../components/WarungCard";
import WarungList from "../components/WarungList";
import { api } from "../lib/api";
import type { MenuItem } from "../lib/mock";
import { mockPopularMenus, mockWarung } from "../lib/mock";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Query menu terintegrasi (dengan fallback mockPopularMenus)
  const { data: allMenus = mockPopularMenus } = useQuery<MenuItem[]>({
    queryKey: ["menus"],
    queryFn: async () => {
      try {
        const res = await api.api.menus.$get();
        if (!res.ok) return mockPopularMenus;
        const raw = await res.json();
        if (!raw || !("data" in raw) || raw.data.length === 0) return mockPopularMenus;

        const canteenMap = new Map(mockWarung.map((w) => [w.id, w.name]));
        return raw.data.map((item, index) => ({
          id: index + 1,
          canteenId: 1,
          canteenName: canteenMap.get(1) || "Kantin #1",
          name: item.name,
          price: item.price,
          description: item.description || "",
          imageUrl:
            item.imageUrl ||
            mockPopularMenus.find(
              (m) => m.name.toLowerCase() === item.name.toLowerCase()
            )?.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
          isAvailable: item.isAvailable,
          rating: 4.8,
          soldCount: item.orderCount || 120,
          categoryId: item.categoryId || "heavy",
        }));
      } catch {
        return mockPopularMenus;
      }
    },
    initialData: mockPopularMenus,
  });

  const queryClean = searchQuery.trim().toLowerCase();
  const isSearching = queryClean.length > 0;

  // Filter Menu yang cocok dengan kata kunci
  const matchingMenus = isSearching
    ? allMenus.filter(
        (m) =>
          m.name.toLowerCase().includes(queryClean) ||
          m.canteenName.toLowerCase().includes(queryClean) ||
          m.description.toLowerCase().includes(queryClean)
      )
    : [];

  // Filter Warung yang cocok dengan kata kunci
  const matchingWarungs = isSearching
    ? mockWarung.filter(
        (w) =>
          w.name.toLowerCase().includes(queryClean) ||
          w.location.toLowerCase().includes(queryClean) ||
          (w.categoryLabel && w.categoryLabel.toLowerCase().includes(queryClean)) ||
          w.categories.some((c) => c.toLowerCase().includes(queryClean))
      )
    : [];

  const hasResults = matchingMenus.length > 0 || matchingWarungs.length > 0;

  return (
    <div className="w-full">
      {/* 1. Header sapaan & SearchBar debounced yang menumpuk di tepi bawah */}
      <HomeHeader onSearch={setSearchQuery} />

      {/* 2. Konten Dinamis: Jika sedang mencari, tampilkan hasil; jika tidak, tampilkan Homepage normal */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-10 md:pt-14 space-y-8 md:space-y-12">
        {isSearching ? (
          /* Tampilan Hasil Pencarian */
          <section
            aria-live="polite"
            className="space-y-8 animate-fadeIn"
          >
            {/* Header Hasil Pencarian */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-blue-100">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-navy tracking-tight">
                  Hasil Pencarian
                </h2>
                <p className="text-xs md:text-sm text-navy/60 mt-0.5">
                  Menampilkan hasil untuk &quot;
                  <span className="font-semibold text-primary">{searchQuery}</span>
                  &quot;
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-navy/70 bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-all active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hapus Pencarian</span>
              </button>
            </div>

            {hasResults ? (
              <div className="space-y-8">
                {/* Hasil Menu */}
                {matchingMenus.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-bold text-navy flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-primary" aria-hidden="true" />
                        <span>Menu ({matchingMenus.length})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {matchingMenus.map((menu) => (
                        <article
                          key={menu.id}
                          className="bg-white border border-blue-100 rounded-2xl p-3 shadow-soft flex flex-col justify-between hover:shadow-card hover:border-primary/30 transition-all group"
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
                              <h4
                                className="font-bold text-sm text-navy line-clamp-1 leading-snug"
                                title={menu.name}
                              >
                                {menu.name}
                              </h4>
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
                                className="w-7 h-7 rounded-full bg-primary hover:bg-blue-bright active:scale-90 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                aria-label={`Tambah ${menu.name} ke keranjang`}
                              >
                                <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hasil Warung */}
                {matchingWarungs.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-bold text-navy flex items-center gap-2">
                        <span>Warung Kantin ({matchingWarungs.length})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {matchingWarungs.map((warung) => (
                        <WarungCard key={warung.id} warung={warung} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State jika tidak ada menu maupun warung yang cocok */
              <div
                role="status"
                className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-soft max-w-md mx-auto my-6"
              >
                <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
                  <SearchX className="w-8 h-8 stroke-[2]" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-navy">
                    Tidak ada hasil ditemukan
                  </h3>
                  <p className="text-sm text-navy/60">
                    Tidak ditemukan menu atau warung yang cocok dengan &quot;
                    {searchQuery}&quot;. Silakan coba kata kunci lain.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-bright text-white text-sm font-semibold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span>Kembali ke Beranda</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Tampilan Homepage Normal */
          <>
            <PopularMenuList />
            <CategoryList />
            <WarungList />
          </>
        )}
      </div>
    </div>
  );
}
