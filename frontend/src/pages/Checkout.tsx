import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Receipt,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import QtyStepper from "../components/QtyStepper";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";
import type { CartItem, Voucher } from "../lib/mock/types";
import { mockVoucherList } from "../lib/mock/voucher";
import { mockWarungList } from "../lib/mock/warung";

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    warungId: cartWarungId,
    warungNama,
    updateQty,
    removeItem,
    totalItem,
    subtotal,
  } = useCart();

  // Ambil info warung untuk cek jam operasional
  const warung = useMemo(() => {
    return (
      mockWarungList.find((w) => String(w.id) === String(cartWarungId)) ||
      mockWarungList[0]
    );
  }, [cartWarungId]);

  // ----------------------------------------------------
  // State Waktu Pengambilan
  // ----------------------------------------------------
  const [selectedPill, setSelectedPill] = useState<number>(1); // 1, 2, 3, 4
  const [customTime, setCustomTime] = useState<string>("");
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
  const [timePickerInput, setTimePickerInput] = useState<string>("");
  const [timePickerError, setTimePickerError] = useState<string>("");

  // Waktu sekarang untuk referensi kalkulasi
  const now = useMemo(() => new Date(), []);

  const formatOffsetTime = (minutesOffset: number): string => {
    const d = new Date(now.getTime() + minutesOffset * 60000);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const pillSlots = useMemo(() => {
    return [
      { id: 1, label: `Secepatnya (±10 mnt)`, time: formatOffsetTime(10) },
      { id: 2, label: `+15 menit (${formatOffsetTime(15)})`, time: formatOffsetTime(15) },
      { id: 3, label: `+30 menit (${formatOffsetTime(30)})`, time: formatOffsetTime(30) },
    ];
  }, [now]);

  // Teks waktu pengambilan terpilih
  const selectedPickupTimeDisplay = useMemo(() => {
    if (selectedPill === 4 && customTime) {
      return `Pukul ${customTime} WIB`;
    }
    const matched = pillSlots.find((p) => p.id === selectedPill);
    return matched ? `${matched.label}` : `Pukul ${formatOffsetTime(10)} WIB`;
  }, [selectedPill, customTime, pillSlots]);

  // Validasi Time Picker Custom
  const handleSaveCustomTime = () => {
    setTimePickerError("");
    if (!timePickerInput) {
      setTimePickerError("Silakan pilih jam pengambilan.");
      return;
    }

    const [inputH, inputM] = timePickerInput.split(":").map(Number);
    const inputMinutes = inputH * 60 + inputM;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Validasi: minimal 10 menit dari sekarang
    if (inputMinutes < currentMinutes + 10) {
      setTimePickerError("Waktu pengambilan minimal 10 menit dari waktu sekarang.");
      return;
    }

    // 2. Validasi: dalam jam buka warung (misal "08:00 - 17:00")
    const warungJamBuka = warung.jamBuka || "08:00 - 17:00";
    const [openStr, closeStr] = warungJamBuka.split("-").map((s) => s.trim());
    if (openStr && closeStr) {
      const [openH, openM] = openStr.split(":").map(Number);
      const [closeH, closeM] = closeStr.split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      if (inputMinutes < openMinutes || inputMinutes > closeMinutes) {
        setTimePickerError(
          `Waktu di luar jam operasional warung (${warungJamBuka}).`
        );
        return;
      }
    }

    setCustomTime(timePickerInput);
    setSelectedPill(4);
    setIsTimePickerOpen(false);
  };

  // ----------------------------------------------------
  // State Voucher
  // ----------------------------------------------------
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);

  // Biaya layanan aplikasi
  const serviceFee = items.length > 0 ? 1000 : 0;

  // Hitung diskon voucher
  const discountAmount = useMemo(() => {
    if (!selectedVoucher) return 0;
    if (subtotal < selectedVoucher.minimalBelanja) return 0;

    if (selectedVoucher.tipe === "persen") {
      return Math.round((subtotal * selectedVoucher.nilai) / 100);
    }
    return selectedVoucher.nilai;
  }, [selectedVoucher, subtotal]);

  const grandTotal = Math.max(0, subtotal - discountAmount + serviceFee);

  // ----------------------------------------------------
  // State Modal Konfirmasi Hapus Item
  // ----------------------------------------------------
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  const handleQtyChange = (item: CartItem, newQty: number) => {
    if (newQty <= 0) {
      setItemToDelete(item);
    } else {
      updateQty(item.id, newQty);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  // ----------------------------------------------------
  // Navigasi ke Pembayaran QRIS
  // ----------------------------------------------------
  const handleProceedPayment = () => {
    if (items.length === 0) return;

    // Simpan data order sementara ke state navigasi
    navigate("/payment/qris", {
      state: {
        items,
        pickupTime: selectedPickupTimeDisplay,
        voucher: selectedVoucher,
        total: grandTotal,
        subtotal,
        discountAmount,
        serviceFee,
        warungNama: warungNama || warung.nama || warung.name || "Kantin Kampus",
        warungId: cartWarungId,
        totalItem,
      },
    });
  };

  // ----------------------------------------------------
  // Empty State jika Keranjang Kosong
  // ----------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-16 space-y-6">
        <PageHeader title="Checkout" backTo="/" />

        <div className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-5 shadow-soft max-w-md mx-auto animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8 stroke-[2]" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-navy tracking-tight">
              Keranjangmu Masih Kosong
            </h2>
            <p className="text-sm text-navy/60">
              Belum ada pesanan yang dipilih. Ayo cari makanan atau minuman lezat favoritmu!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-blue-bright text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Cari Makanan</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6 pb-28 lg:pb-12">
      {/* 1. Header back + judul "Checkout" */}
      <PageHeader
        title="Checkout"
        subtitle={`Pesanan dari ${warungNama || warung.nama || "Kantin Mitra"}`}
        backTo={cartWarungId ? `/warung/${cartWarungId}` : "/warung"}
      />

      {/* Grid Responsif: Mobile 1 Kolom, Desktop (lg) 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================== */}
        {/* KOLOM KIRI (lg:col-span-7): List Item + Waktu + Voucher */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Mini Warung */}
          <div className="bg-primary text-white rounded-3xl p-4 md:p-5 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Store className="w-5 h-5 text-lime" />
              </div>
              <div>
                <span className="text-[11px] text-white/80 font-medium uppercase tracking-wider">
                  Mitra Kantin
                </span>
                <h2 className="text-base font-bold text-white line-clamp-1">
                  {warungNama || warung.nama || "Kantin Kampus"}
                </h2>
              </div>
            </div>
            <span className="text-xs font-bold bg-lime text-navy px-3 py-1 rounded-full">
              {totalItem} Menu
            </span>
          </div>

          {/* 2. List Item Cart (Kartu) */}
          <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy">
                Daftar Pesanan ({items.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const addOnsPrice = (item.addOns || []).reduce(
                  (sum, a) => sum + (a.hargaTambahan || 0),
                  0
                );
                const itemTotalPrice = (item.hargaSatuan + addOnsPrice) * item.jumlah;
                const itemImage =
                  item.menu?.gambar ||
                  item.menu?.imageUrl ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80";

                return (
                  <article
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5 sm:gap-4"
                  >
                    {/* Thumbnail Menu */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-blue-50">
                      <img
                        src={itemImage}
                        alt={item.menu?.nama || "Menu"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Informasi Menu & Add-ons */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm md:text-base text-navy line-clamp-1">
                            {item.menu?.nama || `Menu #${item.menuId}`}
                          </h4>
                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                            aria-label={`Hapus ${item.menu?.nama || "menu"} dari keranjang`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs font-semibold text-primary mt-0.5">
                          {formatRupiah(item.hargaSatuan + addOnsPrice)} / porsi
                        </p>

                        {/* Ringkasan Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.addOns.map((add, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-surface text-navy/75 px-2 py-0.5 rounded-md border border-blue-100/60"
                              >
                                {add.nama}
                                {add.hargaTambahan > 0
                                  ? ` (+${formatRupiah(add.hargaTambahan)})`
                                  : ""}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Catatan Opsional */}
                        {item.catatan && (
                          <p className="text-xs text-navy/60 italic mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            &quot;{item.catatan}&quot;
                          </p>
                        )}
                      </div>

                      {/* Stepper & Subtotal Baris Bawah */}
                      <div className="flex items-center justify-between pt-2 mt-1">
                        <QtyStepper
                          value={item.jumlah}
                          onChange={(newQty) => handleQtyChange(item, newQty)}
                          min={0}
                          max={50}
                          size="sm"
                          ariaLabel={`Kuantitas ${item.menu?.nama || "item"}`}
                        />
                        <span className="font-extrabold text-sm md:text-base text-navy">
                          {formatRupiah(itemTotalPrice)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 3. Section Waktu Pengambilan dengan 4 Pill */}
          <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-navy">
                  Waktu Pengambilan
                </h3>
              </div>
              <span className="text-xs font-semibold text-navy/50">
                Jam buka: {warung.jamBuka || "08:00 - 17:00"}
              </span>
            </div>

            {/* 4 Pill Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Pill 1-3: Slot Cepat */}
              {pillSlots.map((pill) => {
                const isSelected = selectedPill === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedPill(pill.id)}
                    className={`p-3 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      isSelected
                        ? "bg-primary text-white font-bold shadow-md ring-2 ring-primary/20"
                        : "bg-surface text-navy/80 hover:bg-blue-100/60 border border-blue-100 font-semibold"
                    }`}
                  >
                    <span className="text-xs leading-tight">{pill.label}</span>
                  </button>
                );
              })}

              {/* Pill 4: Atur Waktu (Style Outline) */}
              <button
                type="button"
                onClick={() => {
                  setTimePickerInput(customTime || formatOffsetTime(15));
                  setIsTimePickerOpen(true);
                }}
                className={`p-3 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 border-2 ${
                  selectedPill === 4
                    ? "bg-primary text-white border-primary font-bold shadow-md"
                    : "bg-white text-primary border-primary/40 hover:border-primary hover:bg-blue-50/50 font-bold"
                }`}
              >
                <span className="text-xs leading-tight">
                  {customTime ? `Jam ${customTime}` : "Atur Waktu"}
                </span>
                <span className="text-[10px] opacity-75">
                  {customTime ? "Ubah" : "Pilih Jam"}
                </span>
              </button>
            </div>

            <p className="text-xs text-navy/60">
              Pesanan akan disiapkan untuk diambil pada:{" "}
              <strong className="text-primary font-bold">
                {selectedPickupTimeDisplay}
              </strong>
            </p>
          </section>

          {/* 4. Section Voucher */}
          <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-navy">Voucher Diskon</h3>
              </div>
            </div>

            {selectedVoucher ? (
              /* Voucher Terpilih */
              <div className="bg-lime/20 border border-lime/60 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-navy text-lime text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      {selectedVoucher.kode}
                    </span>
                    <span className="text-xs md:text-sm font-extrabold text-navy">
                      {selectedVoucher.judul}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700">
                    Hemat {formatRupiah(discountAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ) : (
              /* Tombol/Baris "Pakai Voucher" */
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(true)}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-surface hover:bg-blue-50/80 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-navy group-hover:text-primary transition-colors">
                      Pakai Voucher Promo
                    </p>
                    <p className="text-xs text-navy/50">
                      Gunakan voucher potongan untuk hemat belanja
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-primary">
                  <span>Pilih</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            )}
          </section>
        </div>

        {/* ==================================================== */}
        {/* KOLOM KANAN (lg:col-span-5): Ringkasan Sticky & Bayar */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          {/* 5. Kartu Ringkasan Pembayaran */}
          <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Receipt className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-navy">
                Ringkasan Pembayaran
              </h3>
            </div>

            <div className="space-y-2.5 text-xs md:text-sm text-navy/70">
              <div className="flex justify-between items-center">
                <span>Subtotal ({totalItem} item)</span>
                <span className="font-semibold text-navy">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold">
                  <span>Diskon Voucher ({selectedVoucher?.kode})</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Biaya Layanan Aplikasi</span>
                <span className="font-semibold text-navy">
                  {formatRupiah(serviceFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm md:text-base font-bold text-navy block">
                    Total Pembayaran
                  </span>
                  <span className="text-[11px] text-navy/50">
                    Termasuk PPN & Biaya Layanan
                  </span>
                </div>
                <span className="text-xl md:text-2xl font-black text-primary">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* 6. Tombol "Bayar Rp xx.xxx" (Desktop) */}
            <div className="hidden lg:block pt-3">
              <button
                type="button"
                onClick={handleProceedPayment}
                disabled={items.length === 0}
                className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Bayar {formatRupiah(grandTotal)}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 6. Tombol Bayar Sticky Bawah (Khusus Layar Mobile) */}
      {/* ==================================================== */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-blue-100 shadow-[0_-4px_24px_rgba(19,41,192,0.12)] p-4 lg:hidden">
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-navy/60 block">Total Bayar</span>
            <span className="text-lg font-black text-primary">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedPayment}
            disabled={items.length === 0}
            className="flex-1 py-3.5 px-6 rounded-full bg-primary hover:bg-blue-bright disabled:bg-slate-300 text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bayar {formatRupiah(grandTotal)}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </footer>

      {/* ==================================================== */}
      {/* MODAL 1: Time Picker Popover/Modal */}
      {/* ==================================================== */}
      {isTimePickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-blue-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Atur Jam Pengambilan</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTimePickerOpen(false)}
                className="text-navy/40 hover:text-navy cursor-pointer p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-navy/70 leading-relaxed">
              Pilih waktu pengambilan. Minimal 10 menit dari waktu sekarang dan berada dalam jam operasional warung (<strong>{warung.jamBuka || "08:00 - 17:00"}</strong>).
            </p>

            <div className="space-y-2">
              <label htmlFor="custom-pickup-time" className="text-xs font-bold text-navy block">
                Pilih Jam (WIB):
              </label>
              <input
                id="custom-pickup-time"
                type="time"
                value={timePickerInput}
                onChange={(e) => setTimePickerInput(e.target.value)}
                className="w-full p-3.5 bg-surface border border-blue-200 rounded-2xl text-lg font-bold text-navy focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white text-center"
              />
              {timePickerError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{timePickerError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsTimePickerOpen(false)}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCustomTime}
                className="flex-1 py-3 px-4 rounded-full bg-primary hover:bg-blue-bright text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Simpan Waktu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: List Voucher Modal / Sheet */}
      {/* ==================================================== */}
      {isVoucherModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-blue-100 space-y-4 max-h-[85vh] flex flex-col animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-navy">Pilih Voucher Promo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-navy/40 hover:text-navy cursor-pointer p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 py-1 flex-1">
              {mockVoucherList.map((v) => {
                const isEligible = subtotal >= v.minimalBelanja;
                const isSelected = selectedVoucher?.id === v.id;
                const diff = v.minimalBelanja - subtotal;

                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-primary bg-blue-50/70 ring-2 ring-primary/20"
                        : isEligible
                        ? "border-blue-100 bg-white hover:border-primary/40 hover:bg-surface/50"
                        : "border-dashed border-slate-200 bg-slate-50/70 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              isEligible
                                ? "bg-navy text-lime"
                                : "bg-slate-300 text-slate-700"
                            }`}
                          >
                            {v.kode}
                          </span>
                          <h4 className="text-sm font-bold text-navy line-clamp-1">
                            {v.judul}
                          </h4>
                        </div>

                        <p className="text-xs text-navy/60">
                          Minimal belanja: <strong>{formatRupiah(v.minimalBelanja)}</strong>
                        </p>

                        {!isEligible && (
                          <p className="text-[11px] font-semibold text-rose-600">
                            Belanja kurang {formatRupiah(diff)} untuk pakai voucher ini
                          </p>
                        )}
                      </div>

                      {/* Tombol Pilih / Disabled */}
                      <button
                        type="button"
                        disabled={!isEligible}
                        onClick={() => {
                          if (isEligible) {
                            setSelectedVoucher(v);
                            setIsVoucherModalOpen(false);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : isEligible
                            ? "bg-primary hover:bg-blue-bright text-white shadow-xs active:scale-95"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Terpilih
                          </span>
                        ) : (
                          "Gunakan"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="w-full py-3 rounded-full border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Konfirmasi Hapus Item Cart */}
      {/* ==================================================== */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-blue-100 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-navy">
                Hapus Menu dari Keranjang?
              </h3>
              <p className="text-xs text-navy/70 leading-relaxed">
                Apakah kamu yakin ingin menghapus &quot;
                <strong>{itemToDelete.menu?.nama || "menu ini"}</strong>&quot; dari keranjang?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
