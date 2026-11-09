import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { mockWarung } from "../lib/mock";
import WarungCard from "./WarungCard";

export default function WarungList() {
  // Ambil hingga 3 warung untuk kebutuhan tampilan Homepage
  const displayWarungs = mockWarung.slice(0, 3);

  return (
    <section className="space-y-3.5">
      {/* Header: Judul "Warung Kantin" di kiri & tombol "Selengkapnya" di kanan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-navy">
            Warung Kantin
          </h2>
          <p className="text-xs md:text-sm text-navy/60 hidden sm:block">
            Pesan langsung dari mitra kantin kampus terpercaya
          </p>
        </div>
        <Link
          to="/warung"
          className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:text-blue-bright active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-full px-2 py-0.5"
          aria-label="Lihat selengkapnya daftar warung kantin"
        >
          <span>Selengkapnya</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>

      {/* Grid Warung: Mobile 1 kartu/baris (tampilkan 2), Desktop grid (tampilkan 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {displayWarungs.map((warung, index) => (
          <WarungCard
            key={warung.id}
            warung={warung}
            className={index === 2 ? "hidden md:flex" : "flex"}
          />
        ))}
      </div>
    </section>
  );
}
