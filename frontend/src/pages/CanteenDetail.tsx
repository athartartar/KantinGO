import { Clock, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import FloatingCartButton from "../components/FloatingCartButton";
import MenuCard from "../components/MenuCard";
import PageHeader from "../components/PageHeader";
import PillTabs from "../components/PillTabs";
import { useCart } from "../lib/cart";
import { mockMenuList } from "../lib/mock/menu";
import { mockWarungList } from "../lib/mock/warung";

export default function CanteenDetail() {
  const { id, warungId } = useParams<{ id?: string; warungId?: string }>();
  const activeId = warungId || id;
  const { addItem } = useCart();

  const warung = useMemo(() => {
    return (
      mockWarungList.find(
        (w) => String(w.id) === String(activeId) || w.name?.toLowerCase().includes(String(activeId).toLowerCase())
      ) || mockWarungList[0]
    );
  }, [activeId]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filter menu warung ini
  const warungMenus = useMemo(() => {
    if (!warung) return [];
    return mockMenuList.filter((m) => String(m.warungId) === String(warung.id));
  }, [warung]);

  // Kategori unik untuk warung ini
  const categories = useMemo(() => {
    const cats = Array.from(new Set(warungMenus.map((m) => m.kategori)));
    return [
      { id: "all", label: "Semua Menu", count: warungMenus.length },
      ...cats.map((c) => ({
        id: c,
        label: c,
        count: warungMenus.filter((m) => m.kategori === c).length,
      })),
    ];
  }, [warungMenus]);

  const displayedMenus = useMemo(() => {
    if (activeCategory === "all") return warungMenus;
    return warungMenus.filter((m) => m.kategori === activeCategory);
  }, [warungMenus, activeCategory]);

  if (!warung) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 md:px-6 lg:px-8 py-8 text-center space-y-4">
        <PageHeader title="Warung Tidak Ditemukan" backTo="/warung" />
        <p className="text-sm text-navy/60">Mitra kantin tidak dapat ditemukan.</p>
      </div>
    );
  }

  const warungNama = warung.nama || warung.name || "Warung Kantin";
  const warungImage = warung.logo || warung.imageUrl || "";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title={warungNama} backTo="/warung" />

      {/* Banner & Profil Warung */}
      <section className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-soft">
        <div className="relative w-full h-44 sm:h-56 md:h-72 bg-slate-100">
          <img
            src={warungImage}
            alt={warungNama}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                warung.isOpen ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              {warung.isOpen ? "Buka Sekarang" : "Tutup"}
            </span>
          </div>
        </div>

        <div className="p-5 md:p-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight">
              {warungNama}
            </h1>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full self-start">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 stroke-amber-400" />
              <span className="font-bold text-sm text-navy">{warung.rating}</span>
              <span className="text-xs text-navy/50">({warung.jumlahUlasan || warung.reviewCount} ulasan)</span>
            </div>
          </div>

          <p className="text-xs md:text-sm text-navy/60">
            {warung.kategori?.join(" • ") || warung.categoryLabel}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-navy/70 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-primary" />
              <span>Jam Operasional: {warung.jamBuka || "08:00 - 17:00"}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{warung.location || "Kantin Utama Kampus"}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Tabs Kategori Menu */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-navy">
            Daftar Menu
          </h2>
          <span className="text-xs text-navy/50">{displayedMenus.length} pilihan</span>
        </div>

        <PillTabs
          tabs={categories}
          activeTab={activeCategory}
          onChange={setActiveCategory}
        />

        {/* Grid Menu Horizontal */}
        {displayedMenus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {displayedMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                to={`/warung/${warung.id}/menu/${menu.id}`}
                onAdd={(m) => {
                  addItem(
                    {
                      menuId: m.id,
                      warungId: String(warung.id),
                      jumlah: 1,
                      addOns: [],
                      hargaSatuan: m.harga,
                      menu: m,
                    },
                    warungNama
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center space-y-2 border border-blue-100 shadow-soft">
            <UtensilsCrossed className="w-8 h-8 text-navy/30 mx-auto" />
            <p className="text-sm text-navy/60">Tidak ada menu untuk kategori ini.</p>
          </div>
        )}
      </section>

      <FloatingCartButton />
    </div>
  );
}
