import { useQuery } from "@tanstack/react-query";
import { Utensils } from "lucide-react";
import { api } from "../lib/api";

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const { data: menus, isLoading, isError, refetch } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const res = await api.api.menus.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch menus");
      }
      return res.json();
    },
    retry: 1,
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">
          Menu Pilihan
        </h2>
        <p className="text-sm text-neutral-500">
          Pesan makanan favoritmu dari kantin mitra
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-neutral-200 animate-pulse space-y-3"
            >
              <div className="w-full aspect-square bg-neutral-200 rounded-lg" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-4">
          <p className="text-neutral-600">Gagal memuat menu</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!isLoading && !isError && menus && menus.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Utensils className="w-6 h-6" />
          </div>
          <p className="text-neutral-600 font-medium">Belum ada menu tersedia</p>
          <p className="text-sm text-neutral-400">
            Silakan periksa kembali nanti.
          </p>
        </div>
      )}

      {!isLoading && !isError && menus && menus.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between hover:border-orange-300 transition-colors shadow-xs"
            >
              <div className="w-full aspect-square bg-orange-50 rounded-lg flex items-center justify-center mb-3 text-orange-600">
                <Utensils className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-neutral-900 line-clamp-1">
                  {menu.name}
                </h3>
                <p className="text-orange-600 font-bold text-sm">
                  {formatRupiah(menu.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
