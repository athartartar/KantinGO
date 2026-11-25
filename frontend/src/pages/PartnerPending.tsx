import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Loader2,
  LogOut,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { authApi } from "../lib/api";
import { getAuthUser, type AuthUser } from "../lib/auth";
import { useCart } from "../lib/cart";
import { useOrders } from "../lib/orders";
import { useUser } from "../lib/user";
import { useVoucher } from "../context/VoucherContext";
import { useNotifications } from "../lib/notifications";

export default function PartnerPending() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const { clearCart } = useCart();
  const { clearOrders } = useOrders();
  const { logout } = useUser();
  const { clearVouchers } = useVoucher();
  const { clearAll: clearNotifications } = useNotifications();

  const warungStatus = user?.warung?.status || "pending";

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage("");
    try {
      const me = await authApi.me();
      setUser(me);
      if (me.warung?.status === "approved") {
        navigate("/mitra", { replace: true });
        return;
      }
      setStatusMessage("Status akun mitra telah diperbarui.");
    } catch {
      setStatusMessage("Gagal memeriksa status terbaru. Silakan coba lagi.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearCart();
    clearOrders();
    clearVouchers();
    clearNotifications();
    navigate("/login", { replace: true });
  };

  const isRejected = warungStatus === "rejected";
  const isSuspended = warungStatus === "suspended";

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-card p-6 md:p-10 max-w-md w-full text-center space-y-5">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            isRejected
              ? "bg-rose-100 text-rose-600"
              : isSuspended
              ? "bg-orange-100 text-orange-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          {isRejected ? (
            <XCircle className="w-8 h-8" />
          ) : isSuspended ? (
            <AlertTriangle className="w-8 h-8" />
          ) : (
            <Clock className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-navy">
            {isRejected
              ? "Pengajuan Mitra Ditolak"
              : isSuspended
              ? "Akun Warung Ditangguhkan"
              : "Menunggu Persetujuan Admin"}
          </h1>
          <p className="text-sm text-navy/70 leading-relaxed">
            {isRejected
              ? user?.warung?.rejection_reason ||
                "Pengajuan warung Anda belum dapat disetujui oleh admin."
              : isSuspended
              ? user?.warung?.rejection_reason ||
                "Warung Anda sedang ditangguhkan sementara oleh admin. Silakan hubungi pengelola kantin."
              : `Warung "${
                  user?.warung?.name || "Anda"
                }" sedang dalam proses peninjauan admin. Anda dapat mengakses dasbor mitra setelah disetujui.`}
          </p>
        </div>

        {statusMessage && (
          <p className="text-xs font-medium text-primary bg-blue-50 py-2 px-3 rounded-xl">
            {statusMessage}
          </p>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            {checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Cek Status Ulang</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
