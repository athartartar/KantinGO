import { Check, ChevronLeft, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QtyStepper from "../components/QtyStepper";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";
import type { CartAddOn } from "../lib/mock/types";
import { mockMenuList } from "../lib/mock/menu";
import { mockWarungList } from "../lib/mock/warung";

export default function MenuDetail() {
  const { warungId, menuId } = useParams<{ warungId: string; menuId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const menu = useMemo(() => {
    return mockMenuList.find(
      (m) => String(m.id) === String(menuId) && String(m.warungId) === String(warungId)
    ) || mockMenuList.find((m) => String(m.id) === String(menuId));
  }, [menuId, warungId]);

  const warung = useMemo(() => {
    if (!menu) return null;
    return mockWarungList.find((w) => String(w.id) === String(menu.warungId));
  }, [menu]);

  // State kuantitas item
  const [qty, setQty] = useState<number>(1);
  // State pilihan add-on (single: Map<groupId, optionId>; multiple: Set<optionId>)
  const [singleSelections, setSingleSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (menu?.addOnGroups) {
      menu.addOnGroups.forEach((group) => {
        if (group.tipe === "single" && group.opsi.length > 0) {
          initial[group.id] = group.opsi[0].id;
        }
      });
    }
    return initial;
  });

  const [multiSelections, setMultiSelections] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!menu) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 max-w-sm w-full shadow-soft">
          <h2 className="text-xl font-bold text-navy">Menu Tidak Ditemukan</h2>
          <p className="text-sm text-navy/60">Menu yang kamu cari tidak tersedia.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Hitung total harga tambahan dari add-on yang dipilih
  const addOnsTotal = useMemo(() => {
    let total = 0;
    menu.addOnGroups.forEach((group) => {
      if (group.tipe === "single") {
        const selectedOptId = singleSelections[group.id];
        const opt = group.opsi.find((o) => o.id === selectedOptId);
        if (opt) total += opt.hargaTambahan;
      } else {
        group.opsi.forEach((opt) => {
          if (multiSelections[opt.id]) {
            total += opt.hargaTambahan;
          }
        });
      }
    });
    return total;
  }, [menu.addOnGroups, singleSelections, multiSelections]);

  const unitPrice = menu.harga + addOnsTotal;
  const totalPrice = unitPrice * qty;

  const handleToggleMulti = (optId: string) => {
    setMultiSelections((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  const handleSelectSingle = (groupId: string, optId: string) => {
    setSingleSelections((prev) => ({
      ...prev,
      [groupId]: optId,
    }));
  };

  const handleAddToCart = () => {
    // Siapkan list addOns untuk cart
    const selectedAddOns: CartAddOn[] = [];

    menu.addOnGroups.forEach((group) => {
      if (group.tipe === "single") {
        const optId = singleSelections[group.id];
        const opt = group.opsi.find((o) => o.id === optId);
        if (opt) {
          selectedAddOns.push({
            groupId: group.id,
            groupJudul: group.judul,
            optionId: opt.id,
            nama: opt.nama,
            hargaTambahan: opt.hargaTambahan,
          });
        }
      } else {
        group.opsi.forEach((opt) => {
          if (multiSelections[opt.id]) {
            selectedAddOns.push({
              groupId: group.id,
              groupJudul: group.judul,
              optionId: opt.id,
              nama: opt.nama,
              hargaTambahan: opt.hargaTambahan,
            });
          }
        });
      }
    });

    const success = addItem(
      {
        menuId: menu.id,
        warungId: menu.warungId,
        jumlah: qty,
        addOns: selectedAddOns,
        catatan: notes,
        hargaSatuan: menu.harga,
        menu,
      },
      warung?.nama
    );

    if (success) {
      setToastMessage("Berhasil ditambahkan ke keranjang!");
      setTimeout(() => {
        if (warung) {
          navigate(`/warung/${warung.id}`);
        } else {
          navigate(-1);
        }
      }, 700);
    }
  };

  return (
    <div className="min-h-dvh bg-surface text-navy flex flex-col justify-between pb-32 md:pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 animate-slideDown"
        >
          <div className="bg-navy text-lime font-bold text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-lime/30">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Konten Utama */}
      <main className="w-full max-w-3xl mx-auto">
        {/* Gambar Hero Menu & Tombol Back Floating */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 bg-slate-200">
          <img
            src={menu.gambar}
            alt={menu.nama}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-black/20" />

          {/* Tombol Back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs text-navy flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Informasi Menu */}
        <div className="px-4 md:px-6 py-6 -mt-6 relative bg-surface rounded-t-3xl space-y-6">
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full">
                {menu.kategori}
              </span>
              {warung && (
                <span className="text-xs font-semibold text-navy/60">
                  {warung.nama}
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight">
              {menu.nama}
            </h1>

            <p className="text-xs md:text-sm text-navy/70 leading-relaxed">
              {menu.deskripsi}
            </p>

            <div className="pt-2">
              <span className="text-xl md:text-2xl font-black text-primary">
                {formatRupiah(menu.harga)}
              </span>
            </div>
          </div>

          {/* Add-on Groups */}
          {menu.addOnGroups.map((group) => {
            const isSingle = group.tipe === "single";

            return (
              <section
                key={group.id}
                className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-base font-bold text-navy">{group.judul}</h2>
                  <span className="text-xs font-semibold text-navy/50 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {isSingle ? "Pilih 1" : "Opsional"}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.opsi.map((opt) => {
                    const isSelected = isSingle
                      ? singleSelections[group.id] === opt.id
                      : !!multiSelections[opt.id];

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          isSingle
                            ? handleSelectSingle(group.id, opt.id)
                            : handleToggleMulti(opt.id)
                        }
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "border-primary bg-blue-50/50 shadow-xs ring-1 ring-primary"
                            : "border-slate-200/80 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-${
                              isSingle ? "full" : "md"
                            } border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-sm ${
                              isSelected ? "font-bold text-navy" : "font-medium text-navy/80"
                            }`}
                          >
                            {opt.nama}
                          </span>
                        </div>

                        {opt.hargaTambahan > 0 ? (
                          <span className="text-xs font-bold text-primary">
                            +{formatRupiah(opt.hargaTambahan)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-navy/40">
                            Gratis
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Catatan untuk Penjual */}
          <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-2">
            <label
              htmlFor="menu-notes"
              className="block text-sm font-bold text-navy"
            >
              Catatan Khusus (Opsional)
            </label>
            <textarea
              id="menu-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Jangan terlalu pedas, bumbu dipisah, dll."
              rows={2}
              className="w-full p-3 bg-surface border border-blue-100 rounded-2xl text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
            />
          </section>
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-blue-100 shadow-[0_-4px_24px_rgba(19,41,192,0.1)] p-4 md:py-4">
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Stepper Jumlah */}
          <QtyStepper
            value={qty}
            onChange={setQty}
            min={1}
            max={50}
            size="lg"
            ariaLabel={`Jumlah pesanan untuk ${menu.nama}`}
          />

          {/* Tombol Tambah ke Keranjang */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-5 bg-primary hover:bg-blue-bright active:scale-98 text-white rounded-full font-bold text-sm md:text-base flex items-center justify-between shadow-lg shadow-primary/25 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              <span>Tambah</span>
            </span>
            <span className="font-black text-lime">
              {formatRupiah(totalPrice)}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
