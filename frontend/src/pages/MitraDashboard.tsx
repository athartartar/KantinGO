import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, LogOut, Store, CheckCircle2, XCircle } from "lucide-react";
import { authApi, partnerApi } from "../lib/api";
import { getAuthUser, type AuthUser } from "../lib/auth";
import { formatRupiah } from "../lib/format";

export default function MitraDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [stats, setStats] = useState<{
    orders_today: number;
    revenue_today: number;
    pending_balance: number;
    available_balance: number;
  } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await authApi.me();
      setUser(me);
      if (me.warung?.status === "approved") {
        const [st, ord] = await Promise.all([partnerApi.getStats(), partnerApi.getOrders()]);
        setStats(st);
        setOrders(ord.items || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/login", { replace: true });
  };

  const handleReady = async (orderId: number) => {
    try {
      await partnerApi.updateOrderStatus(orderId, "siap");
      await loadData();
    } catch {}
  };

  const warungStatus = user?.warung?.status || "pending";

  if (!loading && warungStatus !== "approved") {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            {warungStatus === "rejected" ? (
              <XCircle className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8" />
            )}
          </div>
          <h1 className="text-xl font-bold text-navy">
            {warungStatus === "rejected" ? "Pengajuan Mitra Ditolak" : "Menunggu Persetujuan Admin"}
          </h1>
          <p className="text-sm text-navy/70">
            {warungStatus === "rejected"
              ? user?.warung?.rejection_reason || "Pengajuan warung Anda ditolak oleh admin."
              : `Warung "${user?.warung?.name || "Anda"}" sedang ditinjau oleh admin. Anda dapat mengakses dasbor setelah disetujui.`}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-rose-600 hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy">{user?.warung?.name || "Dasbor Mitra"}</h1>
              <p className="text-xs text-navy/60">Panel Pengelola Warung KantinGO</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-xs">
              <p className="text-xs text-navy/60">Pesanan Hari Ini</p>
              <p className="text-xl font-black text-navy mt-1">{stats.orders_today}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xs">
              <p className="text-xs text-navy/60">Pendapatan Hari Ini</p>
              <p className="text-xl font-black text-primary mt-1">{formatRupiah(stats.revenue_today)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xs">
              <p className="text-xs text-navy/60">Saldo Tertahan</p>
              <p className="text-xl font-black text-amber-600 mt-1">{formatRupiah(stats.pending_balance)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xs">
              <p className="text-xs text-navy/60">Saldo Tersedia</p>
              <p className="text-xl font-black text-emerald-600 mt-1">{formatRupiah(stats.available_balance)}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-navy">Pesanan Masuk</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-navy/60">Belum ada pesanan masuk.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-navy">{ord.order_code}</p>
                    <p className="text-xs text-navy/60">
                      Status: <span className="font-semibold">{ord.status}</span> • {formatRupiah(ord.total)}
                    </p>
                  </div>
                  {ord.status === "diproses" && (
                    <button
                      type="button"
                      onClick={() => handleReady(ord.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tandai Siap</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
