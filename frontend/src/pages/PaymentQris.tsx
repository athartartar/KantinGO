import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { createOrder, paymentsApi } from "../lib/api";
import { isMockMode } from "../lib/auth";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";

export default function PaymentQris() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const orderState = location.state;
  useEffect(() => {
    if (!orderState || !orderState.total) {
      navigate("/checkout", { replace: true });
    }
  }, [orderState, navigate]);

  const [backendOrderId, setBackendOrderId] = useState<string | null>(
    orderState?.backendOrderId ? String(orderState.backendOrderId) : null
  );
  const [backendOrderCode, setBackendOrderCode] = useState<string | null>(
    orderState?.orderCode || null
  );
  const [qrPayload, setQrPayload] = useState<string>("");
  const [paymentCode, setPaymentCode] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(orderState?.total || 0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "pending" | "paid" | "expired">(
    isMockMode() ? "pending" : "loading"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const warungNama = orderState?.warungNama || "Kantin Kampus";
  const pickupTime = orderState?.pickupTime || "Secepatnya (±10 mnt)";

  const initPayment = useCallback(async () => {
    if (!orderState || !orderState.total) return;
    if (isMockMode()) {
      setQrPayload(`https://kantingo.local/simulasi-bayar/MOCK-${Date.now()}`);
      setTimeLeft(600);
      setPaymentStatus("pending");
      return;
    }

    setErrorMsg("");
    setPaymentStatus("loading");
    try {
      let targetOrderId = backendOrderId;
      let targetOrderCode = backendOrderCode;

      if (!targetOrderId) {
        const createdOrder = await createOrder({
          warungId: String(orderState.warungId || ""),
          warungNama,
          items: orderState.items || [],
          waktuPengambilan: orderState.pickupTimeValue || orderState.pickupTime,
          voucher: orderState.voucher || null,
          subtotal: orderState.subtotal || 0,
          diskon: orderState.discountAmount || 0,
          biayaLayanan: orderState.serviceFee || 0,
          total: orderState.total,
          dibuatPada: new Date().toISOString(),
          status: "diproses",
          idempotencyKey: orderState.idempotencyKey,
        });
        targetOrderId = createdOrder.id;
        targetOrderCode = createdOrder.kodePesanan;
        setBackendOrderId(targetOrderId);
        setBackendOrderCode(targetOrderCode);
      }

      const payment = await paymentsApi.createPayment(targetOrderId);
      setQrPayload(payment.qr_payload);
      setPaymentCode(payment.code);
      setTotalAmount(payment.amount);
      setExpiresAt(payment.expires_at);
      setPaymentStatus(payment.status === "paid" ? "paid" : payment.status === "expired" ? "expired" : "pending");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal membuat pembayaran QRIS.");
      setPaymentStatus("expired");
    }
  }, [orderState, backendOrderId, backendOrderCode, warungNama]);

  useEffect(() => {
    initPayment();
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0 && paymentStatus === "pending") {
        setPaymentStatus("expired");
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, paymentStatus]);

  useEffect(() => {
    if (isMockMode() || !backendOrderId || paymentStatus !== "pending") return;

    const poller = setInterval(async () => {
      try {
        const statusData = await paymentsApi.getPaymentStatus(backendOrderId);
        if (statusData.status === "paid") {
          setPaymentStatus("paid");
          clearCart();
          navigate("/checkout/success", {
            replace: true,
            state: {
              ...orderState,
              orderId: backendOrderCode || backendOrderId,
              backendOrderId,
              total: statusData.amount,
              paymentMethod: "QRIS",
              paidAt: statusData.paid_at || new Date().toISOString(),
            },
          });
        } else if (statusData.status === "expired") {
          setPaymentStatus("expired");
        }
      } catch {}
    }, 3000);

    return () => clearInterval(poller);
  }, [backendOrderId, backendOrderCode, paymentStatus, navigate, orderState, clearCart]);

  const isExpired = paymentStatus === "expired" || (expiresAt !== null && timeLeft <= 0);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleResetQR = async () => {
    if (isMockMode()) {
      setTimeLeft(600);
      setPaymentStatus("pending");
      return;
    }
    if (!backendOrderId) {
      await initPayment();
      return;
    }
    setPaymentStatus("loading");
    try {
      const payment = await paymentsApi.createPayment(backendOrderId);
      setQrPayload(payment.qr_payload);
      setPaymentCode(payment.code);
      setTotalAmount(payment.amount);
      setExpiresAt(payment.expires_at);
      setPaymentStatus("pending");
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal membuat QR baru.");
      setPaymentStatus("expired");
    }
  };

  const handleCopyNMID = () => {
    navigator.clipboard?.writeText(paymentCode || "ID1020304050607");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    if (isExpired || isSimulating) return;

    if (isMockMode()) {
      setIsSimulating(true);
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
      return;
    }

    if (!paymentCode) return;
    setIsSimulating(true);
    try {
      await paymentsApi.paySimulation(paymentCode);
      clearCart();
      navigate("/checkout/success", {
        replace: true,
        state: {
          ...orderState,
          orderId: backendOrderCode || backendOrderId,
          backendOrderId,
          total: totalAmount,
          paymentMethod: "QRIS",
          paidAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mensimulasikan pembayaran.");
    } finally {
      setIsSimulating(false);
    }
  };

  if (!orderState || !orderState.total) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title="Pembayaran QRIS" backTo="/checkout" />

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-blue-100 rounded-3xl p-5 md:p-8 shadow-soft">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-md">
              <div className="border-b border-slate-100 pb-2 mb-2">
                <p className="text-[11px] font-black tracking-widest text-navy uppercase">
                  QRIS • Pembayaran Nasional
                </p>
                <p className="text-[10px] text-navy/60 font-semibold truncate">
                  KantinGO • {warungNama}
                </p>
              </div>

              <div className="relative w-full aspect-square bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100">
                {paymentStatus === "loading" ? (
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : isExpired ? (
                  <div className="absolute inset-0 bg-navy/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-white text-center space-y-3 animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Pembayaran Kedaluwarsa</p>
                      <p className="text-[11px] text-white/70 mt-0.5">
                        Batas waktu pembayaran telah habis.
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
                  <QRCodeSVG value={qrPayload || "https://kantingo.id"} size={210} className="w-full h-full" />
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 px-1 text-[11px] text-navy/60">
                <span className="truncate max-w-[160px]">
                  {paymentCode ? `Kode: ${paymentCode.slice(0, 12)}...` : "NMID: ID1020304050607"}
                </span>
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

            {qrPayload && !isExpired && (
              <a
                href={qrPayload}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Buka Halaman Simulasi Pembayaran</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="bg-surface rounded-2xl p-5 border border-blue-100 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Menunggu pembayaran</span>
                </div>

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

            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs text-navy/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-navy text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Petunjuk Pembayaran:</span>
              </div>
              <p className="text-navy/60 leading-relaxed text-[11px]">
                Pindai QR atau buka halaman simulasi pembayaran. Status pembayaran akan diperbarui otomatis setiap 3 detik.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 leading-snug">
                  <strong>Mode Demo Simulator:</strong> Gunakan tombol di bawah atau halaman simulasi untuk menguji alur pembayaran berhasil.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isExpired || isSimulating || paymentStatus === "loading"}
                className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright disabled:bg-slate-300 text-white font-bold text-sm md:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memverifikasi Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Simulasikan Pembayaran Berhasil</span>
                  </>
                )}
              </button>

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
