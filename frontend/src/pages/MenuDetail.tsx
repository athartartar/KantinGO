import {
  AlertCircle,
  Check,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
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
    return (
      mockMenuList.find(
        (m) =>
          String(m.id) === String(menuId) && String(m.warungId) === String(warungId)
      ) || mockMenuList.find((m) => String(m.id) === String(menuId))
    );
  }, [menuId, warungId]);

  const warung = useMemo(() => {
    if (!menu) return null;
    return (
      mockWarungList.find((w) => String(w.id) === String(menu.warungId)) ||
      mockWarungList.find((w) => String(w.id) === String(warungId))
    );
  }, [menu, warungId]);

  // State jumlah pesanan (min 1)
  const [qty, setQty] = useState<number>(1);

  // State pilihan single add-on: Map<groupId, optionId>
  // Opsi default diisi opsi pertama jika required
  const [singleSelections, setSingleSelections] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      if (menu?.addOnGroups) {
        menu.addOnGroups.forEach((group) => {
          if (group.tipe === "single" && group.opsi.length > 0) {
            initial[group.id] = group.opsi[0].id;
          }
        });
      }
      return initial;
    }
  );

  // State pilihan multiple add-on: Map<optionId, boolean>
  const [multiSelections, setMultiSelections] = useState<Record<string, boolean>>(
    {}
  );

  // State field catatan opsional
  const [notes, setNotes] = useState<string>("");

  // State validasi kesalahan kelompok required
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(
    {}
  );

  // State toast notifikasi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!menu) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-surface text-navy">
        <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-sm w-full shadow-soft border border-blue-100">
          <h2 className="text-xl font-bold text-navy">Menu Tidak Ditemukan</h2>
          <p className="text-sm text-navy/60">
            Menu yang kamu cari tidak tersedia di warung ini.
          </p>
          <button
            type="button"
            onClick={() => navigate(warungId ? `/warung/${warungId}` : "/warung")}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-blue-bright transition-all"
          >
            Kembali ke Warung
          </button>
        </div>
      </div>
    );
  }

  // Hitung total harga tambahan dari seluruh add-on yang dipilih
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

  const handleSelectSingle = (groupId: string, optId: string) => {
    setSingleSelections((prev) => ({
      ...prev,
      [groupId]: optId,
    }));
    // Hapus pesan error validasi grup ini bila sudah dipilih
    if (validationErrors[groupId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[groupId];
        return next;
      });
    }
  };

  const handleToggleMulti = (optId: string) => {
    setMultiSelections((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  const handleAddToCart = () => {
    // 1. Validasi: add-on single wajib dipilih jika ditandai required
    const errors: Record<string, string> = {};
    menu.addOnGroups.forEach((group) => {
      if (group.tipe === "single" && group.required) {
        if (!singleSelections[group.id]) {
          errors[group.id] = `Pilihan "${group.judul}" wajib dipilih.`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // 2. Susun daftar add-on yang dipilih
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

    // 3. Tambahkan ke keranjang global
    const success = addItem(
      {
        menuId: menu.id,
        warungId: menu.warungId,
        jumlah: qty,
        addOns: selectedAddOns,
        catatan: notes.trim() || undefined,
        hargaSatuan: menu.harga,
        menu,
      },
      warung?.nama || warung?.name
    );

    // 4. Jika berhasil, munculkan toast dan arahkan kembali ke /warung/:warungId
    if (success) {
      setToastMessage("Ditambahkan ke keranjang");
      setTimeout(() => {
        const targetWarungId = warung?.id || warungId || menu.warungId;
        navigate(`/warung/${targetWarungId}`);
      }, 750);
    }
  };

  const warungNama = warung?.nama || warung?.name || "Warung Kantin";

  return (
    <div className="min-h-dvh bg-surface text-navy flex flex-col justify-between pb-28 lg:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 animate-slideDown pointer-events-none"
        >
          <div className="bg-navy text-lime font-bold text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-lime/30">
            <div className="w-5 h-5 rounded-full bg-lime text-navy flex items-center justify-center">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Kontainer Halaman Responsif: Mobile 1 Kolom, Desktop 2 Kolom */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-6">
        {/* Header Back */}
        <PageHeader
          title="Pesan Makanan"
          subtitle={warungNama}
          backTo={`/warung/${warung?.id || warungId || menu.warungId}`}
        />

        {/* Layout 2 Kolom di Desktop (lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Kolom Kiri: Kartu Gambar & Info Menu (Span 5 di Desktop) */}
          <section className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-blue-100 shadow-soft overflow-hidden">
              {/* Gambar Menu Besar */}
              <div className="relative w-full aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={menu.gambar}
                  alt={menu.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-navy/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                  <Store className="w-3.5 h-3.5 text-lime" />
                  <span>{warungNama}</span>
                </div>
              </div>

              {/* Info Menu: Nama, Kategori, Deskripsi, Harga Dasar */}
              <div className="p-5 md:p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full">
                    {menu.kategori}
                  </span>
                  <span className="text-xs font-semibold text-navy/50">
                    Harga Dasar
                  </span>
                </div>

                <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight leading-snug">
                  {menu.nama}
                </h1>

                <p className="text-xs md:text-sm text-navy/70 leading-relaxed">
                  {menu.deskripsi}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-navy/60">
                    Mulai dari
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {formatRupiah(menu.harga)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Kolom Kanan: Pilihan Add-On, Catatan & Panel Aksi (Span 7 di Desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section Pilihan Add-On dari addOnGroups */}
            {menu.addOnGroups.length > 0 && (
              <div className="space-y-4">
                {menu.addOnGroups.map((group) => {
                  const isSingle = group.tipe === "single";
                  const hasError = !!validationErrors[group.id];

                  return (
                    <section
                      key={group.id}
                      className={`bg-white rounded-3xl p-5 md:p-6 border shadow-soft space-y-3 transition-all ${
                        hasError
                          ? "border-rose-400 ring-2 ring-rose-200"
                          : "border-blue-100"
                      }`}
                    >
                      {/* Judul Kelompok & Badge Wajib/Opsional */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <h2 className="text-base font-bold text-navy flex items-center gap-2">
                            <span>{group.judul}</span>
                            {group.required && (
                              <span className="text-rose-500 font-bold">*</span>
                            )}
                          </h2>
                          {hasError && (
                            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{validationErrors[group.id]}</span>
                            </p>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            group.required
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-slate-100 text-navy/60"
                          }`}
                        >
                          {group.required ? "Wajib" : isSingle ? "Pilih 1" : "Opsional"}
                        </span>
                      </div>

                      {/* Baris Opsi Rounded sesuai Wireframe */}
                      <div className="space-y-2.5">
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
                              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left active:scale-[0.99] ${
                                isSelected
                                  ? "border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow-xs"
                                  : "border-slate-200/80 bg-white hover:bg-slate-50/80"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Single = Radio, Multiple = Checkbox */}
                                {isSingle ? (
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "border-primary bg-primary"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "border-primary bg-primary text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    )}
                                  </div>
                                )}

                                <span
                                  className={`text-sm ${
                                    isSelected
                                      ? "font-bold text-navy"
                                      : "font-medium text-navy/80"
                                  }`}
                                >
                                  {opt.nama}
                                </span>
                              </div>

                              {/* Tampilan Harga Tambahan ("+Rp 3.000") */}
                              <div>
                                {opt.hargaTambahan > 0 ? (
                                  <span className="text-xs md:text-sm font-bold text-primary">
                                    +{formatRupiah(opt.hargaTambahan)}
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-navy/40">
                                    Gratis
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {/* Field Catatan Opsional ("Contoh: sambal dipisah") */}
            <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-2.5">
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
                placeholder="Contoh: sambal dipisah"
                rows={3}
                className="w-full p-3.5 bg-surface border border-blue-100 rounded-2xl text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
              />
            </section>

            {/* Desktop Panel Aksi & Ringkasan Harga (Hanya tampil di Desktop lg) */}
            <div className="hidden lg:block bg-white rounded-3xl p-6 border border-blue-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-navy/70">
                  Jumlah Pesanan
                </span>
                <QtyStepper
                  value={qty}
                  onChange={setQty}
                  min={1}
                  max={50}
                  size="md"
                  ariaLabel={`Jumlah pesanan untuk ${menu.nama}`}
                />
              </div>

              <div className="flex items-center justify-between text-navy">
                <span className="text-sm font-bold">Total Pembayaran</span>
                <span className="text-2xl font-black text-primary">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 px-6 bg-primary hover:bg-blue-bright active:scale-98 text-white rounded-full font-bold text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                <span>Tambah ke Keranjang • {formatRupiah(totalPrice)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Sticky Khusus Mobile (Disembunyikan di Layar Desktop lg) */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-blue-100 shadow-[0_-4px_24px_rgba(19,41,192,0.12)] p-3.5 sm:p-4 lg:hidden">
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Stepper Jumlah (min 1) */}
          <QtyStepper
            value={qty}
            onChange={setQty}
            min={1}
            max={50}
            size="md"
            ariaLabel={`Jumlah pesanan untuk ${menu.nama}`}
          />

          {/* Tombol Tambah ke Keranjang dengan Total Realtime */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-4 sm:px-5 bg-primary hover:bg-blue-bright active:scale-98 text-white rounded-full font-bold text-xs sm:text-sm md:text-base flex items-center justify-between shadow-lg shadow-primary/25 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>Tambah</span>
            </span>
            <span className="font-black text-lime tracking-tight">
              {formatRupiah(totalPrice)}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
