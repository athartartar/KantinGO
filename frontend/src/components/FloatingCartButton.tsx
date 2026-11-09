import { ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";

export interface FloatingCartButtonProps {
  className?: string;
  to?: string;
}

export default function FloatingCartButton({
  className = "",
  to = "/checkout",
}: FloatingCartButtonProps) {
  const { totalItem, subtotal, warungNama } = useCart();

  if (totalItem === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Keranjang Belanja Mengambang"
      className={`fixed z-40 bottom-20 md:bottom-8 right-4 md:right-8 transition-transform duration-300 animate-slideUp ${className}`}
    >
      <Link
        to={to}
        className="flex items-center gap-3 bg-primary hover:bg-blue-bright text-white px-4 md:px-5 py-3 md:py-3.5 rounded-full shadow-2xl border-2 border-white/20 active:scale-95 transition-all group cursor-pointer focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-lime"
        aria-label={`Keranjang belanja berisi ${totalItem} item senilai ${formatRupiah(
          subtotal
        )}. Lanjut ke checkout.`}
      >
        {/* Ikon Tas Belanja dengan Badge Jumlah */}
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-lime text-navy flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </div>
          <span
            className="absolute -top-1 -right-1 bg-navy text-lime text-[11px] font-black h-5 min-w-5 px-1 rounded-full flex items-center justify-center ring-2 ring-primary shadow-xs"
            aria-hidden="true"
          >
            {totalItem > 99 ? "99+" : totalItem}
          </span>
        </div>

        {/* Ringkasan & Total Harga */}
        <div className="text-left hidden sm:block">
          <p className="text-[11px] text-white/80 line-clamp-1 leading-tight font-medium">
            {warungNama ? `${warungNama} • ` : ""}
            {totalItem} menu
          </p>
          <p className="text-sm font-extrabold text-lime leading-tight">
            {formatRupiah(subtotal)}
          </p>
        </div>

        {/* Tombol Lanjut Arrow */}
        <div className="flex items-center gap-1 pl-1 font-bold text-xs md:text-sm">
          <span>Checkout</span>
          <ArrowRight
            className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </Link>
    </aside>
  );
}
