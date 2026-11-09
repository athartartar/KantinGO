import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { mockWarung } from "../lib/mock";

export default function CanteenDetail() {
  const { id } = useParams<{ id: string }>();
  const warung = mockWarung.find((w) => w.id === Number(id));

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:px-6 lg:px-8 md:py-8 space-y-6">
      <Link
        to="/warung"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-bright transition-colors active:scale-95 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5] transition-transform group-hover:-translate-x-1" />
        <span>Kembali ke Daftar Warung</span>
      </Link>

      <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 shadow-soft space-y-4">
        {warung ? (
          <div className="space-y-4">
            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={warung.imageUrl}
                alt={warung.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                    warung.isOpen ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  {warung.isOpen ? "Buka Sekarang" : "Tutup"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-navy">
                {warung.name}
              </h1>
              <p className="text-sm text-navy/60">
                {warung.categoryLabel || warung.categories.join(" • ")}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-navy/70 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 font-bold text-navy">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 stroke-amber-400" />
                  {warung.rating} ({warung.reviewCount} ulasan)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  Estimasi {warung.estimatedMinutes} menit
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {warung.location}
                </span>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-4 text-center text-sm text-navy/70">
              Menu lengkap untuk warung ini akan segera hadir di tahap berikutnya.
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <h2 className="text-xl font-bold text-navy">Warung Tidak Ditemukan</h2>
            <p className="text-sm text-navy/60">
              Kantin dengan ID &quot;{id}&quot; tidak terdaftar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
