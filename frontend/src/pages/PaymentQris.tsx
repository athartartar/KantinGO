import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { formatRupiah } from "../lib/format";

// Komponen SVG QR Code realistis bergaya QRIS Standar
function QrSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      {/* 3 Pojok Deteksi Pola QR (Position Markers) */}
      {/* Kiri Atas */}
      <rect x="6" y="6" width="28" height="28" rx="4" fill="#14163A" />
      <rect x="11" y="11" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="15" y="15" width="10" height="10" rx="1.5" fill="#1329C0" />

      {/* Kanan Atas */}
      <rect x="66" y="6" width="28" height="28" rx="4" fill="#14163A" />
      <rect x="71" y="11" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="75" y="15" width="10" height="10" rx="1.5" fill="#1329C0" />

      {/* Kiri Bawah */}
      <rect x="6" y="66" width="28" height="28" rx="4" fill="#14163A" />
      <rect x="11" y="71" width="18" height="18" rx="2" fill="#FFFFFF" />
      <rect x="15" y="75" width="10" height="10" rx="1.5" fill="#1329C0" />

      {/* Titik-titik Matriks Data */}
      <rect x="40" y="8" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="52" y="8" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="42" y="18" width="6" height="6" rx="1" fill="#1329C0" />
      <rect x="50" y="24" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="8" y="42" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="20" y="40" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="26" y="48" width="6" height="6" rx="1" fill="#1329C0" />
      <rect x="8" y="52" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="40" y="40" width="8" height="8" rx="2" fill="#1329C0" />
      <rect x="52" y="40" width="8" height="8" rx="2" fill="#14163A" />
      <rect x="40" y="52" width="8" height="8" rx="2" fill="#14163A" />
      <rect x="52" y="52" width="8" height="8" rx="2" fill="#1329C0" />
      <rect x="68" y="40" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="78" y="44" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="86" y="40" width="6" height="6" rx="1" fill="#1329C0" />
      <rect x="68" y="52" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="84" y="54" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="42" y="68" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="52" y="72" width="6" height="6" rx="1" fill="#1329C0" />
      <rect x="42" y="84" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="54" y="84" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="66" y="68" width="7" height="7" rx="1.5" fill="#14163A" />
      <rect x="76" y="70" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="86" y="68" width="6" height="6" rx="1" fill="#1329C0" />
      <rect x="70" y="82" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="80" y="80" width="6" height="6" rx="1" fill="#14163A" />
      <rect x="88" y="88" width="5" height="5" rx="1" fill="#1329C0" />
    </svg>
  );
}

