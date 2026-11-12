import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  Store,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useOrders } from "../lib/orders";
import { formatRupiah } from "../lib/format";

export default function Receipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrder, completeOrder, advanceOrderDemo } = useOrders();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastDemo, setToastDemo] = useState<string | null>(null);

  const order = useMemo(() => {
    return orderId ? getOrder(orderId) : undefined;
  }, [orderId, getOrder]);

  // Handler konfirmasi pesanan sudah diambil
  const handleConfirmPickup = () => {
    if (!order) return;
    completeOrder(order.id);
    setShowConfirmModal(false);
    navigate(`/review/${order.id}`);
  };

  // Handler demo untuk memajukan pesanan ini secara langsung
  const handleDemoAdvanceOrder = () => {
    if (!order) return;
    advanceOrderDemo(order.id);
    setToastDemo("Demo: Status pesanan ini telah berubah menjadi 'Siap Diambil'!");
    setTimeout(() => setToastDemo(null), 3000);
  };

  // 1. Order Tidak Ditemukan (Empty State)
  if (!order) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-8 md:py-16 space-y-6">
        <PageHeader title="Struk Pick Up" backTo="/status" />

        <div className="bg-white border border-blue-100 rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold text-navy">
              Pesanan Tidak Ditemukan
            </h2>
            <p className="text-xs md:text-sm text-navy/60 max-w-xs mx-auto">
              Pesanan dengan kode "{orderId}" tidak terdaftar atau sudah dihapus dari riwayat perangkat ini.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/status"
              className="inline-flex items-center justify-center py-3 px-6 rounded-full bg-primary hover:bg-blue-bright text-white text-xs md:text-sm font-bold shadow-md shadow-primary/20 transition-all"
            >
              Kembali ke Status Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-32 md:pb-12 animate-fadeIn">
      {/* Header Back + Judul "Struk Pick Up" */}
      <PageHeader title="Struk Pick Up" backTo="/status" />

      {/* Toast Alert Demo (jika ada) */}
      {toastDemo && (
        <div className="bg-navy text-white text-xs px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-md border border-white/10 animate-scaleUp">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime shrink-0" />
            <span>{toastDemo}</span>
          </div>
          <button
            onClick={() => setToastDemo(null)}
            className="text-white/60 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* KARTU STRUK UTAMA (Mengikuti Wireframe Struk Pick Up) */}
      {/* ==================================================== */}
      <div className="bg-white border border-blue-100 rounded-3xl shadow-soft overflow-hidden transition-all">
        {/* Strip Judul di Atas: Nama Warung */}
        <div className="bg-gradient-to-r from-primary via-primary to-blue-bright text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-lime" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">
                Mitra Kantin
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {order.warungNama}
              </h2>
            </div>
          </div>

          {/* Status Badge Ringkas */}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
              order.status === "siap"
                ? "bg-lime text-navy"
                : order.status === "diproses"
                ? "bg-amber-100 text-amber-900"
                : "bg-blue-100 text-primary"
            }`}
          >
            {order.status === "siap" && "Siap Diambil"}
            {order.status === "diproses" && "Diproses"}
            {order.status === "selesai" && "Selesai"}
          </span>
        </div>

        {/* Badan Struk */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. Kode Pesanan Besar & Waktu Pengambilan */}
          <div className="bg-surface rounded-2xl p-4 text-center space-y-1.5 border border-blue-100/70">
            <span className="text-[11px] font-bold text-navy/50 uppercase tracking-widest block">
              Nomor Antrean / Kode Pesanan
            </span>
            <div className="font-mono font-black text-2xl sm:text-3xl text-primary tracking-tight">
              {order.kodePesanan || order.id}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-100 text-xs text-navy/70 mt-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>
                Pengambilan:{" "}
                <strong className="text-emerald-700 font-bold">
                  {order.waktuPengambilan}
                </strong>
              </span>
            </div>
          </div>

          {/* 2. Daftar Item Pesanan */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy/60">
              Daftar Menu ({order.items.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => {
                const addOnsPrice = (item.addOns || []).reduce(
                  (sum, a) => sum + (a.hargaTambahan || 0),
                  0
                );
                const itemTotal = (item.hargaSatuan + addOnsPrice) * item.jumlah;

                return (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm text-navy block truncate">
                          {item.nama}
                        </span>
                        {/* Add-ons list jika ada */}
                        {item.addOns && item.addOns.length > 0 && (
                          <p className="text-[11px] text-navy/60">
                            + {item.addOns.map((a) => a.nama).join(", ")}
                          </p>
                        )}
                        {/* Catatan jika ada */}
                        {item.catatan && (
                          <p className="text-[11px] italic text-navy/50">
                            Catatan: "{item.catatan}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-navy/60 block">
                          {item.jumlah}x {formatRupiah(item.hargaSatuan + addOnsPrice)}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-navy">
                          {formatRupiah(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Garis Putus-putus Ala Struk Belanja */}
          <div className="border-t-2 border-dashed border-slate-200 -mx-5 sm:-mx-6" />

          {/* 3. Rincian Biaya (Subtotal, Diskon, Layanan, Total) */}
          <div className="space-y-2 text-xs sm:text-sm text-navy/70">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-semibold text-navy">
                {formatRupiah(order.subtotal)}
              </span>
            </div>

            {order.diskon > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    Diskon Voucher{" "}
                    {order.voucher?.kode ? `(${order.voucher.kode})` : ""}
                  </span>
                </span>
                <span>-{formatRupiah(order.diskon)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Biaya Layanan</span>
              <span className="font-semibold text-navy">
                {formatRupiah(order.biayaLayanan)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-sm sm:text-base text-navy">
                Total Pembayaran
              </span>
              <span className="font-black text-lg sm:text-xl text-primary">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>

          {/* 4. Banner Status Detail */}
          <div
            className={`rounded-2xl p-3.5 text-xs flex items-center gap-3 border ${
              order.status === "siap"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : order.status === "diproses"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-primary"
            }`}
          >
            {order.status === "siap" && (
              <>
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">Pesanan Siap Diambil</span>
                  <span className="text-[11px] opacity-80">
                    Tunjukkan nomor antrean di atas kepada pelayan warung saat mengambil makanan.
                  </span>
                </div>
              </>
            )}

            {order.status === "diproses" && (
              <>
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <span className="font-bold block">Sedang Disiapkan Warung</span>
                  <span className="text-[11px] opacity-80">
                    Dapur sedang memasak pesananmu. Halaman ini akan otomatis terupdate saat makanan siap.
                  </span>
                </div>
              </>
            )}

            {order.status === "selesai" && (
              <>
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">Pesanan Telah Selesai</span>
                  <span className="text-[11px] opacity-80">
                    Terima kasih telah memesan melalui KantinGO. Selamat menikmati makananmu!
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TOMBOL AKSI UTAMA PILL FULL-WIDTH                    */}
      {/* Mobile: Sticky di bawah. Desktop (lg): Di bawah kartu */}
      {/* ==================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-200 z-40 md:static md:bg-transparent md:p-0 md:border-0 md:backdrop-blur-none space-y-2">
        {/* Kasus 1: Status "diproses" */}
        {order.status === "diproses" && (
          <div className="space-y-2">
            <button
              type="button"
              disabled
              className="w-full py-4 px-6 rounded-full bg-slate-200 text-slate-500 font-bold text-sm sm:text-base cursor-not-allowed flex items-center justify-center gap-2 select-none"
            >
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Menunggu Pesanan Siap</span>
            </button>
            <p className="text-center text-xs text-navy/60 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Kamu akan dikabari saat pesanan siap diambil</span>
            </p>

            {/* Tombol Demo Cepat untuk Evaluator */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleDemoAdvanceOrder}
                className="text-[11px] text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Simulasikan pesanan ini siap sekarang (Demo)</span>
              </button>
            </div>
          </div>
        )}

        {/* Kasus 2: Status "siap" */}
        {order.status === "siap" && (
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Pesanan Sudah Selesai</span>
          </button>
        )}

        {/* Kasus 3: Status "selesai" */}
        {order.status === "selesai" && (
          <div>
            {!order.sudahDiulas ? (
              <Link
                to={`/review/${order.id}`}
                className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-5 h-5 fill-lime text-lime" />
                <span>Beri Ulasan Pesanan Ini</span>
              </Link>
            ) : (
              <div className="bg-surface border border-blue-100 rounded-2xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (order.ulasan?.rating || 5)
                          ? "fill-amber-400 text-amber-500"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-navy">
                  Terima kasih atas ulasanmu!
                </p>
                {order.ulasan?.komentar && (
                  <p className="text-[11px] text-navy/60 italic">
                    "{order.ulasan.komentar}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL DIALOG KONFIRMASI PENGAMBILAN PESANAN         */}
      {/* ==================================================== */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl animate-scaleUp text-center">
            {/* Ikon Pertanyaan Konfirmasi */}
            <div className="w-14 h-14 rounded-full bg-surface text-primary flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-navy">
                Konfirmasi Pengambilan
              </h3>
              <p className="text-xs sm:text-sm text-navy/70 leading-relaxed">
                Apakah pesanan sudah kamu ambil di kasir atau counter warung{" "}
                <strong className="text-navy">{order.warungNama}</strong>?
              </p>
            </div>

            {/* Tombol Aksi Dialog */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmPickup}
                className="w-full py-3.5 px-5 rounded-full bg-primary hover:bg-blue-bright text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 active:scale-98 transition-all cursor-pointer"
              >
                Ya, Sudah Diambil
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-navy text-xs sm:text-sm font-semibold active:scale-98 transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
