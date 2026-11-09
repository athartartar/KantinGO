import { Link, useSearchParams } from "react-router-dom";

export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  slug: string;
}

export const CATEGORIES: readonly CategoryItem[] = [
  { id: "nasi", name: "Nasi", emoji: "🍚", slug: "nasi" },
  { id: "mie", name: "Mie", emoji: "🍜", slug: "mie" },
  { id: "western", name: "Western", emoji: "🍔", slug: "western" },
  { id: "camilan", name: "Camilan", emoji: "🍟", slug: "camilan" },
  { id: "minuman", name: "Minuman", emoji: "🥤", slug: "minuman" },
] as const;

export default function CategoryList() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("kategori");

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-navy">
          Kategori
        </h2>
      </div>

      {/* Kontainer Kategori: Scroll horizontal di mobile (tile ke-4 terpotong), Grid 5 kolom di desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0 md:pt-0">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.slug;

          return (
            <Link
              key={cat.id}
              to={`/warung?kategori=${cat.slug}`}
              className={`w-[86px] min-w-[86px] h-[86px] shrink-0 snap-start rounded-2xl flex flex-col items-center justify-center p-2 transition-all active:scale-95 active:bg-lime cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:w-full md:min-w-0 md:h-28 md:rounded-3xl md:p-4 group ${
                isActive
                  ? "bg-lime text-navy border-2 border-lime shadow-md ring-2 ring-lime/40"
                  : "bg-white text-navy border border-blue-100 hover:border-lime/70 hover:bg-lime/20 shadow-soft"
              }`}
              aria-label={`Kategori ${cat.name}`}
            >
              <span className="text-2xl md:text-3xl lg:text-4xl transition-transform group-hover:scale-110 select-none">
                {cat.emoji}
              </span>
              <span
                className={`text-[11px] md:text-sm mt-1 md:mt-2 text-center truncate w-full tracking-tight ${
                  isActive ? "font-bold text-navy" : "font-semibold text-navy/90"
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
