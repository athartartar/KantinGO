import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { Order, OrderItem, OrderStatus, Review } from "../mock/types";
import { getStoredReviews, saveStoredReviews } from "../mock/reviews";
import { mockUser } from "../mock";

const ORDERS_STORAGE_KEY = "kantingo_orders_v1";
const LEGACY_STORAGE_KEY = "kantingo_orders";

// Flag simulasi otomatis untuk demo (mudah dicabut saat backend siap)
export const ENABLE_DEMO_AUTO_PROGRESS = true;
// Waktu transisi dari "diproses" ke "siap" (30 detik)
export const DEMO_PROGRESS_DELAY_MS = 30 * 1000;

export interface OrderState {
  orders: Order[];
}

type OrderAction =
  | { type: "LOAD_ORDERS"; payload: Order[] }
  | { type: "ADD_ORDER"; payload: Order }
  | {
      type: "UPDATE_STATUS";
      payload: { orderId: string; status: OrderStatus };
    }
  | {
      type: "SUBMIT_REVIEW";
      payload: {
        orderId: string;
        rating: number;
        komentar: string;
        dibuatPada: string;
      };
    };

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "LOAD_ORDERS":
      return { orders: action.payload };

    case "ADD_ORDER": {
      // Cek apakah orderId sudah ada agar tidak duplikat
      if (state.orders.some((o) => o.id === action.payload.id)) {
        return state;
      }
      return { orders: [action.payload, ...state.orders] };
    }

    case "UPDATE_STATUS": {
      const updated = state.orders.map((order) =>
        order.id === action.payload.orderId
          ? { ...order, status: action.payload.status }
          : order
      );
      return { orders: updated };
    }

    case "SUBMIT_REVIEW": {
      const updated = state.orders.map((order) => {
        if (order.id === action.payload.orderId) {
          return {
            ...order,
            sudahDiulas: true,
            ulasan: {
              rating: action.payload.rating,
              komentar: action.payload.komentar,
              dibuatPada: action.payload.dibuatPada,
            },
          };
        }
        return order;
      });
      return { orders: updated };
    }

    default:
      return state;
  }
}

export interface AddOrderInput {
  id?: string;
  kodePesanan?: string;
  warungId: string;
  warungNama: string;
  items: OrderItem[];
  waktuPengambilan: string;
  voucher?: any;
  subtotal: number;
  diskon: number;
  biayaLayanan: number;
  total: number;
  dibuatPada?: string;
}

