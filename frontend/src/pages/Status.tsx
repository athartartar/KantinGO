import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Package,
  Receipt,
  Sparkles,
  Star,
  Store,
  Utensils,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useOrders } from "../lib/orders";
import type { Order, OrderStatus } from "../lib/mock/types";
import { formatRupiah } from "../lib/format";

type TabKey = "siap" | "diproses" | "selesai";

interface TabConfig {
  key: TabKey;
  label: string;
  status: OrderStatus;
}

const TABS: TabConfig[] = [
  { key: "siap", label: "Sudah Siap", status: "siap" },
  { key: "diproses", label: "Diproses", status: "diproses" },
  { key: "selesai", label: "Selesai", status: "selesai" },
];

export default function Status() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders, advanceOrderDemo } = useOrders();

  // Toast pesan notifikasi demo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab aktif
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    // 1. Cek location.state?.defaultTab
    const stateTab = location.state?.defaultTab as TabKey | undefined;
    if (stateTab && (stateTab === "siap" || stateTab === "diproses" || stateTab === "selesai")) {
      return stateTab;
    }
    // Cek query parameter ?tab=
    const params = new URLSearchParams(location.search);
    const paramTab = params.get("tab") as TabKey | null;
    if (paramTab && (paramTab === "siap" || paramTab === "diproses" || paramTab === "selesai")) {
      return paramTab;
    }
    // 2. Default tab: "Sudah Siap" jika ada, jika tidak "Diproses"
    const hasSiap = orders.some((o) => o.status === "siap");
    return hasSiap ? "siap" : "diproses";
  });

  // Jika location state atau query param berubah
  useEffect(() => {
    const stateTab = location.state?.defaultTab as TabKey | undefined;
    if (stateTab && (stateTab === "siap" || stateTab === "diproses" || stateTab === "selesai")) {
      setActiveTab(stateTab);
      return;
    }
    const params = new URLSearchParams(location.search);
    const paramTab = params.get("tab") as TabKey | null;
    if (paramTab && (paramTab === "siap" || paramTab === "diproses" || paramTab === "selesai")) {
      setActiveTab(paramTab);
    }
  }, [location.state, location.search]);

  // Hitung jumlah order per status untuk badge di pill
  const counts = useMemo(() => {
    return {
      siap: orders.filter((o) => o.status === "siap").length,
      diproses: orders.filter((o) => o.status === "diproses").length,
      selesai: orders.filter((o) => o.status === "selesai").length,
    };
  }, [orders]);

  // Filter pesanan sesuai tab aktif
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  // Handler demo untuk memajukan order "diproses" -> "siap"
  const handleDemoAdvance = () => {
    const advancedId = advanceOrderDemo();
    if (advancedId) {
      setToastMessage(`Pesanan #${advancedId} berhasil dimajukan ke 'Sudah Siap'!`);
      setActiveTab("siap");
    } else {
      setToastMessage("Tidak ada pesanan yang sedang diproses untuk dimajukan.");
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper ringkasan menu item (misal "Ayam Geprek x2, +1 lainnya")
  const renderItemSummary = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return "Pesanan Makanan";
    }
    const first = order.items[0];
    const firstText = `${first.nama} x${first.jumlah}`;
    if (order.items.length > 1) {
      const remainingCount = order.items.length - 1;
      return `${firstText}, +${remainingCount} lainnya`;
    }
    return firstText;
  };

  return (
    <div className="w-full pb-20 md:pb-12">
      {/* 1. Header Biru Sesuai Gaya Halaman Lain */}
      <header className="relative w-full bg-gradient-to-r from-primary via-primary to-blue-bright text-white rounded-b-[2rem] md:rounded-b-none shadow-md">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-6 md:pt-8 md:pb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-lime uppercase tracking-wider block">
              Aktivitas Pesanan
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Status Pesanan
            </h1>
          </div>

          {/* Tombol DEMO Mini di Header */}
          <button
            type="button"
            onClick={handleDemoAdvance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime hover:bg-yellow-300 text-navy text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer border border-lime/40"
            title="Simulasikan kemajuan pesanan dari diproses ke siap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEMO: Siapkan</span>
            {counts.diproses > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy text-lime text-[10px] flex items-center justify-center font-bold">
                {counts.diproses}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Toast Alert Demo */}
      {toastMessage && (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-4">
          <div className="bg-navy text-white text-xs md:text-sm px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-fadeIn border border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 2. Konten Utama */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-5 md:pt-8 space-y-6">
        {/* 3 Pill Kategori: "Sudah Siap", "Diproses", "Selesai" */}
        <section aria-label="Kategori Status Pesanan">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-surface p-1.5 rounded-2xl border border-blue-100 max-w-xl mx-auto md:mx-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = counts[tab.key];

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white text-navy/70 hover:bg-slate-100 hover:text-navy border border-slate-200/60"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="truncate">{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] sm:text-xs font-black min-w-4 h-4 sm:min-w-5 sm:h-5 px-1 rounded-full flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-white text-primary"
                          : "bg-blue-100 text-primary"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. List Kartu Order / Empty State */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 animate-fadeIn">
            {filteredOrders.map((order) => {
              return (
                <article
                  key={order.id}
                  onClick={() => navigate(`/status/${order.id}`)}
                  className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-soft hover:shadow-card hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  {/* Bagian Atas Kartu: Kode & Badge Status */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-navy/50 uppercase font-bold tracking-wider block">
                          Kode Pesanan
                        </span>
                        <span className="font-mono font-black text-sm md:text-base text-navy">
                          {order.kodePesanan || order.id}
                        </span>
                      </div>
                    </div>

                    {/* Badge Status */}
                    {order.status === "siap" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Siap Diambil</span>
                      </span>
                    )}

                    {order.status === "diproses" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Sedang Diproses</span>
                      </span>
                    )}

                    {order.status === "selesai" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>

                  {/* Informasi Mitra Warung & Ringkasan Menu */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary shrink-0" />
                      <h2 className="font-bold text-sm md:text-base text-navy group-hover:text-primary transition-colors line-clamp-1">
                        {order.warungNama}
                      </h2>
                    </div>

                    <div className="flex items-start gap-2 text-xs md:text-sm text-navy/70">
                      <Utensils className="w-4 h-4 text-navy/40 shrink-0 mt-0.5" />
                      <p className="line-clamp-1 font-medium">
                        {renderItemSummary(order)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-navy/60">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        Pengambilan:{" "}
                        <strong className="font-semibold text-emerald-700">
                          {order.waktuPengambilan}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Bagian Bawah: Total Bayar + Aksi Tab Selesai */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-navy/50 block">
                        Total Pembayaran
                      </span>
                      <span className="font-black text-sm md:text-base text-primary">
                        {formatRupiah(order.total)}
                      </span>
                    </div>

                    {/* Khusus Tab Selesai: Tampilkan Rating atau Tombol Beri Ulasan */}
                    {order.status === "selesai" ? (
                      order.sudahDiulas ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{order.ulasan?.rating || 5}/5 Diulas</span>
                        </div>
                      ) : (
                        <Link
                          to={`/review/${order.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 rounded-full bg-primary hover:bg-blue-bright text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Beri Ulasan</span>
                        </Link>
                      )
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <span>Lihat Struk</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State Bersih Sesuai Kategori */
          <div className="bg-white border border-blue-100 rounded-3xl p-8 md:p-14 text-center space-y-4 max-w-md mx-auto shadow-soft animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto shadow-inner">
              <Package className="w-8 h-8 stroke-[1.75]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base md:text-lg font-bold text-navy">
                {activeTab === "siap" && "Belum Ada Pesanan yang Siap"}
                {activeTab === "diproses" && "Tidak Ada Pesanan Diproses"}
                {activeTab === "selesai" && "Belum Ada Riwayat Pesanan"}
              </h2>
              <p className="text-xs md:text-sm text-navy/60">
                {activeTab === "siap" &&
                  "Pesananmu yang sudah siap diambil di counter warung akan ditampilkan di sini."}
                {activeTab === "diproses" &&
                  "Pesanan baru yang sedang dimasak atau disiapkan warung akan muncul di tab ini."}
                {activeTab === "selesai" &&
                  "Semua transaksi pesanan yang telah selesai kamu ambil akan tersimpan di sini."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center justify-center py-2.5 px-6 rounded-full bg-primary hover:bg-blue-bright text-white text-xs font-bold shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
              >
                Pesan Makanan Sekarang
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
