import {
  ArrowRight,
  Clock,
  CreditCard,
  QrCode,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import QtyStepper from "../components/QtyStepper";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";
import { mockVoucherList } from "../lib/mock/voucher";
import type { Voucher } from "../lib/mock/types";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, warungNama, updateQty, removeItem, totalItem, subtotal, clearCart } =
    useCart();

  const [diningOption, setDiningOption] = useState<"pickup" | "dine_in">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "cash">("qris");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>("");
  const [voucherError, setVoucherError] = useState<string>("");

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

  const handleApplyVoucherCode = () => {
    setVoucherError("");
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) return;

    const matched = mockVoucherList.find((v) => v.kode.toUpperCase() === code);
    if (!matched) {
      setVoucherError("Kode voucher tidak valid atau sudah kedaluwarsa.");
      return;
    }
    if (subtotal < matched.minimalBelanja) {
      setVoucherError(
        `Minimal belanja untuk voucher ini adalah ${formatRupiah(
          matched.minimalBelanja
        )}.`
      );
      return;
    }
    setSelectedVoucher(matched);
    setVoucherCodeInput("");
  };

  const handleProceedPayment = () => {
    if (items.length === 0) return;

    if (paymentMethod === "qris") {
      navigate("/payment/qris", {
        state: {
          total: grandTotal,
          warungNama: warungNama || "Kantin Kampus",
          totalItem,
          diningOption,
        },
      });
    } else {
      // Pembayaran tunai di kasir
      clearCart();
      navigate("/checkout/success", {
        state: {
          total: grandTotal,
          warungNama: warungNama || "Kantin Kampus",
          orderId: `KGO-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentMethod: "Tunai di Kasir",
        },
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        <PageHeader title="Checkout" backTo="/" />

        <div className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-soft max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 stroke-[2]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-navy">Keranjangmu Masih Kosong</h2>
            <p className="text-sm text-navy/60">
              Pilih makanan atau minuman lezat dari kantin mitra kampus favoritmu.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/warung"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-bright text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition-all"
            >
              <span>Jelajahi Warung</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title="Checkout Pesanan" backTo="/" />

      {/* Grid Responsif: Mobile 1 kolom, Desktop 2 kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Daftar Item & Opsi Pengambilan (Span 7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Info Warung */}
          <div className="bg-primary text-white rounded-3xl p-4 md:p-5 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Store className="w-5 h-5 text-lime" />
              </div>
              <div>
                <span className="text-[11px] text-white/80 font-medium uppercase tracking-wider">
                  Pesanan Dari
                </span>
                <h2 className="text-base md:text-lg font-bold text-white line-clamp-1">
                  {warungNama || "Mitra Kantin"}
                </h2>
              </div>
            </div>
            <span className="text-xs font-semibold bg-lime text-navy px-3 py-1 rounded-full">
              {totalItem} Menu
            </span>
          </div>

          {/* Opsi Pengambilan Makanan */}
          <section className="bg-white rounded-3xl p-5 border border-blue-100 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-navy">Metode Pesanan</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiningOption("pickup")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  diningOption === "pickup"
                    ? "border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-navy">Pick-up Sendiri</span>
                </div>
                <p className="text-[11px] text-navy/60">Ambil langsung di counter warung</p>
              </button>

              <button
                type="button"
                onClick={() => setDiningOption("dine_in")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  diningOption === "dine_in"
                    ? "border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UtensilsCrossed className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-navy">Makan di Tempat</span>
                </div>
                <p className="text-[11px] text-navy/60">Dine-in di area kantin kampus</p>
              </button>
            </div>
          </section>

          {/* Daftar Item Keranjang */}
          <section className="bg-white rounded-3xl p-5 border border-blue-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy">Rincian Menu</h3>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 active:scale-95 transition-all cursor-pointer"
              >
                Kosongkan Keranjang
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const addOnsPrice = (item.addOns || []).reduce(
                  (sum, a) => sum + (a.hargaTambahan || 0),
                  0
                );
                const itemTotalPrice = (item.hargaSatuan + addOnsPrice) * item.jumlah;

                return (
                  <article key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm md:text-base text-navy">
                          {item.menu?.nama || `Menu #${item.menuId}`}
                        </h4>
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          {formatRupiah(item.hargaSatuan + addOnsPrice)} / porsi
                        </p>

                        {/* Rincian Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.addOns.map((add, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-navy/70 px-2 py-0.5 rounded-md"
                              >
                                {add.nama}
                                {add.hargaTambahan > 0
                                  ? ` (+${formatRupiah(add.hargaTambahan)})`
                                  : ""}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Catatan */}
                        {item.catatan && (
                          <p className="text-xs text-navy/50 italic mt-1 bg-surface p-1.5 rounded-lg">
                            &quot;{item.catatan}&quot;
                          </p>
                        )}
                      </div>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Hapus ${item.menu?.nama || "menu"} dari keranjang`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <QtyStepper
                        value={item.jumlah}
                        onChange={(newVal) => updateQty(item.id, newVal)}
                        min={0}
                        max={50}
                        size="sm"
                      />
                      <span className="font-bold text-sm md:text-base text-navy">
                        {formatRupiah(itemTotalPrice)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Voucher & Pembayaran (Span 5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pilihan & Kupon Voucher */}
          <section className="bg-white rounded-3xl p-5 border border-blue-100 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-navy">Voucher Diskon</h3>
            </div>

            {selectedVoucher ? (
              <div className="bg-lime/20 border border-lime/60 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-navy/70">
                    Voucher Digunakan
                  </span>
                  <p className="text-xs md:text-sm font-black text-navy">
                    {selectedVoucher.judul} ({selectedVoucher.kode})
                  </p>
                  <p className="text-xs font-bold text-emerald-700">
                    Hemat {formatRupiah(discountAmount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    placeholder="Masukkan kode voucher"
                    className="flex-1 px-3.5 py-2 bg-surface border border-blue-100 rounded-full text-xs md:text-sm uppercase font-semibold text-navy placeholder:normal-case placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucherCode}
                    className="px-4 py-2 bg-primary hover:bg-blue-bright text-white text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer active:scale-95"
                  >
                    Gunakan
                  </button>
                </div>

                {voucherError && (
                  <p className="text-xs text-rose-600 font-medium">{voucherError}</p>
                )}

                {/* Rekomendasi voucher sekali klik */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {mockVoucherList.slice(0, 3).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        if (subtotal >= v.minimalBelanja) {
                          setSelectedVoucher(v);
                          setVoucherError("");
                        } else {
                          setVoucherError(`Minimal belanja Rp ${v.minimalBelanja.toLocaleString("id-ID")}`);
                        }
                      }}
                      className="px-2.5 py-1 bg-surface hover:bg-blue-100 border border-blue-200/60 rounded-full text-[11px] font-bold text-primary transition-all cursor-pointer"
                    >
                      {v.kode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Metode Pembayaran */}
          <section className="bg-white rounded-3xl p-5 border border-blue-100 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-navy">Metode Pembayaran</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === "qris"
                    ? "border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-navy">QRIS</p>
                    <p className="text-[11px] text-navy/60">BCA, GoPay, OVO, Dana, ShopeePay</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === "qris"
                      ? "border-primary bg-primary"
                      : "border-slate-300"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === "cash"
                    ? "border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-navy flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-navy">Tunai di Kasir</p>
                    <p className="text-[11px] text-navy/60">Bayar saat mengambil makanan</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === "cash"
                      ? "border-primary bg-primary"
                      : "border-slate-300"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Ringkasan Pembayaran */}
          <section className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-navy">Ringkasan Pembayaran</h3>

            <div className="space-y-2 text-xs md:text-sm text-navy/70">
              <div className="flex justify-between">
                <span>Subtotal ({totalItem} item)</span>
                <span className="font-semibold text-navy">{formatRupiah(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Voucher</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Biaya Layanan Aplikasi</span>
                <span className="font-semibold text-navy">
                  {serviceFee > 0 ? formatRupiah(serviceFee) : "Gratis"}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm md:text-base font-bold text-navy">Total Bayar</span>
                <span className="text-xl md:text-2xl font-black text-primary">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Tombol Lanjut Bayar */}
            <button
              type="button"
              onClick={handleProceedPayment}
              className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-blue-bright text-white font-bold text-sm md:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>{paymentMethod === "qris" ? "Bayar dengan QRIS" : "Konfirmasi Pesanan"}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
