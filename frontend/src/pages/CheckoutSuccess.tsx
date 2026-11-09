import { Check, Clock, Home, Receipt, Store } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { formatRupiah } from "../lib/format";

export default function CheckoutSuccess() {
  const location = useLocation();

  const orderId = location.state?.orderId || `KGO-${Math.floor(1000 + Math.random() * 9000)}`;
  const warungNama = location.state?.warungNama || "Kantin Bu Siti";
  const total = location.state?.total || 18000;
  const paymentMethod = location.state?.paymentMethod || "QRIS";

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-6">
      <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-10 text-center space-y-6 max-w-md w-full shadow-soft animate-scaleUp">
        {/* Ikon Sukses Animasi Lingkaran */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-navy tracking-tight">
            Pesanan Berhasil!
          </h1>
          <p className="text-xs md:text-sm text-navy/60">
            Pesananmu telah diteruskan ke mitra kantin dan sedang dipersiapkan.
          </p>
        </div>

        {/* Kartu Detail Pesanan */}
        <div className="bg-surface rounded-2xl p-4 text-left space-y-3 text-xs md:text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-blue-100">
            <span className="text-navy/60">Nomor Pesanan</span>
            <span className="font-mono font-bold text-navy">{orderId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-navy/60 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>Warung</span>
            </span>
            <span className="font-bold text-navy">{warungNama}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-navy/60 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Estimasi Siap</span>
            </span>
            <span className="font-bold text-emerald-700">~10 - 15 Menit</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-blue-100 font-bold text-navy">
            <span>Total Pembayaran</span>
            <span className="text-primary font-black text-base">{formatRupiah(total)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-navy/50">
            <span>Metode Bayar</span>
            <span>{paymentMethod}</span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="space-y-2.5 pt-2">
          <Link
            to="/status"
            className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-blue-bright text-white text-sm md:text-base font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Receipt className="w-4 h-4 stroke-[2.5]" />
            <span>Lihat Status Pesanan</span>
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-6 rounded-full border border-slate-200 hover:bg-slate-50 text-navy text-xs md:text-sm font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
