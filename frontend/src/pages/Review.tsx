import {
  AlertCircle,
  CheckCircle2,
  Send,
  Store,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StarRating from "../components/StarRating";
import { useOrders } from "../lib/orders";
import { getWarungById } from "../lib/mock/warung";

export default function Review() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrder, submitReview } = useOrders();

  const [rating, setRating] = useState<number>(0);
  const [komentar, setKomentar] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const order = useMemo(() => {
    return orderId ? getOrder(orderId) : undefined;
  }, [orderId, getOrder]);

  const warung = useMemo(() => {
    return order ? getWarungById(order.warungId) : undefined;
  }, [order]);

  // Validasi: Jika order sudah diulas atau status belum "selesai", redirect ke /status
  useEffect(() => {
    if (!order) return;

    if (order.status !== "selesai" || order.sudahDiulas) {
      navigate("/status", { replace: true, state: { defaultTab: "selesai" } });
    }
  }, [order, navigate]);

  // Order tidak ditemukan
  if (!order) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 md:px-6 py-8 md:py-16 space-y-6">
        <PageHeader title="Beri Ulasan" backTo="/status" />
        <div className="bg-white border border-blue-100 rounded-3xl p-8 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="text-lg font-bold text-navy">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-navy/60">
            Pesanan tidak tersedia untuk diberi ulasan.
          </p>
          <div className="pt-2">
            <Link
              to="/status"
              className="inline-flex items-center justify-center py-2.5 px-6 rounded-full bg-primary text-white text-xs font-bold"
            >
              Kembali ke Status Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ringkasan item
  const itemSummary =
    order.items && order.items.length > 0
      ? order.items.map((it) => `${it.nama} x${it.jumlah}`).join(", ")
      : "Pesanan Makanan";

  const warungLogo =
    warung?.logo ||
    warung?.imageUrl ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80";

  // Handler kirim ulasan
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);
    submitReview(order.id, rating, komentar.trim());

    setToastMessage("Terima kasih atas ulasanmu!");

    setTimeout(() => {
      navigate("/status", {
        replace: true,
        state: { defaultTab: "selesai" },
      });
    }, 1200);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 animate-fadeIn pb-12">
      {/* Header dengan tombol back / close */}
      <PageHeader
        title="Beri Ulasan"
        backTo="/status"
        rightAction={
          <button
            type="button"
            onClick={() => navigate("/status", { state: { defaultTab: "selesai" } })}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 active:scale-90 border border-slate-200/80 text-navy flex items-center justify-center transition-all shadow-xs cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        }
      />

      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs md:text-sm px-4 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg animate-scaleUp">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* FORM ULASAN UTAMA (Mengikuti Wireframe Ulasan)      */}
      {/* ==================================================== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Kartu Warung & Ringkasan Pesanan */}
        <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-soft flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-blue-100 shadow-xs">
            <img
              src={warungLogo}
              alt={order.warungNama}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-primary">
              <Store className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Mitra Kantin
              </span>
            </div>
            <h2 className="text-base font-bold text-navy truncate">
              {order.warungNama}
            </h2>
            <div className="flex items-center gap-2 text-xs text-navy/60 font-mono">
              <span className="bg-surface px-2 py-0.5 rounded-md border border-blue-100 font-bold text-primary">
                {order.kodePesanan || order.id}
              </span>
              <span className="truncate text-navy/50">{itemSummary}</span>
            </div>
          </div>
        </div>

        {/* 2. Rating 5 Bintang Interaktif */}
        <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-soft text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/60 block">
            Bagaimana Rasa & Pelayanannya?
          </span>

          <StarRating
            rating={rating}
            onRatingChange={(newVal) => setRating(newVal)}
            size="lg"
            showLabel={true}
          />
        </div>

        {/* 3. Textarea Ulasan Opsional */}
        <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-soft space-y-2">
          <label
            htmlFor="komentar-ulasan"
            className="text-xs font-bold uppercase tracking-wider text-navy/60 block"
          >
            Ulasan Tertulis (Opsional)
          </label>

          <div className="relative">
            <textarea
              id="komentar-ulasan"
              rows={4}
              maxLength={300}
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder="Ceritakan pengalamanmu... Contoh: Ayamnya renyah, bumbu meresap, dan Bu Siti sangat ramah!"
              className="w-full p-4 rounded-2xl bg-surface border border-blue-100 text-xs sm:text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white resize-none transition-all"
            />

            {/* Counter Karakter Maks 300 */}
            <div className="text-right text-[11px] font-medium text-navy/50 pt-1">
              <span>{komentar.length}</span>
              <span>/300</span>
            </div>
          </div>
        </div>

        {/* 4. Tombol "Kirim Ulasan" Pill Full-Width */}
        <div>
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 disabled:shadow-none active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>{isSubmitting ? "Mengirim..." : "Kirim Ulasan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
