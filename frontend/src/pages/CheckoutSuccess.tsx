import {
  Check,
  Clock,
  Home,
  Receipt,
  ShoppingBag,
  Store,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";

export default function CheckoutSuccess() {
  const location = useLocation();
  const { clearCart } = useCart();
  const orderState = location.state;

  // Generate atau gunakan orderId yang diteruskan
  const orderId = useMemo(() => {
    return orderState?.orderId || `KGO-${Math.floor(1000 + Math.random() * 9000)}`;
  }, [orderState?.orderId]);

  const warungNama = orderState?.warungNama || "Kantin Bu Siti";
  const pickupTime = orderState?.pickupTime || "Secepatnya (±10 mnt)";
  const total = orderState?.total || 18000;
  const voucher = orderState?.voucher || null;
  const items = orderState?.items || [];

  const hasSavedRef = useRef(false);

  // Bersihkan cart dan simpan ke localStorage pada mount
  useEffect(() => {
    // 1. Kosongkan keranjang belanja
    clearCart();

    // 2. Simpan order ke localStorage dengan status "diproses"
    if (!hasSavedRef.current) {
      hasSavedRef.current = true;
      try {
        const rawExisting = localStorage.getItem("kantingo_orders");
        const existingOrders = rawExisting ? JSON.parse(rawExisting) : [];
        const newOrder = {
          id: orderId,
          warungNama,
          pickupTime,
          total,
          voucher: voucher ? voucher.judul || voucher.kode : null,
          items: items.map((it: any) => ({
            id: it.id,
            nama: it.menu?.nama || `Menu #${it.menuId}`,
            jumlah: it.jumlah,
            hargaSatuan: it.hargaSatuan,
            catatan: it.catatan,
          })),
          status: "diproses", // Status awal "diproses"
          statusLabel: "Sedang Diproses Warung",
          createdAt: new Date().toISOString(),
        };

        if (!existingOrders.some((o: any) => o.id === orderId)) {
          const updatedOrders = [newOrder, ...existingOrders];
          localStorage.setItem("kantingo_orders", JSON.stringify(updatedOrders));
        }
      } catch {
        // Abaikan jika localStorage diblokir
      }
    }
  }, [clearCart, orderId, warungNama, pickupTime, total, voucher, items]);

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Desktop & Mobile Centered Card (max-w-xl) */}
      <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-10 text-center space-y-6 max-w-xl w-full shadow-soft animate-scaleUp">
        {/* Animasi Centang Sukses */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-50">
            <Check className="w-10 h-10 md:w-12 md:h-12 stroke-[3] animate-bounce" />
          </div>
        </div>

        {/* Teks Heading Pembayaran Berhasil */}
        <div className="space-y-1.5">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Transaksi Selesai
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-navy tracking-tight pt-1">
            Pembayaran Berhasil!
          </h1>
          <p className="text-xs md:text-sm text-navy/60 max-w-sm mx-auto">
            Pesananmu telah dikonfirmasi dan langsung diteruskan ke counter dapur warung.
          </p>
        </div>

        {/* Ringkasan Pesanan (Order Summary Card) */}
        <div className="bg-surface rounded-2xl p-5 text-left space-y-3.5 border border-blue-100 text-xs md:text-sm">
          {/* Kode Pesanan */}
          <div className="flex justify-between items-center pb-2.5 border-b border-blue-100/80">
            <span className="text-navy/60 font-medium">Nomor Pesanan</span>
            <span className="font-mono font-black text-sm md:text-base text-primary bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
              {orderId}
            </span>
          </div>

          {/* Warung */}
          <div className="flex justify-between items-center">
            <span className="text-navy/60 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-primary" />
              <span>Mitra Kantin</span>
            </span>
            <span className="font-bold text-navy">{warungNama}</span>
          </div>

          {/* Waktu Pengambilan */}
          <div className="flex justify-between items-center">
            <span className="text-navy/60 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>Waktu Pengambilan</span>
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {pickupTime}
            </span>
          </div>

          {/* Voucher yang dipakai */}
          <div className="flex justify-between items-center">
            <span className="text-navy/60 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              <span>Voucher Digunakan</span>
            </span>
            <span className="font-semibold text-navy">
              {voucher ? (
                <span className="text-primary font-bold">
                  {voucher.judul || voucher.kode}
                </span>
              ) : (
                <span className="text-navy/40">Tidak ada</span>
              )}
            </span>
          </div>

          {/* Rincian Menu Singkat */}
          {items.length > 0 && (
            <div className="pt-2 border-t border-blue-100/60 space-y-1">
              <span className="text-[11px] font-bold text-navy/60 uppercase tracking-wider block">
                Menu ({items.length})
              </span>
              <div className="space-y-0.5">
                {items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs text-navy/80"
                  >
                    <span className="truncate max-w-[240px]">
                      {it.jumlah}x {it.menu?.nama || `Menu #${it.menuId}`}
                    </span>
                    <span className="font-semibold text-navy">
                      {formatRupiah(it.hargaSatuan * it.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Pembayaran */}
          <div className="pt-2.5 border-t border-blue-100 flex justify-between items-baseline font-bold text-navy">
            <span className="text-sm md:text-base">Total Pembayaran</span>
            <span className="text-primary font-black text-lg md:text-xl">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Tombol Navigasi Aksi */}
        <div className="space-y-3 pt-2">
          {/* Tombol Utama: "Lihat Status Pesanan" -> /status */}
          <Link
            to="/status"
            className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright text-white text-sm md:text-base font-bold shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Receipt className="w-5 h-5 stroke-[2.5]" />
            <span>Lihat Status Pesanan</span>
          </Link>

          {/* Tombol Sekunder: "Kembali ke Home" -> / */}
          <Link
            to="/"
            className="w-full py-3.5 px-6 rounded-full border border-slate-200 hover:bg-slate-50 text-navy text-xs md:text-sm font-semibold active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
