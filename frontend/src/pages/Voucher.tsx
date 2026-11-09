import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PopularMenuList from "../components/PopularMenuList";
import { useVoucher } from "../context/VoucherContext";
import { mockUser } from "../lib/mock";

interface FormStatus {
  type: "success" | "error";
  message: string;
}

export default function Voucher() {
  const { voucherCount, redeemVoucher } = useVoucher();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sumber data poin user (sama dengan pill poin di Homepage)
  const currentPoints = mockUser.points;
  const targetPoints = 1500;
  const pointsRemaining = Math.max(0, targetPoints - currentPoints);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentPoints / targetPoints) * 100))
  );

  // Animasi progress bar saat tampil
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(progressPercent);
    }, 150);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  const handleRedeem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await redeemVoucher(cleanCode);
      if (result.success) {
        setStatus({ type: "success", message: result.message });
        setCode("");
      } else {
        setStatus({ type: "error", message: result.message });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Terjadi kesalahan sistem saat menukarkan voucher.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedCurrent = new Intl.NumberFormat("id-ID").format(currentPoints);
  const formattedTarget = new Intl.NumberFormat("id-ID").format(targetPoints);
  const formattedRemaining = new Intl.NumberFormat("id-ID").format(pointsRemaining);

  return (
    <div className="w-full">
      {/* 1. Header blok biru sudut bawah membulat, judul "Voucher" di kiri bawah */}
      <header className="relative w-full bg-gradient-to-r from-primary via-primary to-blue-bright text-white rounded-b-[2rem] md:rounded-b-none shadow-md">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-6 md:pt-8 md:pb-8 flex items-end">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Voucher
          </h1>
        </div>
      </header>

      {/* 2. Konten Halaman Voucher */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-5 md:pt-8 space-y-7 md:space-y-10">
        {/* Desktop: Grid 2 kolom kartu Voucher Saya & kartu Poin Kamu dengan tinggi sejajar; Mobile: 1 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Kolom 1: Kartu "Voucher Saya" */}
          <div className="space-y-3 flex flex-col">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-navy">
              Voucher Saya
            </h2>
            <section
              aria-labelledby="voucher-saya-heading"
              className="bg-white rounded-3xl border border-blue-100 shadow-soft p-5 md:p-6 transition-all hover:shadow-card flex-1 flex flex-col justify-between"
            >
              {/* Baris Atas: Link ke /voucher/saya */}
              <Link
                to="/voucher/saya"
                className="flex items-center justify-between gap-4 group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl p-1 transition-colors"
                aria-label={`Voucher kamu: ${voucherCount} voucher. Buka halaman Voucher Saya.`}
              >
                {/* Ikon lingkaran tiket di kiri */}
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Ticket className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
                </div>

                {/* Angka jumlah voucher besar dan tebal dengan label kecil "Voucher kamu" di tengah */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      id="voucher-saya-heading"
                      className="text-3xl md:text-4xl font-black text-navy tracking-tight"
                    >
                      {voucherCount}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-navy/70">
                      Voucher kamu
                    </span>
                  </div>
                </div>

                {/* Ikon panah (chevron) di kanan */}
                <div className="shrink-0 p-1">
                  <ChevronRight
                    className="w-5 h-5 text-navy/40 group-hover:text-primary group-hover:translate-x-1 transition-all"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              {/* Form Input Pill & Tombol Pill Tukar */}
              <form
                onSubmit={handleRedeem}
                className="mt-4 pt-4 border-t border-slate-100"
              >
                <label htmlFor="voucher-code-input" className="sr-only">
                  Masukkan kode voucher
                </label>

                <div className="relative flex items-center bg-slate-50 border border-slate-200/90 rounded-full focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5 pl-4">
                  <input
                    id="voucher-code-input"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (status) setStatus(null);
                    }}
                    placeholder="Masukkan kode voucher"
                    disabled={isSubmitting}
                    aria-describedby={
                      status ? "voucher-feedback-msg" : undefined
                    }
                    className="w-full bg-transparent text-sm text-navy placeholder:text-navy/40 focus:outline-hidden disabled:opacity-60 pr-2"
                  />

                  <button
                    type="submit"
                    disabled={!code.trim() || isSubmitting}
                    className="shrink-0 bg-primary hover:bg-blue-bright active:scale-95 disabled:opacity-40 disabled:hover:bg-primary disabled:active:scale-100 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center justify-center min-w-[72px] shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Tukar kode voucher"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2
                          className="w-3.5 h-3.5 animate-spin"
                          aria-hidden="true"
                        />
                        <span>Proses</span>
                      </span>
                    ) : (
                      <span>Tukar</span>
                    )}
                  </button>
                </div>

                {/* Pesan Sukses (Hijau) */}
                {status?.type === "success" && (
                  <div
                    id="voucher-feedback-msg"
                    role="status"
                    aria-live="polite"
                    className="mt-2.5 flex items-start gap-2 p-3 bg-emerald-50 text-emerald-900 border border-emerald-200/90 rounded-2xl text-xs font-medium"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-snug">{status.message}</span>
                  </div>
                )}

                {/* Pesan Gagal (Merah di bawah input) */}
                {status?.type === "error" && (
                  <div
                    id="voucher-feedback-msg"
                    role="alert"
                    aria-live="assertive"
                    className="mt-2.5 flex items-start gap-2 p-3 bg-rose-50 text-rose-900 border border-rose-200/90 rounded-2xl text-xs font-medium"
                  >
                    <AlertCircle
                      className="w-4 h-4 text-rose-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-snug">{status.message}</span>
                  </div>
                )}

                {/* Region aria-live persisten untuk screen reader — selalu ada di DOM */}
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                >
                  {status?.message ?? ""}
                </div>
              </form>
            </section>
          </div>

          {/* Kolom 2: Section "Poin Kamu" */}
          <div className="space-y-3 flex flex-col">
            {/* Judul section (navy tebal) di luar kartu */}
            <h2
              id="poin-kamu-heading"
              className="text-lg md:text-xl font-bold tracking-tight text-navy"
            >
              Poin Kamu
            </h2>

            {/* Kartu terang Poin Kamu */}
            <section
              aria-labelledby="poin-kamu-heading"
              className="bg-white rounded-3xl border border-blue-100 shadow-soft p-5 md:p-6 transition-all hover:shadow-card flex-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Baris Label Kiri dan Label Kanan Kecil */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl md:text-3xl font-black text-navy tracking-tight">
                      {formattedCurrent}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-navy/60">
                      / {formattedTarget} poin
                    </span>
                  </div>

                  <p className="text-xs font-medium text-navy/60 sm:text-right">
                    <span className="font-bold text-primary">
                      {formattedRemaining} poin
                    </span>{" "}
                    lagi untuk voucher Rp5.000
                  </p>
                </div>

                {/* Progress Bar Horizontal: Track terang/putih, isi biru primary membulat, animasi */}
                <div
                  role="progressbar"
                  aria-valuenow={currentPoints}
                  aria-valuemin={0}
                  aria-valuemax={targetPoints}
                  aria-label={`Progres pencapaian poin: ${currentPoints} dari ${targetPoints} poin`}
                  className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60"
                >
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${animatedWidth}%` }}
                  />
                </div>
              </div>

              {/* Catatan Info Poin */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-navy/50 flex items-center justify-between">
                <span>1 poin didapat tiap belanja Rp1.000</span>
                <span className="font-bold text-primary">
                  {progressPercent}% tercapai
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Section "Menu Populer": Judul section di luar kartu & pakai ulang PopularMenuList */}
        <section
          aria-labelledby="voucher-popular-heading"
          className="space-y-3"
        >
          <h2
            id="voucher-popular-heading"
            className="text-lg md:text-xl font-bold tracking-tight text-navy"
          >
            Menu Populer
          </h2>
          <PopularMenuList />
        </section>
      </div>
    </div>
  );
}
