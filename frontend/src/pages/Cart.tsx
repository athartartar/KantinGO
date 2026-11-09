import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import QtyStepper from "../components/QtyStepper";
import { useCart } from "../lib/cart";
import { formatRupiah } from "../lib/format";

export default function Cart() {
  const navigate = useNavigate();
  const { items, warungNama, updateQty, removeItem, totalItem, subtotal, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        <PageHeader title="Keranjang Belanja" backTo="/" />

        <div className="bg-white border border-blue-100 rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-soft max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 stroke-[2]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-navy">Keranjangmu Kosong</h2>
            <p className="text-sm text-navy/60">
              Belum ada pesanan yang ditambahkan. Silakan pilih menu di warung kantin.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/warung"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-bright text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition-all"
            >
              <span>Mulai Belanja</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6">
      <PageHeader title="Keranjang Belanja" backTo="/" />

      <div className="bg-white rounded-3xl p-5 md:p-6 border border-blue-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs text-navy/60 uppercase font-semibold tracking-wider">
              Warung Kantin
            </span>
            <h2 className="text-lg font-bold text-navy">{warungNama || "Kantin Mitra"}</h2>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Hapus Semua
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const addOnsTotal = (item.addOns || []).reduce(
              (sum, a) => sum + (a.hargaTambahan || 0),
              0
            );
            const itemPrice = (item.hargaSatuan + addOnsTotal) * item.jumlah;

            return (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm md:text-base text-navy">
                      {item.menu?.nama || `Menu #${item.menuId}`}
                    </h3>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {formatRupiah(item.hargaSatuan + addOnsTotal)} / porsi
                    </p>

                    {item.addOns && item.addOns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.addOns.map((add, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-navy/70 px-2 py-0.5 rounded-md"
                          >
                            {add.nama}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label={`Hapus ${item.menu?.nama || "menu"} dari keranjang`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <QtyStepper
                    value={item.jumlah}
                    onChange={(newVal) => updateQty(item.id, newVal)}
                    min={0}
                    max={50}
                    size="sm"
                  />
                  <span className="font-bold text-sm md:text-base text-navy">
                    {formatRupiah(itemPrice)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Subtotal & Tombol Checkout */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-navy/60">Total {totalItem} menu</p>
            <p className="text-xl font-black text-primary">{formatRupiah(subtotal)}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-blue-bright text-white text-sm md:text-base font-bold rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjut ke Checkout</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
