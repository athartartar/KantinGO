import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Tag,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useVoucher } from "../context/VoucherContext";
import type { VoucherItem } from "../lib/mock";
import { mockHistoryVouchers } from "../lib/mock";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function VoucherSaya() {
  const { userVouchers } = useVoucher();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const historyVouchers = mockHistoryVouchers;

  const currentList: VoucherItem[] =
    activeTab === "active" ? userVouchers : historyVouchers;

  return (
    <div className="w-full">
      {/* 1. Header biru dengan tombol kembali dan judul "Voucher Saya" */}
      <header className="relative w-full bg-gradient-to-r from-primary via-primary to-blue-bright text-white rounded-b-[2rem] md:rounded-b-none shadow-md">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-5 pb-6 md:pt-7 md:pb-8">
          <Link
            to="/voucher"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm text-white/85 hover:text-white font-semibold mb-2.5 transition-colors active:scale-95 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime rounded-md"
            aria-label="Kembali ke halaman Voucher"
          >
            <ArrowLeft
              className="w-4 h-4 stroke-[2.5] transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span>Kembali</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Voucher Saya
          </h1>
          <p className="text-xs md:text-sm text-white/80 mt-1">
            Kumpulan voucher promo siap pakai dan riwayat transaksi
          </p>
        </div>
      </header>

      {/* 2. Konten Halaman: Tab Switcher & Daftar Kartu Voucher */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-5 md:pt-8 space-y-6">
        {/* Tab Sederhana: Aktif / Riwayat */}
        <div className="flex justify-start">
          <div
            className="flex bg-slate-200/70 p-1 rounded-2xl w-full max-w-xs border border-slate-300/40"
            role="tablist"
            aria-label="Filter status voucher"
          >
            <button
              type="button"
              role="tab"
              id="tab-active"
              aria-selected={activeTab === "active"}
              aria-controls="tabpanel-voucher"
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === "active"
                  ? "bg-white text-navy shadow-xs"
                  : "text-navy/60 hover:text-navy"
              }`}
            >
              Aktif ({userVouchers.length})
            </button>
            <button
              type="button"
              role="tab"
              id="tab-history"
              aria-selected={activeTab === "history"}
              aria-controls="tabpanel-voucher"
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === "history"
                  ? "bg-white text-navy shadow-xs"
                  : "text-navy/60 hover:text-navy"
              }`}
            >
              Riwayat ({historyVouchers.length})
            </button>
          </div>
        </div>

        {/* 3. Daftar Kartu Voucher (Mobile: 1 kolom, Desktop: md:grid-cols-2) */}
        <div
          id="tabpanel-voucher"
          role="tabpanel"
          aria-labelledby={activeTab === "active" ? "tab-active" : "tab-history"}
        >
        {currentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentList.map((vouch) => {
              const status = vouch.status ?? "active";
              const isStatusActive = status === "active";
              const isStatusUsed = status === "used";

              return (
                <article
                  key={vouch.id}
                  className={`rounded-3xl border p-5 md:p-6 shadow-soft transition-all flex flex-col justify-between space-y-3 group ${
                    isStatusActive
                      ? "bg-white border-blue-100 hover:shadow-card hover:border-primary/30"
                      : "bg-slate-50/80 border-slate-200 opacity-80"
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Baris Kode & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider">
                        <Tag
                          className="w-3 h-3 stroke-[2.5]"
                          aria-hidden="true"
                        />
                        <span>{vouch.code}</span>
                      </span>

                      {/* Label status: Aktif pakai aksen lime, Terpakai dan Kedaluwarsa warna netral */}
                      {isStatusActive && (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-navy bg-lime px-3 py-1 rounded-full shadow-xs">
                          <CheckCircle2
                            className="w-3 h-3 stroke-[2.5]"
                            aria-hidden="true"
                          />
                          <span>Aktif</span>
                        </span>
                      )}

                      {isStatusUsed && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-200/80 px-3 py-1 rounded-full">
                          <CheckCircle2
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                          <span>Terpakai</span>
                        </span>
                      )}

                      {!isStatusActive && !isStatusUsed && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-200/80 px-3 py-1 rounded-full">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          <span>Kedaluwarsa</span>
                        </span>
                      )}
                    </div>

                    {/* Judul & Nilai Diskon */}
                    <div>
                      <h2 className="font-bold text-base text-navy line-clamp-1 group-hover:text-primary transition-colors">
                        {vouch.title}
                      </h2>
                      <p className="text-xl md:text-2xl font-black text-primary mt-1">
                        {formatRupiah(vouch.discount)}
                      </p>
                    </div>
                  </div>

                  {/* Syarat singkat & Tanggal berlaku */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-navy/65">
                    <span className="font-medium">
                      Min. belanja {formatRupiah(vouch.minSpend)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-normal text-navy/50">
                      <Calendar
                        className="w-3 h-3 text-navy/40"
                        aria-hidden="true"
                      />
                      <span>s.d. {vouch.validUntil}</span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            role="status"
            className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-soft max-w-md mx-auto my-6"
          >
            <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
              {activeTab === "active" ? (
                <Ticket className="w-8 h-8 stroke-[2]" aria-hidden="true" />
              ) : (
                <History className="w-8 h-8 stroke-[2]" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-navy">
                {activeTab === "active"
                  ? "Belum ada voucher aktif"
                  : "Belum ada riwayat voucher"}
              </h2>
              <p className="text-sm text-navy/60">
                {activeTab === "active"
                  ? "Tukarkan kode promo di halaman Voucher untuk mendapatkan potongan harga spesial."
                  : "Voucher yang telah kamu pakai atau kedaluwarsa akan tersimpan di sini."}
              </p>
            </div>
            {activeTab === "active" && (
              <div>
                <Link
                  to="/voucher"
                  className="inline-block px-5 py-2.5 bg-primary hover:bg-blue-bright text-white text-sm font-semibold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Tukar Kode Voucher
                </Link>
              </div>
            )}
          </div>
        )}
        </div>{/* end tabpanel */}
      </div>
    </div>
  );
}
