import { useState } from "react";
import { Bell, CheckCheck, Package, Trash2, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../lib/notifications";
import { useOrders } from "../lib/orders";
import type { AppNotification } from "../lib/notifications";

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function NotifIcon({ jenis }: { jenis: AppNotification["jenis"] }) {
  if (jenis === "diproses") return <Clock className="w-5 h-5 text-amber-500" />;
  if (jenis === "siap") return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  return <Package className="w-5 h-5 text-primary" />;
}

function notifIconBg(jenis: AppNotification["jenis"]): string {
  if (jenis === "diproses") return "bg-amber-50";
  if (jenis === "siap") return "bg-emerald-50";
  return "bg-blue-50";
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const { getOrder } = useOrders();
  const [showConfirm, setShowConfirm] = useState(false);

  const todayNotifs = notifications.filter((n) => isToday(n.waktu));
  const olderNotifs = notifications.filter((n) => !isToday(n.waktu));

  function handleClickNotif(n: AppNotification) {
    markAsRead(n.id);
    const order = getOrder(n.orderId);
    if (n.jenis === "diterima" && order && !order.sudahDiulas) {
      navigate(`/review/${n.orderId}`);
    } else {
      navigate(`/status/${n.orderId}`);
    }
  }

  function handleClearAll() {
    clearAll();
    setShowConfirm(false);
  }

  const renderNotif = (n: AppNotification) => (
    <button
      key={n.id}
      onClick={() => handleClickNotif(n)}
      className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all hover:bg-surface/70 active:scale-[0.99] ${
        n.sudahDibaca ? "bg-white" : "bg-surface"
      }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notifIconBg(n.jenis)}`}
      >
        <NotifIcon jenis={n.jenis} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm text-navy leading-tight ${
              n.sudahDibaca ? "font-medium" : "font-semibold"
            }`}
          >
            {n.judul}
          </p>
          {!n.sudahDibaca && (
            <span className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-navy/70 mt-0.5 leading-relaxed line-clamp-2">
          {n.pesan}
        </p>
        <p className="text-[11px] text-navy/40 mt-1">{relativeTime(n.waktu)}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-primary text-white shadow-md">
        <div className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Kembali"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Notifikasi</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-navy font-semibold">Belum ada notifikasi</p>
            <p className="text-sm text-navy/60 mt-1">
              Notifikasi pesananmu akan muncul di sini
            </p>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2 px-1">
                  Hari ini
                </p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {todayNotifs.map(renderNotif)}
                </div>
              </div>
            )}
            {olderNotifs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2 px-1">
                  Sebelumnya
                </p>
                <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {olderNotifs.map(renderNotif)}
                </div>
              </div>
            )}
            {/* Hapus semua */}
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Semua Notifikasi
            </button>
          </>
        )}
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-bold text-navy mb-2">
              Hapus semua notifikasi?
            </h3>
            <p className="text-sm text-navy/70 mb-6">
              Semua notifikasi akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
