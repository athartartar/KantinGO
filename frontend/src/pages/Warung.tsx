import { Store, UtensilsCrossed } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import FloatingCartButton from "../components/FloatingCartButton";
import PageHeader from "../components/PageHeader";
import WarungCard from "../components/WarungCard";
import { CATEGORIES } from "../components/CategoryList";
import { mockWarungList } from "../lib/mock/warung";

export default function Warung() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("kategori");

  const categoryObj = categorySlug
    ? CATEGORIES.find(
        (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
      )
    : null;

  const categoryName = categoryObj ? categoryObj.name : categorySlug;

  // Filter warung berdasarkan kategori jika query kategori tersedia
  const filteredWarung = categorySlug
    ? mockWarungList.filter(
        (w) =>
          (w.categories &&
            w.categories.some(
              (c) => c.toLowerCase() === categorySlug.toLowerCase()
            )) ||
          (w.kategori &&
            w.kategori.some(
              (c) => c.toLowerCase() === categorySlug.toLowerCase()
            )) ||
          w.nama?.toLowerCase().includes(categorySlug.toLowerCase()) ||
          w.name?.toLowerCase().includes(categorySlug.toLowerCase()) ||
          (w.categoryLabel &&
            w.categoryLabel.toLowerCase().includes(categorySlug.toLowerCase()))
      )
    : mockWarungList;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader
        title={categorySlug ? `Warung: ${categoryName}` : "Daftar Warung Kantin"}
        subtitle="Pilih kantin mitra favoritmu dan pesan makanan lebih awal tanpa antre"
        backTo="/"
        rightAction={
          categorySlug ? (
            <Link
              to="/warung"
              className="text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              Reset Filter
            </Link>
          ) : undefined
        }
      />

      {/* Grid Warung: Mobile 1 kolom, md 2 kolom, lg 3 kolom */}
      {filteredWarung.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredWarung.map((warung) => (
            <WarungCard key={warung.id} warung={warung} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-blue-100 rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-soft max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-navy">
              Belum ada warung ditemukan
            </h3>
            <p className="text-sm text-navy/60">
              Tidak ada mitra kantin yang cocok dengan kategori &quot;{categoryName}&quot;.
            </p>
          </div>
          <div>
            <Link
              to="/warung"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-bright text-white text-sm font-semibold rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Lihat Semua Warung</span>
            </Link>
          </div>
        </div>
      )}

      <FloatingCartButton />
    </div>
  );
}
