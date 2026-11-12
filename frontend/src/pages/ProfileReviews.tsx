import { MessageSquare, Star, Store, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useOrders } from "../lib/orders";

export default function ProfileReviews() {
  const { orders } = useOrders();

  // Ambil semua pesanan yang sudah diulas
  const reviewedOrders = orders.filter(
    (order) => order.sudahDiulas && order.ulasan
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
      {/* Header Back ke /profile */}
      <PageHeader title="Ulasan Saya" backTo="/profile" />

      {reviewedOrders.length > 0 ? (
        <div className="space-y-4">
          {reviewedOrders.map((order) => {
            const ulasan = order.ulasan!;
            const itemSummary =
              order.items && order.items.length > 0
                ? order.items.map((it) => `${it.nama} x${it.jumlah}`).join(", ")
                : "Pesanan Menu";

            return (
              <article
                key={order.id}
                className="bg-white border border-blue-100 rounded-3xl p-5 shadow-soft space-y-3.5 hover:shadow-card transition-all"
              >
                {/* Header Kartu: Mitra Kantin & Rating */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Store className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Mitra Kantin
                      </span>
                    </div>
                    <Link
                      to={`/warung/${order.warungId}/profil`}
                      className="font-bold text-sm sm:text-base text-navy hover:text-primary transition-colors block"
                    >
                      {order.warungNama}
                    </Link>
                  </div>

                  {/* Bintang Rating */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-amber-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="text-xs font-black">{ulasan.rating} / 5</span>
                  </div>
                </div>

                {/* Komentar Ulasan */}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-navy/80 leading-relaxed">
                    {ulasan.komentar ? (
                      `"${ulasan.komentar}"`
                    ) : (
                      <span className="italic text-navy/50">
                        Tidak ada komentar tertulis.
                      </span>
                    )}
                  </p>
                </div>

                {/* Footer: Menu Pesanan & Tanggal */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-navy/50">
                  <span className="flex items-center gap-1 truncate max-w-[240px]">
                    <Utensils className="w-3 h-3 text-navy/40 shrink-0" />
                    <span className="truncate">{itemSummary}</span>
                  </span>
                  <span className="font-medium font-mono text-navy/60">
                    {order.kodePesanan || order.id}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-blue-100 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto shadow-inner">
            <MessageSquare className="w-8 h-8 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-navy">Belum Ada Ulasan</h2>
            <p className="text-xs sm:text-sm text-navy/60 max-w-sm mx-auto">
              Kamu belum memberikan ulasan makanan. Selesaikan pesananmu dan bagikan pengalaman kulinermu!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/status"
              state={{ defaultTab: "selesai" }}
              className="inline-flex py-3 px-6 rounded-full bg-primary hover:bg-blue-bright text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
            >
              Lihat Riwayat Pesanan
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
