import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Power,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { partnerApi } from "../../lib/api";
import { formatRupiah } from "../../lib/format";

export default function PartnerDashboard() {
  const [stats, setStats] = useState<{
    orders_today: number;
    revenue_today: number;
    pending_balance: number;
    available_balance: number;
  } | null>(null);
  const [warung, setWarung] = useState<{
    id: number;
    name: string;
    is_open: boolean;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const [warungRes, statsRes, ordersRes] = await Promise.all([
        partnerApi.getWarung(),
        partnerApi.getStats(),
        partnerApi.getOrders("diproses", 1),
      ]);
      setWarung(warungRes);
      setStats(statsRes);
      setRecentOrders((ordersRes.items || []).slice(0, 5));
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data dasbor mitra.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleToggleOpen = async () => {
    if (!warung || togglingOpen) return;
    setTogglingOpen(true);
    setError("");
    try {
      const updated = await partnerApi.toggleOpen(!warung.is_open);
      setWarung(updated);
    } catch (err: any) {
      setError(err?.message || "Gagal mengubah status buka/tutup warung.");
    } finally {
      setTogglingOpen(false);
    }
  };

  const handleMarkReady = async (orderId: number | string) => {
    setUpdatingOrderId(orderId);
    setError("");
    try {
      await partnerApi.updateOrderStatus(orderId, "siap");
      await loadDashboard();
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui status pesanan.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 space-y-6">
      {/* Header & Saklar Buka/Tutup Warung */}
      <div className="bg-gradient-to-r from-primary via-primary to-blue-bright text-white rounded-3xl p-5 md:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-lime block mb-1">
            Ringkasan Warung
          </span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">
            {warung?.name || "Dasbor Mitra"}
          </h1>
          <p className="text-xs text-white/80 mt-0.5">
            Pantau pesanan masuk dan status operasional warung Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleOpen}
          disabled={loading || togglingOpen || !warung}
          className={`inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 ${
            warung?.is_open
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-white/15 hover:bg-white/25 text-white border border-white/30"
          } disabled:opacity-60`}
        >
          {togglingOpen ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
          <span>{warung?.is_open ? "Warung Buka" : "Warung Tutup"}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center gap-1 font-bold underline cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat ulang
          </button>
        </div>
      )}

      {/* Kartu Statistik */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-xs animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-navy/60 font-medium">Pesanan Hari Ini</p>
              <p className="text-2xl font-black text-navy mt-0.5">
                {stats?.orders_today ?? 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-navy/60 font-medium">Pendapatan Hari Ini</p>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">
                {formatRupiah(stats?.revenue_today ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-navy/60 font-medium">Saldo Tersedia</p>
              <p className="text-2xl font-black text-navy mt-0.5">
                {formatRupiah(stats?.available_balance ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Pesanan Masuk Terbaru */}
      <section className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-slate-100 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-navy">Pesanan Masuk Terbaru</h2>
          </div>
          <Link
            to="/mitra/pesanan"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm font-semibold text-navy/70">
              Belum ada pesanan yang sedang diproses.
            </p>
            <p className="text-xs text-navy/50">
              Pesanan baru yang sudah dibayar akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-navy">{ord.order_code}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      Diproses
                    </span>
                    {ord.pickup_time && (
                      <span className="text-xs text-navy/60">
                        Ambil: <strong className="text-navy">{ord.pickup_time}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy/65">
                    {Array.isArray(ord.items)
                      ? ord.items.map((it: any) => `${it.quantity}x ${it.menu_name}`).join(", ")
                      : "-"}{" "}
                    • <strong className="text-navy">{formatRupiah(ord.total ?? 0)}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updatingOrderId === ord.id}
                  onClick={() => handleMarkReady(ord.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {updatingOrderId === ord.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Tandai siap diambil</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
