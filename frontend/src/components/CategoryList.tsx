import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getCategories } from "../lib/api";

export interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  slug: string;
}

const ICON_TO_EMOJI: Record<string, string> = {
  utensils: "🍽️",
  coffee: "🥤",
  cookie: "🍟",
  sparkles: "🍱",
  nasi: "🍚",
  mie: "🍜",
  western: "🍔",
  camilan: "🍟",
  minuman: "🥤",
};

export default function CategoryList() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("kategori");

  const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const list = await getCategories();
      return list.map((c) => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        emoji: ICON_TO_EMOJI[c.icon || ""] || ICON_TO_EMOJI[c.slug] || "🍴",
      }));
    },
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-navy">
          Kategori
        </h2>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 md:grid md:grid-cols-4 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[86px] min-w-[86px] h-[86px] md:w-full md:h-28 rounded-2xl md:rounded-3xl bg-white border border-blue-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:pt-0">
          {categories.map((cat) => {
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
      )}
    </section>
  );
}
