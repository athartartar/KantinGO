import { CheckCircle2, Copy, QrCode, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";

export default function PaymentQris() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, subtotal } = useCart();

  const totalAmount = location.state?.total || subtotal || 18000;
  const warungNama = location.state?.warungNama || "Kantin Kampus";

  // Countdown timer 15 menit
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const handleFinishPayment = () => {
    clearCart();
    navigate("/checkout/success", {
      state: {
        total: totalAmount,
        warungNama,
        orderId: `KGO-${Math.floor(1000 + Math.random() * 9000)}`,
        paymentMethod: "QRIS",
      },
    });
  };

  const handleCopyNMID = () => {
    navigator.clipboard?.writeText("ID1020304050607");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6">
      <PageHeader title="Pembayaran QRIS" backTo="/checkout" />

      <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-soft text-center space-y-6">
        {/* Info Total Bayar & Countdown */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <p className="text-xs uppercase font-bold text-navy/60 tracking-wider">
            Total Pembayaran
          </p>
          <p className="text-2xl md:text-3xl font-black text-primary">
            {formatRupiah(totalAmount)}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mt-1">
            <span>Selesaikan dalam</span>
            <span className="tabular-nums font-mono">{formattedTime}</span>
          </div>
        </div>

        {/* Gambar QRIS & Mock Code */}
        <div className="space-y-3">
          <div className="w-56 h-56 md:w-64 md:h-64 mx-auto bg-white p-3 rounded-3xl border-2 border-slate-200 shadow-inner flex flex-col items-center justify-center relative">
            {/* Logo QRIS Header */}
            <div className="text-[10px] font-black tracking-widest text-navy uppercase mb-1">
              QRIS • Standar Pembayaran Nasional
            </div>
            {/* Mock QR Code Pattern */}
            <div className="w-full flex-1 bg-slate-900 rounded-2xl flex items-center justify-center p-4">
              <QrCode className="w-full h-full text-white" strokeWidth={1.5} />
            </div>
            <div className="text-[10px] text-navy/60 font-semibold mt-1 truncate max-w-full">
              KantinGO - {warungNama}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-navy/60">
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

        {/* Petunjuk Pembayaran */}
        <div className="bg-surface rounded-2xl p-4 text-left space-y-2 text-xs md:text-sm text-navy/80">
          <div className="flex items-center gap-2 font-bold text-navy">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cara Melakukan Pembayaran:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs text-navy/70 pl-1 leading-relaxed">
            <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
            <li>Pilih menu <strong>Pindai / Scan QRIS</strong>.</li>
            <li>Arahkan kamera ponselmu ke kode QR di atas.</li>
            <li>Pastikan nama merchant adalah <strong>KantinGO</strong> dan nominal sesuai.</li>
            <li>Masukkan PIN transaksi dan selesaikan pembayaran.</li>
          </ol>
        </div>

        {/* Tombol Konfirmasi Pembayaran */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleFinishPayment}
            className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-blue-bright active:scale-98 text-white font-bold text-sm md:text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Saya Sudah Bayar</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="text-xs font-semibold text-navy/60 hover:text-navy cursor-pointer"
          >
            Batal / Ubah Metode Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
