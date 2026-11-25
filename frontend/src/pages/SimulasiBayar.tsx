import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, ShieldAlert, Store, XCircle } from "lucide-react";
import { paymentsApi } from "../lib/api";
import { formatRupiah } from "../lib/format";

export default function SimulasiBayar() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [detail, setDetail] = useState<{
    code: string;
    warung_name: string | null;
    amount: number;
    status: string;
    expired: boolean;
    expires_at: string | null;
  } | null>(null);
  const [resultState, setResultState] = useState<"idle" | "success" | "failed" | "expired">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    paymentsApi
      .getSimulation(code)
      .then((data) => {
        setDetail(data);
        if (data.status === "paid") {
          setResultState("success");
          setMessage("Pembayaran ini sudah berhasil dikonfirmasi.");
        } else if (data.expired || data.status === "expired") {
          setResultState("expired");
          setMessage("Pembayaran telah kedaluwarsa.");
        }
      })
      .catch((err: any) => {
        setResultState("failed");
        setMessage(err?.message || "Data pembayaran tidak ditemukan.");
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handlePay = async () => {
    if (!code || paying) return;
    setPaying(true);
    setMessage("");
    try {
      const res = await paymentsApi.paySimulation(code);
      setResultState("success");
      setMessage(res.message || "Pembayaran berhasil dikonfirmasi.");
      if (detail) {
        setDetail({ ...detail, status: "paid" });
      }
    } catch (err: any) {
      const errMsg = err?.message || "Pembayaran gagal diproses.";
      setMessage(errMsg);
      setResultState(errMsg.toLowerCase().includes("kedaluwarsa") ? "expired" : "failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-card border border-blue-100 p-6 max-w-sm w-full space-y-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulasi pembayaran</span>
          </span>
          <span className="text-[11px] font-semibold text-navy/50">KantinGO</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-navy/60">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs">Memuat detail tagihan...</p>
          </div>
        ) : !detail ? (
          <div className="py-8 text-center space-y-3">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-navy">Tagihan Tidak Ditemukan</p>
            <p className="text-xs text-navy/60">{message}</p>
          </div>
        ) : (
          <>
            <div className="bg-surface rounded-2xl p-4 border border-blue-100 space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/70">
                <Store className="w-4 h-4 text-primary" />
                <span>{detail.warung_name || "Warung KantinGO"}</span>
              </div>
              <p className="text-3xl font-black text-primary">{formatRupiah(detail.amount)}</p>
              <p className="text-[11px] text-navy/50 font-mono">
                {detail.code.slice(0, 16)}...
              </p>
            </div>

            {resultState === "success" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold">Pembayaran Berhasil</p>
                <p className="text-xs">{message}</p>
              </div>
            )}

            {resultState === "expired" && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-center space-y-1.5">
                <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-sm font-bold">Pembayaran Kedaluwarsa</p>
                <p className="text-xs">{message}</p>
              </div>
            )}

            {resultState === "failed" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-center space-y-1.5">
                <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <p className="text-sm font-bold">Pembayaran Gagal</p>
                <p className="text-xs">{message}</p>
              </div>
            )}

            {resultState === "idle" && (
              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="w-full py-3.5 px-5 rounded-full bg-primary hover:bg-blue-bright disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Bayar sekarang</span>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
