import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { CartAddOn, CartItem, Menu } from "../mock/types";
import { AlertTriangle } from "lucide-react";

const STORAGE_KEY = "kantingo_cart_state_v1";

export interface CartState {
  items: CartItem[];
  warungId: string | null;
  warungNama: string | null;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: {
        item: {
          menuId: string;
          warungId: string;
          jumlah?: number;
          addOns?: CartAddOn[];
          catatan?: string;
          hargaSatuan: number;
          menu?: Menu;
        };
        warungNama?: string;
      };
    }
  | { type: "REPLACE_AND_ADD"; payload: { item: any; warungNama?: string } }
  | { type: "UPDATE_QTY"; payload: { itemId: string; qty: number } }
  | { type: "REMOVE_ITEM"; payload: { itemId: string } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_STATE"; payload: CartState };

function areAddOnsEqual(a: CartAddOn[] = [], b: CartAddOn[] = []): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.optionId.localeCompare(y.optionId));
  const sortedB = [...b].sort((x, y) => x.optionId.localeCompare(y.optionId));
  return sortedA.every((opt, idx) => opt.optionId === sortedB[idx].optionId);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;

    case "ADD_ITEM": {
      const { item, warungNama } = action.payload;
      const addOns = item.addOns || [];
      const jumlah = Math.max(1, item.jumlah ?? 1);
      const catatan = (item.catatan || "").trim();

      // Cari apakah item persis sama sudah ada di keranjang
      const existingIndex = state.items.findIndex(
        (i) =>
          i.menuId === item.menuId &&
          (i.catatan || "") === catatan &&
          areAddOnsEqual(i.addOns, addOns)
      );

      let newItems: CartItem[];
      if (existingIndex > -1) {
        newItems = state.items.map((it, idx) =>
          idx === existingIndex ? { ...it, jumlah: it.jumlah + jumlah } : it
        );
      } else {
        const uniqueId = `cart-${item.menuId}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const newItem: CartItem = {
          id: uniqueId,
          menuId: item.menuId,
          warungId: item.warungId,
          jumlah,
          addOns,
          catatan: catatan || undefined,
          hargaSatuan: item.hargaSatuan,
          menu: item.menu,
          warungNama: warungNama || state.warungNama || undefined,
          quantity: jumlah,
          notes: catatan || undefined,
        };
        newItems = [...state.items, newItem];
      }

      return {
        ...state,
        items: newItems,
        warungId: item.warungId,
        warungNama: warungNama || state.warungNama || null,
      };
    }

    case "REPLACE_AND_ADD": {
      const { item, warungNama } = action.payload;
      const addOns = item.addOns || [];
      const jumlah = Math.max(1, item.jumlah ?? 1);
      const catatan = (item.catatan || "").trim();
      const uniqueId = `cart-${item.menuId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      const newItem: CartItem = {
        id: uniqueId,
        menuId: item.menuId,
        warungId: item.warungId,
        jumlah,
        addOns,
        catatan: catatan || undefined,
        hargaSatuan: item.hargaSatuan,
        menu: item.menu,
        warungNama: warungNama || undefined,
        quantity: jumlah,
        notes: catatan || undefined,
      };

      return {
        items: [newItem],
        warungId: item.warungId,
        warungNama: warungNama || null,
      };
    }

    case "UPDATE_QTY": {
      const { itemId, qty } = action.payload;
      if (qty <= 0) {
        const remaining = state.items.filter((i) => i.id !== itemId);
        return {
          items: remaining,
          warungId: remaining.length === 0 ? null : state.warungId,
          warungNama: remaining.length === 0 ? null : state.warungNama,
        };
      }

      const updated = state.items.map((i) =>
        i.id === itemId ? { ...i, jumlah: qty, quantity: qty } : i
      );

      return {
        ...state,
        items: updated,
      };
    }

    case "REMOVE_ITEM": {
      const remaining = state.items.filter((i) => i.id !== action.payload.itemId);
      return {
        items: remaining,
        warungId: remaining.length === 0 ? null : state.warungId,
        warungNama: remaining.length === 0 ? null : state.warungNama,
      };
    }

    case "CLEAR_CART":
      return {
        items: [],
        warungId: null,
        warungNama: null,
      };

    default:
      return state;
  }
}

