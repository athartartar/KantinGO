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
        (w) =>
          String(w.id) === String(activeId) ||
          w.name?.toLowerCase().includes(String(activeId).toLowerCase()) ||
          w.nama?.toLowerCase().includes(String(activeId).toLowerCase())
      ) || mockWarungList[0]
    );
  }, [activeId]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Filter menu yang dimiliki oleh warung ini
  const warungMenus = useMemo(() => {
    if (!warung) return [];
    return mockMenuList.filter((m) => String(m.warungId) === String(warung.id));
  }, [warung]);

  // Ekstrak kategori unik untuk chip tabs
  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(warungMenus.map((m) => m.kategori)));
    return [
      { id: "all", label: "Semua", count: warungMenus.length },
      ...rawCategories.map((c) => ({
        id: c,
        label: c,
        count: warungMenus.filter((m) => m.kategori === c).length,
      })),
    ];
  }, [warungMenus]);

  // Filter menu berdasarkan tab kategori yang aktif
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
  const warungLogo = warung.logo || warung.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80";
  const warungRating = warung.rating ?? 4.8;
  const warungUlasan = warung.jumlahUlasan ?? warung.reviewCount ?? 0;
  const warungJamBuka = warung.jamBuka || "08:00 - 17:00";
  const warungLokasi = warung.location || "Kantin Kampus";
  const warungIsOpen = warung.isOpen ?? true;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      {/* Header dengan tombol back */}
      <PageHeader title={warungNama} backTo="/warung" />

      {/* Kartu Info Warung (Sesuai Wireframe Warung A) */}
      <section className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-soft transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
          {/* Logo / Foto Warung */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-blue-100 shadow-xs">
            <img
              src={warungLogo}
              alt={warungNama}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1.5 left-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block ${
                  warungIsOpen ? "bg-emerald-500 ring-2 ring-white" : "bg-slate-500 ring-2 ring-white"
                }`}
                title={warungIsOpen ? "Buka" : "Tutup"}
              />
            </div>
          </div>

          {/* Metadata Warung */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-navy tracking-tight truncate">
                {warungNama}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  warungIsOpen
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {warungIsOpen ? "Buka" : "Tutup"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs md:text-sm text-navy/70">
              {/* Rating */}
              <span className="flex items-center gap-1 font-bold text-navy">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 stroke-amber-400" />
                <span>{warungRating}</span>
                <span className="text-navy/50 font-normal">({warungUlasan} ulasan)</span>
              </span>

              {/* Jam Buka */}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Jam Buka: <strong className="font-semibold text-navy">{warungJamBuka}</strong></span>
              </span>

              {/* Lokasi */}
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[200px] sm:max-w-none">{warungLokasi}</span>
              </span>
            </div>

            {/* Kategori label */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(warung.kategori || warung.categories || []).map((kat, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-surface text-navy/70 px-2.5 py-0.5 rounded-full border border-blue-100/80"
                >
                  {kat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chip Kategori Menu (Semua, Makanan, Minuman, dst.) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-navy">
            Pilihan Menu
          </h2>
          <span className="text-xs text-navy/50">{displayedMenus.length} menu</span>
        </div>

        <PillTabs
          tabs={categories}
          activeTab={activeCategory}
          onChange={setActiveCategory}
        />

        {/* List MenuCard: Mobile 1 kolom, Desktop 2-3 kolom */}
        {displayedMenus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
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

      {/* Floating Cart Button di kanan bawah (hanya muncul jika cart tidak kosong) */}
      <FloatingCartButton to="/checkout" />
    </div>
  );
}
