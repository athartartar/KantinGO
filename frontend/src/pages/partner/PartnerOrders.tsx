import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { partnerApi } from "../../lib/api";
import { formatRupiah } from "../../lib/format";

type OrderTab = "diproses" | "siap" | "selesai";

const TABS: Array<{ key: OrderTab; label: string }> = [
  { key: "diproses", label: "Diproses" },
  { key: "siap", label: "Siap Diambil" },
  { key: "selesai", label: "Selesai" },
];

export default function PartnerOrders() {
  const [activeTab, setActiveTab] = useState<OrderTab>("diproses");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError("");
      try {
        const res = await partnerApi.getOrders(activeTab, 1);
        setOrders(res.items || []);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat daftar pesanan.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Auto refresh tiap 15 detik
  useEffect(() => {
    const timer = setInterval(() => {
      fetchOrders(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchOrders]);

  const handleMarkReady = async (orderId: number | string) => {
    setUpdatingId(orderId);
    setError("");
    try {
      await partnerApi.updateOrderStatus(orderId, "siap");
      await fetchOrders(true);
    } catch (err: any) {
      setError(err?.message || "Gagal memperbarui status pesanan.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight">
            Kelola Pesanan
          </h1>
          <p className="text-xs text-navy/60">
            Daftar otomatis diperbarui setiap 15 detik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-navy hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Tab Status */}
      <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl shadow-xs border border-slate-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-xs"
                : "text-navy/65 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-xs border border-slate-100 space-y-2">
          <p className="text-sm font-bold text-navy">
            Tidak ada pesanan dengan status "{TABS.find((t) => t.key === activeTab)?.label}"
          </p>
          <p className="text-xs text-navy/55">
            Pesanan akan muncul di tab ini sesuai progresnya.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((ord) => (
            <article
              key={ord.id}
              className="bg-white rounded-2xl p-4 md:p-5 shadow-xs border border-slate-100 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-sm font-black text-navy">{ord.order_code}</p>
                  <p className="text-xs text-navy/60 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Jam ambil: {ord.pickup_time || "-"}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      ord.status === "diproses"
                        ? "bg-amber-50 text-amber-700"
                        : ord.status === "siap"
                        ? "bg-blue-50 text-primary"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {ord.status === "diproses"
                      ? "Diproses"
                      : ord.status === "siap"
                      ? "Siap Diambil"
                      : "Selesai"}
                  </span>
                  <p className="text-sm font-black text-navy mt-1">
                    {formatRupiah(ord.total ?? 0)}
                  </p>
                </div>
              </div>

              {/* Daftar Item & Catatan */}
              <ul className="space-y-2">
                {Array.isArray(ord.items) &&
                  ord.items.map((it: any) => (
                    <li
                      key={it.id}
                      className="text-xs bg-slate-50 rounded-xl p-2.5 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-navy">
                          {it.quantity}x {it.menu_name}
                        </p>
                        {Array.isArray(it.addons_snapshot) && it.addons_snapshot.length > 0 && (
                          <p className="text-[11px] text-navy/60">
                            Add-on:{" "}
                            {it.addons_snapshot.map((a: any) => a.option_name).join(", ")}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-[11px] text-amber-700 font-medium">
                            Catatan: "{it.notes}"
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-navy shrink-0">
                        {formatRupiah(it.subtotal ?? it.unit_price * it.quantity)}
                      </span>
                    </li>
                  ))}
              </ul>

              {ord.status === "diproses" && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={updatingId === ord.id}
                    onClick={() => handleMarkReady(ord.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    {updatingId === ord.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Tandai siap diambil</span>
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
