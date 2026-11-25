import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Star, Store } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { reviewsApi } from "../lib/api";

export default function ProfileReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reviewsApi
      .myReviews()
      .then((list) => setReviews(list))
      .catch((err: any) => setError(err?.message || "Gagal memuat ulasan saya."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
      <PageHeader title="Ulasan Saya" backTo="/profile" />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-white border border-blue-100 rounded-3xl p-5 shadow-soft space-y-3.5 hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Store className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Mitra Kantin
                    </span>
                  </div>
                  <Link
                    to={`/warung/${rev.warung_id}/profil`}
                    className="font-bold text-sm sm:text-base text-navy hover:text-primary transition-colors block"
                  >
                    {rev.warung?.name || "Warung KantinGO"}
                  </Link>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="text-xs font-black">{rev.rating} / 5</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-navy/80 leading-relaxed">
                  {rev.comment ? (
                    `"${rev.comment}"`
                  ) : (
                    <span className="italic text-navy/50">
                      Tidak ada komentar tertulis.
                    </span>
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-blue-100 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto shadow-inner">
            <MessageSquare className="w-8 h-8 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-navy">Belum Ada Ulasan</h2>
            <p className="text-xs text-navy/60">
              Ulasan yang Anda berikan setelah pesanan selesai akan tampil di sini.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