interface OrderContextValue {
  orders: Order[];
  addOrder: (input: AddOrderInput) => Order;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  completeOrder: (orderId: string) => void;
  advanceOrderDemo: (orderId: string) => void;
  submitReview: (orderId: string, rating: number, komentar: string) => void;
  ordersByStatus: (status: OrderStatus) => Order[];
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

// Normalisasi data dari localStorage lama jika ada
function getInitialOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Coba migrasi dari legacy key sebelumnya
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        return legacyParsed.map((o: any) => ({
          id: o.id || `KGO-${Math.floor(1000 + Math.random() * 9000)}`,
          kodePesanan: o.id || `KGO-8921`,
          warungId: o.warungId || "1",
          warungNama: o.warungNama || "Kantin Bu Siti",
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                id: it.id || "it-1",
                menuId: it.menuId || "101",
                nama: it.nama || "Menu Pesanan",
                gambar: it.gambar || "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80",
                jumlah: it.jumlah || 1,
                hargaSatuan: it.hargaSatuan || 18000,
                addOns: it.addOns || [],
                catatan: it.catatan,
              }))
            : [],
          waktuPengambilan: o.pickupTime || o.waktuPengambilan || "Secepatnya (±10 mnt)",
          voucher: o.voucher || null,
          subtotal: o.subtotal || o.total || 18000,
          diskon: o.diskon || 0,
          biayaLayanan: o.biayaLayanan ?? 1000,
          total: o.total || 18000,
          dibuatPada: o.createdAt || o.dibuatPada || new Date().toISOString(),
          status: (o.status as OrderStatus) || "diproses",
          sudahDiulas: o.sudahDiulas || false,
          ulasan: o.ulasan,
        }));
      }
    }
  } catch {
    // Abaikan jika parsing gagal
  }
  return [];
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(orderReducer, { orders: [] }, () => ({
    orders: getInitialOrders(),
  }));

  // Simpan ke localStorage saat order berubah
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(state.orders));
      // Sinkronisasi juga ke legacy key untuk kompatibilitas
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(state.orders));
    } catch {
      // Abaikan jika localStorage tidak bisa diakses
    }
  }, [state.orders]);

  // Tambah pesanan baru
  const addOrder = useCallback((input: AddOrderInput): Order => {
    const generatedId =
      input.id ||
      input.kodePesanan ||
      `KGO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: generatedId,
      kodePesanan: input.kodePesanan || generatedId,
      warungId: String(input.warungId),
      warungNama: input.warungNama,
      items: input.items,
      waktuPengambilan: input.waktuPengambilan,
      voucher: input.voucher || null,
      subtotal: input.subtotal,
      diskon: input.diskon,
      biayaLayanan: input.biayaLayanan,
      total: input.total,
      dibuatPada: input.dibuatPada || new Date().toISOString(),
      status: "diproses",
      sudahDiulas: false,
    };

    dispatch({ type: "ADD_ORDER", payload: newOrder });
    return newOrder;
  }, []);

  // Ubah status pesanan
  const updateStatus = useCallback((orderId: string, status: OrderStatus) => {
    dispatch({ type: "UPDATE_STATUS", payload: { orderId, status } });
  }, []);

  // Selesaikan pesanan
  const completeOrder = useCallback(
    (orderId: string) => {
      updateStatus(orderId, "selesai");
    },
    [updateStatus]
  );

  // Helper demo untuk memajukan status secara manual: diproses -> siap -> selesai
  const advanceOrderDemo = useCallback(
    (orderId: string) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;
      if (order.status === "diproses") {
        updateStatus(orderId, "siap");
      } else if (order.status === "siap") {
        updateStatus(orderId, "selesai");
      }
    },
    [state.orders, updateStatus]
  );

  // Submit ulasan: update status pesanan dan simpan review ke daftar warung
  const submitReview = useCallback(
    (orderId: string, rating: number, komentar: string) => {
      const targetOrder = state.orders.find((o) => o.id === orderId);
      const dibuatPada = new Date().toISOString();

      dispatch({
        type: "SUBMIT_REVIEW",
        payload: { orderId, rating, komentar, dibuatPada },
      });

      if (targetOrder) {
        const newReview: Review = {
          id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          warungId: String(targetOrder.warungId),
          namaUser: mockUser.name,
          rating,
          komentar: komentar.trim(),
          tanggal: "Baru saja",
          avatarUrl: mockUser.avatarUrl,
        };

        const existingReviews = getStoredReviews();
        saveStoredReviews([newReview, ...existingReviews]);
      }
    },
    [state.orders]
  );

  // Selector
  const ordersByStatus = useCallback(
    (status: OrderStatus): Order[] => {
      return state.orders.filter((o) => o.status === status);
    },
    [state.orders]
  );

  const getOrder = useCallback(
    (id: string): Order | undefined => {
      return state.orders.find((o) => o.id === id || o.kodePesanan === id);
    },
    [state.orders]
  );

  // ----------------------------------------------------
  // 4. Simulasi Progres Demo (Otomatis "diproses" -> "siap" setelah 30 detik)
  // ----------------------------------------------------
  useEffect(() => {
    if (!ENABLE_DEMO_AUTO_PROGRESS) return;

    const checkAndProgressOrders = () => {
      const currentTime = Date.now();
      state.orders.forEach((order) => {
        if (order.status === "diproses") {
          const createdAtTime = new Date(order.dibuatPada).getTime();
          if (!isNaN(createdAtTime) && currentTime - createdAtTime >= DEMO_PROGRESS_DELAY_MS) {
            updateStatus(order.id, "siap");
          }
        }
      });
    };

    // Jalankan segera saat effect aktif
    checkAndProgressOrders();

    // Jalankan interval ringan setiap 5 detik
    const interval = setInterval(checkAndProgressOrders, 5000);
    return () => clearInterval(interval);
  }, [state.orders, updateStatus]);

  const value = useMemo(
    () => ({
      orders: state.orders,
      addOrder,
      updateStatus,
      completeOrder,
      advanceOrderDemo,
      submitReview,
      ordersByStatus,
      getOrder,
    }),
    [
      state.orders,
      addOrder,
      updateStatus,
      completeOrder,
      advanceOrderDemo,
      submitReview,
      ordersByStatus,
      getOrder,
    ]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export function useOrders(): OrderContextValue {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