export interface AddItemInput {
  menuId: string;
  warungId: string;
  jumlah?: number;
  addOns?: CartAddOn[];
  catatan?: string;
  hargaSatuan: number;
  menu?: Menu;
}

interface CartContextValue {
  items: CartItem[];
  warungId: string | null;
  warungNama: string | null;
  totalItem: number;
  subtotal: number;
  addItem: (item: AddItemInput, warungNama?: string) => boolean;
  updateQty: (itemId: string, qty: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialCartState: CartState = {
  items: [],
  warungId: null,
  warungNama: null,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch {
      // Abaikan bila terjadi error akses localStorage
    }
    return initialCartState;
  });

  // State untuk dialog konfirmasi jika ganti warung
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean;
    pendingItem?: AddItemInput;
    pendingWarungNama?: string;
  }>({ isOpen: false });

  // Sinkronisasi ke localStorage setiap kali state berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Abaikan bila gagal simpan
    }
  }, [state]);

  const totalItem = useMemo(() => {
    return state.items.reduce((acc, item) => acc + item.jumlah, 0);
  }, [state.items]);

  const subtotal = useMemo(() => {
    return state.items.reduce((acc, item) => {
      const addOnsPrice = (item.addOns || []).reduce(
        (sum, a) => sum + (a.hargaTambahan || 0),
        0
      );
      return acc + (item.hargaSatuan + addOnsPrice) * item.jumlah;
    }, 0);
  }, [state.items]);

  const addItem = useCallback(
    (item: AddItemInput, warungNama?: string): boolean => {
      // Aturan: cart hanya boleh berisi item dari 1 warung
      if (
        state.items.length > 0 &&
        state.warungId &&
        state.warungId !== item.warungId
      ) {
        // Tampilkan konfirmasi ganti warung
        setConflictDialog({
          isOpen: true,
          pendingItem: item,
          pendingWarungNama: warungNama,
        });
        return false;
      }

      dispatch({
        type: "ADD_ITEM",
        payload: { item, warungNama },
      });
      return true;
    },
    [state.items.length, state.warungId]
  );

  const confirmSwitchWarung = () => {
    if (conflictDialog.pendingItem) {
      dispatch({
        type: "REPLACE_AND_ADD",
        payload: {
          item: conflictDialog.pendingItem,
          warungNama: conflictDialog.pendingWarungNama,
        },
      });
    }
    setConflictDialog({ isOpen: false });
  };

  const cancelSwitchWarung = () => {
    setConflictDialog({ isOpen: false });
  };

  const updateQty = useCallback((itemId: string, qty: number) => {
    dispatch({ type: "UPDATE_QTY", payload: { itemId, qty } });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { itemId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const contextValue: CartContextValue = {
    items: state.items,
    warungId: state.warungId,
    warungNama: state.warungNama,
    totalItem,
    subtotal,
    addItem,
    updateQty,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}

      {/* Modal Konfirmasi Ganti Warung */}
      {conflictDialog.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-switch-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-blue-100 text-center space-y-5 animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h3
                id="dialog-switch-title"
                className="text-lg md:text-xl font-bold text-navy"
              >
                Ganti Keranjang Warung?
              </h3>
              <p className="text-sm text-navy/70 leading-relaxed">
                Keranjangmu saat ini berisi menu dari{" "}
                <span className="font-semibold text-primary">
                  {state.warungNama || "warung lain"}
                </span>
                . Satu pesanan hanya bisa berasal dari 1 warung.
              </p>
              <p className="text-xs text-navy/50">
                Apakah kamu ingin mengosongkan keranjang sebelumnya dan menambahkan menu ini?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={cancelSwitchWarung}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 text-sm font-semibold text-navy hover:bg-slate-50 active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSwitchWarung}
                className="flex-1 py-3 px-4 rounded-full bg-primary hover:bg-blue-bright text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                Ganti Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