export default function PaymentQris() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Redirect ke /checkout jika tidak ada order sementara
  const orderState = location.state;
  useEffect(() => {
    if (!orderState || !orderState.total) {
      navigate("/checkout", { replace: true });
    }
  }, [orderState, navigate]);

  const totalAmount = orderState?.total || 0;
  const warungNama = orderState?.warungNama || "Kantin Kampus";
  const pickupTime = orderState?.pickupTime || "Secepatnya (±10 mnt)";

  // Countdown timer 10 menit (600 detik)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const isExpired = timeLeft <= 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const handleResetQR = () => {
    setTimeLeft(600);
  };

  const handleCopyNMID = () => {
    navigator.clipboard?.writeText("ID1020304050607");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulasi Pembayaran Berhasil
  const handleSimulatePayment = () => {
    if (isExpired || isSimulating) return;

    setIsSimulating(true);

    // Loading singkat 1,5 detik lalu navigasi ke /checkout/success
    setTimeout(() => {
      const generatedOrderId = `KGO-${Math.floor(1000 + Math.random() * 9000)}`;
      navigate("/checkout/success", {
        state: {
          ...orderState,
          orderId: generatedOrderId,
          paymentMethod: "QRIS",
          paidAt: new Date().toISOString(),
        },
      });
    }, 1500);
  };

  if (!orderState || !orderState.total) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title="Pembayaran QRIS" backTo="/checkout" />

      {/* Konten Utama: Mobile 1 Kolom, Desktop (lg) 2 Kolom rapi */}
      <div className="bg-white border border-blue-100 rounded-3xl p-5 md:p-8 shadow-soft">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Kolom Kiri: Tampilan QR Code (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-md">
              {/* Header QRIS */}
              <div className="border-b border-slate-100 pb-2 mb-2">
                <p className="text-[11px] font-black tracking-widest text-navy uppercase">
                  QRIS • Pembayaran Nasional
                </p>
                <p className="text-[10px] text-navy/60 font-semibold truncate">
                  KantinGO • {warungNama}
                </p>
              </div>

              {/* Box SVG QR Code atau Overlay Kedaluwarsa */}
              <div className="relative w-full aspect-square bg-slate-50 rounded-2xl p-3 flex items-center justify-center border border-slate-100">
                {isExpired ? (
                  /* Tampilan State Pembayaran Kedaluwarsa */
                  <div className="absolute inset-0 bg-navy/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-white text-center space-y-3 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Pembayaran Kedaluwarsa</p>
                      <p className="text-[11px] text-white/70 mt-0.5">
                        Batas waktu 10:00 telah habis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetQR}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-lime text-navy text-xs font-bold rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Buat QR Baru</span>
                    </button>
                  </div>
                ) : (
                  <QrSvg />
                )}
              </div>

              {/* NMID & Salin */}
              <div className="flex items-center justify-between pt-2.5 px-1 text-[11px] text-navy/60">
                <span>NMID: ID1020304050607</span>
                <button
                  type="button"
                  onClick={handleCopyNMID}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Disalin!" : "Salin"}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-navy/50">
              Pindai QR di atas menggunakan aplikasi mobile banking atau e-wallet pilihanmu.
            </p>
          </div>

          {/* Kolom Kanan: Rincian Pembayaran & Aksi Simulasi (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Kartu Status & Info Total */}
            <div className="bg-surface rounded-2xl p-5 border border-blue-100 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Status: "Menunggu pembayaran" */}
                <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Menunggu pembayaran</span>
                </div>

                {/* Countdown 10:00 */}
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                    isExpired
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-white text-navy border border-blue-100 shadow-xs"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="tabular-nums font-mono text-sm">
                    {isExpired ? "00:00" : formattedCountdown}
                  </span>
                </div>
              </div>

              {/* Total Bayar & Warung */}
              <div className="space-y-1 pt-1">
                <span className="text-xs text-navy/60 uppercase font-bold tracking-wider">
                  Total yang Harus Dibayar
                </span>
                <p className="text-3xl font-black text-primary">
                  {formatRupiah(totalAmount)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy/70 pt-2 border-t border-blue-200/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <Store className="w-4 h-4 text-primary" />
                  <span>Warung: <strong className="font-semibold text-navy">{warungNama}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Pengambilan: <strong className="font-semibold text-navy">{pickupTime}</strong></span>
                </span>
              </div>
            </div>

            {/* Petunjuk Langkah Bayar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs text-navy/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-navy text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Petunjuk Pembayaran:</span>
              </div>
              <p className="text-navy/60 leading-relaxed text-[11px]">
                Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay), pilih Scan QRIS, lalu konfirmasi pembayaran.
              </p>
            </div>

            {/* Panel Simulasi Prototype & Tombol Batalkan */}
            <div className="space-y-3 pt-1">
              {/* Box Keterangan Demo */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 leading-snug">
                  <strong>Mode Demo Prototype:</strong> Gunakan tombol simulasi di bawah untuk menguji alur pembayaran berhasil tanpa transaksi uang sungguhan.
                </div>
              </div>

              {/* Tombol "Simulasikan Pembayaran Berhasil" */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isExpired || isSimulating}
                className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright disabled:bg-slate-300 text-white font-bold text-sm md:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memverifikasi Pembayaran (1,5 dtk)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Simulasikan Pembayaran Berhasil</span>
                  </>
                )}
              </button>

              {/* Tombol "Batalkan" */}
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isSimulating}
                className="w-full py-3 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-xs md:text-sm font-semibold text-rose-600 transition-colors cursor-pointer"
              >
                Batalkan Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Pembatalan */}
      {isCancelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-blue-100 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-navy">
                Batalkan Pembayaran?
              </h3>
              <p className="text-xs text-navy/70 leading-relaxed">
                Apakah kamu yakin ingin membatalkan transaksi ini? Kamu akan diarahkan kembali ke halaman Checkout.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 text-xs font-semibold text-navy hover:bg-slate-50 transition-all cursor-pointer"
              >
                Lanjut Bayar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  navigate("/checkout");
                }}
                className="flex-1 py-3 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
