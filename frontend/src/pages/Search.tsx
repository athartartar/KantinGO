import { Search as SearchIcon, SearchX, Utensils, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import PageHeader from "../components/PageHeader";
import WarungCard from "../components/WarungCard";
import { useCart } from "../lib/cart";
import { mockMenuList } from "../lib/mock/menu";
import { mockWarungList } from "../lib/mock/warung";
import FloatingCartButton from "../components/FloatingCartButton";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { addItem } = useCart();

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const cleanQuery = query.trim().toLowerCase();
  const isSearching = cleanQuery.length > 0;

  // Filter menu
  const matchingMenus = useMemo(() => {
    if (!isSearching) return [];
    return mockMenuList.filter(
      (m) =>
        m.nama.toLowerCase().includes(cleanQuery) ||
        (m.canteenName && m.canteenName.toLowerCase().includes(cleanQuery)) ||
        m.deskripsi.toLowerCase().includes(cleanQuery) ||
        m.kategori.toLowerCase().includes(cleanQuery)
    );
  }, [cleanQuery, isSearching]);

  // Filter warung
  const matchingWarungs = useMemo(() => {
    if (!isSearching) return [];
    return mockWarungList.filter(
      (w) =>
        w.nama.toLowerCase().includes(cleanQuery) ||
        (w.location && w.location.toLowerCase().includes(cleanQuery)) ||
        w.kategori.some((k) => k.toLowerCase().includes(cleanQuery))
    );
  }, [cleanQuery, isSearching]);

  const hasResults = matchingMenus.length > 0 || matchingWarungs.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title="Pencarian" backTo="/" />

      {/* Input Pencarian */}
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-navy/40">
          <SearchIcon className="w-5 h-5" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Cari menu favorit atau warung kantin..."
          autoFocus
          className="w-full pl-11 pr-11 py-3.5 bg-white border border-blue-100 rounded-full text-sm md:text-base text-navy placeholder:text-navy/40 shadow-soft focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => handleQueryChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-navy/40 hover:text-navy cursor-pointer"
            aria-label="Hapus kata kunci pencarian"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Konten Hasil Pencarian */}
      {isSearching ? (
        hasResults ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Hasil Menu */}
            {matchingMenus.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  <h2 className="text-lg md:text-xl font-bold text-navy">
                    Menu ({matchingMenus.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchingMenus.map((menu) => (
                    <MenuCard
                      key={menu.id}
                      menu={menu}
                      onAdd={(m) => {
                        const warung = mockWarungList.find((w) => w.id === m.warungId);
                        addItem(
                          {
                            menuId: m.id,
                            warungId: m.warungId,
                            jumlah: 1,
                            addOns: [],
                            hargaSatuan: m.harga,
                            menu: m,
                          },
                          warung?.nama
                        );
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Hasil Warung */}
            {matchingWarungs.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg md:text-xl font-bold text-navy">
                  Warung Kantin ({matchingWarungs.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {matchingWarungs.map((warung) => (
                    <WarungCard key={warung.id} warung={warung} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Empty State Pencarian */
          <div className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-soft max-w-md mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8 stroke-[2]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-navy">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-sm text-navy/60">
                Tidak ditemukan menu atau warung yang cocok dengan &quot;{query}&quot;. Coba gunakan kata kunci lain.
              </p>
            </div>
          </div>
        )
      ) : (
        /* Rekomendasi Awal Pencarian */
        <div className="text-center py-10 space-y-4 text-navy/60">
          <p className="text-sm">Ketik nama makanan, minuman, atau warung untuk mulai mencari.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            {["Ayam Geprek", "Nasi Goreng", "Kopi Susu", "Soto", "Mendoan"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQueryChange(tag)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-navy/75 hover:bg-slate-50 hover:text-primary transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <FloatingCartButton />
    </div>
  );
}
