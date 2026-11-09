import React from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { formatRupiah } from "../lib/format";
import type { Menu } from "../lib/mock/types";

export interface MenuCardProps {
  menu: Menu;
  onAdd?: (menu: Menu, e: React.MouseEvent) => void;
  to?: string;
  className?: string;
  showAddButton?: boolean;
}

export default function MenuCard({
  menu,
  onAdd,
  to,
  className = "",
  showAddButton = true,
}: MenuCardProps) {
  const menuTitle = menu.nama || menu.name || "Menu Kantin";
  const menuDesc = menu.deskripsi || menu.description || "";
  const menuPrice = menu.harga ?? menu.price ?? 0;
  const menuImage =
    menu.gambar ||
    menu.imageUrl ||
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80";

  const targetLink = to || `/warung/${menu.warungId || "1"}/menu/${menu.id}`;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAdd) {
      onAdd(menu, e);
    }
  };

  return (
    <article
      className={`group relative bg-white border border-blue-100 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-soft hover:shadow-card hover:border-primary/30 transition-all flex items-center gap-3.5 md:gap-4 overflow-hidden ${className}`}
    >
      <Link
        to={targetLink}
        className="absolute inset-0 z-0 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl md:rounded-3xl"
        aria-label={`Lihat detail ${menuTitle}`}
      />

      {/* Gambar Thumbnail Menu Persegi */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img
          src={menuImage}
          alt={menuTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Konten Keterangan Menu */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <h3
            className="font-bold text-sm md:text-base text-navy line-clamp-1 group-hover:text-primary transition-colors leading-snug"
            title={menuTitle}
          >
            {menuTitle}
          </h3>
          {menuDesc && (
            <p
              className="text-xs text-navy/60 line-clamp-2 mt-1 leading-relaxed"
              title={menuDesc}
            >
              {menuDesc}
            </p>
          )}
        </div>

        {/* Harga & Tombol Aksi */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/80">
          <span className="font-extrabold text-sm md:text-base text-primary">
            {formatRupiah(menuPrice)}
          </span>

          {showAddButton && (
            <button
              type="button"
              onClick={handleAddClick}
              className="relative z-10 w-8 h-8 rounded-full bg-primary hover:bg-blue-bright active:scale-90 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              aria-label={`Tambah ${menuTitle} ke keranjang`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
