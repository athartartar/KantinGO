import { Clock, Package, Receipt, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { formatRupiah } from "../lib/format";

interface SavedOrder {
  id: string;
  warungNama: string;
  pickupTime: string;
  total: number;
  voucher?: string;
  items: { id: string; nama: string; jumlah: number; hargaSatuan: number }[];
  status: "diproses" | "siap" | "selesai";
  statusLabel?: string;
  createdAt: string;
}

export default function Status() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kantingo_orders");
      if (raw) {
        setOrders(JSON.parse(raw));
      }
    } catch {
      // Abaikan
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title="Status Pesanan" backTo="/" />

      {orders.length > 0 ? (
        <div className="space-y-4 animate-fadeIn">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-soft space-y-4"
            >
              {/* Header Kartu Pesanan */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-navy/50 font-medium">Nomor Pesanan</span>
                    <h3 className="font-mono font-bold text-sm md:text-base text-navy">
                      {order.id}
                    </h3>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Sedang Diproses Warung</span>
                </div>
              </div>

              {/* Info Warung & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm text-navy/70">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span>
                    Warung: <strong className="font-semibold text-navy">{order.warungNama}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    Pengambilan:{" "}
                    <strong className="font-semibold text-emerald-700">
                      {order.pickupTime}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Daftar Menu Pesanan */}
              {order.items && order.items.length > 0 && (
                <div className="bg-surface rounded-2xl p-3.5 space-y-1.5 text-xs text-navy/80">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>
                        {item.jumlah}x {item.nama}
                      </span>
                      <span className="font-semibold text-navy">
                        {formatRupiah(item.hargaSatuan * item.jumlah)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Bayar */}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                <span className="text-xs md:text-sm text-navy/60 font-medium">
                  Total Pembayaran
                </span>
                <span className="text-base md:text-lg font-black text-primary">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-soft max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-navy">
              Belum Ada Pesanan Aktif
            </h3>
            <p className="text-sm text-navy/60">
              Riwayat dan status pesanan makananmu akan ditampilkan di halaman ini.
            </p>
          </div>
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-bright text-white text-sm font-semibold rounded-full shadow-sm transition-all active:scale-95"
            >
              <span>Pesan Sekarang</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
