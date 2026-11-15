import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Plus, RefreshCw, Utensils } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMenus, getWarungs } from "../lib/api";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";
import type { Menu } from "../lib/mock/types";
import { mockPopularMenus } from "../lib/mock";

interface PopularMenuListProps {
  onAddToCart?: (menu: any, e?: React.MouseEvent) => void;
}

export default function PopularMenuList({ onAddToCart }: PopularMenuListProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const {
    data: menus = mockPopularMenus as any[],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      try {
        const raw = await getMenus();
        if (!raw || raw.length === 0) return mockPopularMenus;
        const warungs = await getWarungs();
        const canteenMap = new Map(
          warungs.map((w) => [String(w.id), w.name || w.nama || "Kantin Bu Siti"])
        );

        return raw.map((item) => {
          const warungIdStr = String(item.warungId || (item as any).canteenId || "1");
          const menuIdStr = String(item.id || (item as any).menuId);
          const warungName =
            canteenMap.get(warungIdStr) || (item as any).canteenName || "Kantin Bu Siti";

          return {
            ...item,
            id: menuIdStr,
            menuId: menuIdStr,
            warungId: warungIdStr,
            canteenId: Number(warungIdStr) || 1,
            canteenName: warungName,
            name: item.nama || item.name || "Menu",
            nama: item.nama || item.name || "Menu",
            price: item.harga ?? item.price ?? 0,
            harga: item.harga ?? item.price ?? 0,
            description: item.deskripsi || item.description || "",
            deskripsi: item.deskripsi || item.description || "",
            imageUrl:
              item.gambar ||
              item.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
            gambar:
              item.gambar ||
              item.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
            isAvailable: item.isAvailable ?? true,
            rating: item.rating ?? 4.8,
            soldCount: item.soldCount || 120,
            categoryId: item.categoryId || "heavy",
            addOnGroups: item.addOnGroups || [],
          };
        });
      } catch {
        return mockPopularMenus;
      }
    },
    initialData: mockPopularMenus as any[],
  });

  const handleCardClick = (menu: any) => {
    const warungId = String(menu.warungId || menu.canteenId || "1");
    const menuId = String(menu.menuId || menu.id);
    navigate(`/warung/${warungId}/menu/${menuId}`);
  };

  const handleAdd = (e: React.MouseEvent, menu: any) => {
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(menu, e);
      return;
    }

    const warungId = String(menu.warungId || menu.canteenId || "1");
    const menuId = String(menu.menuId || menu.id);

    // Cek apakah menu memiliki pilihan add-on wajib (required)
    const hasRequiredAddOn = Boolean(
      menu.addOnGroups &&
        Array.isArray(menu.addOnGroups) &&
        menu.addOnGroups.some(
          (group: any) =>
            Boolean(group.required) &&
            Array.isArray(group.opsi) &&
            group.opsi.length > 0
        )
    );

    // Jika menu punya add-on wajib: navigate ke /warung/:warungId/menu/:menuId agar user memilih add-on dulu
    if (hasRequiredAddOn) {
      navigate(`/warung/${warungId}/menu/${menuId}`);
      return;
    }

    // Jika menu TIDAK punya pilihan add-on wajib: langsung addItem ke cart (jumlah 1)
    const warungNama = menu.canteenName || "Kantin Bu Siti";
    const hargaSatuan = menu.harga ?? menu.price ?? 0;

    const fullMenu: Menu = {
      id: menuId,
      warungId,
      nama: menu.nama || menu.name || "Menu",
      name: menu.name || menu.nama || "Menu",
      harga: hargaSatuan,
      price: hargaSatuan,
      deskripsi: menu.deskripsi || menu.description || "",
      description: menu.description || menu.deskripsi || "",
      gambar: menu.gambar || menu.imageUrl || "",
      imageUrl: menu.imageUrl || menu.gambar || "",
      kategori: menu.kategori || menu.categoryId || "Makanan",
      addOnGroups: menu.addOnGroups || [],
      canteenName: warungNama,
      isAvailable: menu.isAvailable ?? true,
      rating: menu.rating ?? 4.8,
      soldCount: menu.soldCount || 120,
    };

    const added = addItem(
      {
        menuId,
        warungId,
        jumlah: 1,
        addOns: [],
        hargaSatuan,
        menu: fullMenu,
      },
      warungNama
    );

    if (added) {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setToastMessage("Ditambahkan ke keranjang");
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
        toastTimeoutRef.current = null;
      }, 2500);
    }
  };

  return (
    <section
      aria-labelledby="popular-menu-heading"
      className="bg-primary text-white rounded-3xl p-4 md:p-6 shadow-soft relative"
    >
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 animate-slideDown pointer-events-none"
        >
          <div className="bg-navy text-lime font-bold text-sm px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 border border-lime/30">
            <div className="w-5 h-5 rounded-full bg-lime text-navy flex items-center justify-center">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2
          id="popular-menu-heading"
          className="text-lg md:text-xl font-bold tracking-tight text-white"
        >
          Menu Populer
        </h2>
        <Link
          to="/warung"
          className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white hover:text-lime text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer backdrop-blur-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-lime"
          aria-label="Lihat semua menu populer"
        >
          <span>Lihat semua</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
        </Link>
      </div>

      {isLoading && (
        <div
          role="status"
          aria-label="Memuat menu populer"
          className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none snap-x md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:pt-0"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[145px] min-w-[145px] bg-white rounded-2xl p-3 shadow-xs animate-pulse space-y-2 md:w-full md:min-w-0"
            >
              <div className="w-full aspect-square bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                <div className="w-7 h-7 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
          <span className="sr-only">Memuat data menu...</span>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="bg-white/10 rounded-2xl p-6 text-center space-y-3 border border-white/20"
        >
          <p className="text-white/90 text-sm">Gagal memuat menu dari server</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-lime text-navy font-bold text-xs rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && menus.length === 0 && (
        <div className="bg-white/10 rounded-2xl p-8 text-center space-y-2 border border-white/10">
          <Utensils className="w-8 h-8 text-white/50 mx-auto" aria-hidden="true" />
          <p className="text-white/80 text-sm">Belum ada menu populer tersedia.</p>
        </div>
      )}

      {!isLoading && menus.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0 md:pt-0">
          {menus.map((menu: any, index: number) => (
            <article
              key={menu.id || menu.menuId || index}
              onClick={() => handleCardClick(menu)}
              className={`w-[145px] min-w-[145px] shrink-0 snap-start bg-white text-navy rounded-2xl p-3 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group md:w-full md:min-w-0 cursor-pointer ${
                index >= 4 ? "md:hidden" : ""
              }`}
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-slate-100 shrink-0">
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="font-bold text-sm text-navy line-clamp-1 leading-snug"
                    title={menu.name}
                  >
                    {menu.name}
                  </h3>
                  <p
                    className="text-[11px] text-navy/60 line-clamp-1 mt-0.5"
                    title={menu.canteenName}
                  >
                    {menu.canteenName}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-xs md:text-sm text-primary">
                    {formatRupiah(menu.price)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, menu)}
                    className="w-7 h-7 rounded-full bg-primary hover:bg-blue-bright active:scale-90 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label={`Tambah ${menu.name} ke keranjang seharga ${formatRupiah(menu.price)}`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
