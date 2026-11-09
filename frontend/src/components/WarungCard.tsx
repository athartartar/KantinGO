import { Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Warung } from "../lib/mock/types";

interface WarungCardProps {
  warung: Warung | any;
  className?: string;
}

export default function WarungCard({ warung, className = "" }: WarungCardProps) {
  const warungNama = warung.nama || warung.name || "Kantin";
  const warungImage = warung.logo || warung.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80";
  const warungIsOpen = warung.isOpen ?? true;
  const warungEstimated = warung.estimatedMinutes ?? 10;
  const warungRating = warung.rating ?? 4.8;
  const warungReviews = warung.jumlahUlasan ?? warung.reviewCount ?? 0;
  const warungCategory =
    warung.categoryLabel ||
    (warung.kategori || warung.categories || []).join(" • ");
  const warungLocation = warung.location || "Kantin Kampus";

  return (
    <Link
      to={`/warung/${warung.id}`}
      className={`group bg-white rounded-3xl border border-blue-100 shadow-soft hover:shadow-card transition-all overflow-hidden flex flex-col cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
      aria-label={`Kantin ${warungNama}, ${warungIsOpen ? "Buka" : "Tutup"}, estimasi ${warungEstimated} menit, rating ${warungRating}`}
    >
      {/* Foto / Banner dengan status buka/tutup dan estimasi waktu */}
      <div className="relative w-full h-40 md:h-44 bg-slate-100 overflow-hidden shrink-0">
        <img
          src={warungImage}
          alt={warungNama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Status Buka / Tutup */}
        <div className="absolute top-3 left-3">
          {warungIsOpen ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Buka
            </span>
          ) : (
            <span className="inline-flex items-center bg-slate-800/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-xs">
              Tutup
            </span>
          )}
        </div>

        {/* Estimasi Waktu Siap */}
        <div className="absolute top-3 right-3 bg-white/95 text-navy text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs flex items-center gap-1">
          <Clock className="w-3 h-3 text-primary stroke-[2.5]" aria-hidden="true" />
          <span>{warungEstimated} mnt</span>
        </div>
      </div>

      {/* Info Warung */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="font-bold text-base md:text-lg text-navy line-clamp-1 group-hover:text-primary transition-colors leading-snug"
            title={warungNama}
          >
            {warungNama}
          </h3>
          <p
            className="text-xs text-navy/60 line-clamp-1 mt-1"
            title={warungCategory}
          >
            {warungCategory}
          </p>
        </div>

        {/* Rating & Lokasi */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-navy">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 stroke-amber-400" aria-hidden="true" />
            {warungRating}
            <span className="text-navy/40 font-normal">
              ({warungReviews})
            </span>
          </span>
          <span
            className="text-navy/60 truncate max-w-[150px] md:max-w-[170px]"
            title={warungLocation}
          >
            {warungLocation}
          </span>
        </div>
      </div>
    </Link>
  );
}
