import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type {
  Order,
  OrderItem,
  OrderStatus,
} from "../mock/types";
import { addStoredReview } from "../mock/reviews";

const ORDERS_STORAGE_KEY = "kantingo_orders_v1";
const LEGACY_STORAGE_KEY = "kantingo_orders";

interface OrderState {
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
  advanceOrderDemo: (orderId?: string) => string | null;
  submitReview: (orderId: string, rating: number, komentar: string) => void;
  ordersByStatus: (status: OrderStatus) => Order[];
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

const initialSeedOrders: Order[] = [
  {
    id: "KGO-8921",
    kodePesanan: "KGO-8921",
    warungId: "1",
    warungNama: "Kantin Bu Siti - Masakan Nusantara",
    items: [
      {
        id: "seed-1",
        menuId: "1",
        warungId: "1",
        nama: "Ayam Geprek Sambal Matah",
        gambar:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80",
        jumlah: 2,
        hargaSatuan: 18000,
        catatan: "Sambal matah dipisah ya bu",
        addOns: [
          { id: "lvl-2", nama: "Level 2 (Sedang)", hargaTambahan: 0 },
          { id: "nas-1", nama: "Nasi Biasa", hargaTambahan: 3000 },
        ],
      },
      {
        id: "seed-2",
        menuId: "2",
        warungId: "1",
        nama: "Es Teh Manis Jumbo",
        gambar:
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80",
        jumlah: 1,
        hargaSatuan: 4000,
        addOns: [],
      },
    ],
    waktuPengambilan: "Secepatnya (±10 mnt)",
    voucher: null,
    subtotal: 42000,
    diskon: 0,
    biayaLayanan: 1000,
    total: 43000,
    dibuatPada: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "siap",
    sudahDiulas: false,
  },
  {
    id: "KGO-7412",
    kodePesanan: "KGO-7412",
    warungId: "2",
    warungNama: "Kedai Kopi Kampus 2.0",
    items: [
      {
        id: "seed-3",
        menuId: "201",
        warungId: "2",
        nama: "Kopi Susu Gula Aren Barista",
        gambar:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80",
        jumlah: 1,
        hargaSatuan: 12000,
        catatan: "Less ice, normal sugar",
        addOns: [{ id: "ice-less", nama: "Less Ice", hargaTambahan: 0 }],
      },
    ],
    waktuPengambilan: "Kemarin, 14:30 WIB",
    voucher: {
      id: "v-welcome",
      kode: "HEMAT5RB",
      judul: "Voucher Pengguna Baru",
      tipe: "nominal",
      nilai: 5000,
    },
    subtotal: 12000,
    diskon: 5000,
    biayaLayanan: 1000,
    total: 8000,
    dibuatPada: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "selesai",
    sudahDiulas: false,
  },
  {
    id: "KGO-6290",
    kodePesanan: "KGO-6290",
    warungId: "3",
    warungNama: "Ayam Geprek Mas Bro",
    items: [
      {
        id: "seed-4",
        menuId: "301",
        warungId: "3",
        nama: "Paket Ayam Geprek Keju Leleh",
        gambar:
          "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&auto=format&fit=crop&q=80",
        jumlah: 1,
        hargaSatuan: 22000,
        addOns: [],
      },
    ],
    waktuPengambilan: "2 hari yang lalu",
    voucher: null,
    subtotal: 22000,
    diskon: 0,
    biayaLayanan: 1000,
    total: 23000,
    dibuatPada: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "selesai",
    sudahDiulas: true,
    ulasan: {
      rating: 5,
      komentar: "Kejunya melimpah banget dan ayamnya super gurih!",
      dibuatPada: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    },
  },
];

// Normalisasi data dari localStorage jika ada
function getInitialOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Coba migrasi dari legacy key sebelumnya
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        return legacyParsed.map((o: any) => ({
          id: o.id || `KGO-${Math.floor(1000 + Math.random() * 9000)}`,
          kodePesanan: o.id || `KGO-8921`,
          warungId: o.warungId || "1",
          warungNama: o.warungNama || "Kantin Bu Siti",
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                id: it.id || "it-1",
                menuId: it.menuId || "101",
                warungId: it.warungId || o.warungId || "1",
                nama: it.nama || "Menu Pesanan",
                gambar:
                  it.gambar ||
                  "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80",
                jumlah: it.jumlah || 1,
                hargaSatuan: it.hargaSatuan || 18000,
                addOns: it.addOns || [],
                catatan: it.catatan,
              }))
            : [],
          waktuPengambilan:
            o.pickupTime || o.waktuPengambilan || "Secepatnya (±10 mnt)",
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
  return initialSeedOrders;
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
      kodePesanan: generatedId,
      warungId: input.warungId,
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

  // Helper demo untuk memajukan status secara manual: diproses -> siap
  const advanceOrderDemo = useCallback(
    (orderId?: string): string | null => {
      if (orderId) {
        const order = state.orders.find((o) => o.id === orderId);
        if (!order) return null;
        if (order.status === "diproses") {
          updateStatus(orderId, "siap");
          return orderId;
        } else if (order.status === "siap") {
          updateStatus(orderId, "selesai");
          return orderId;
        }
        return null;
      }

      // Cari order pertama yang berstatus "diproses"
      const target = state.orders.find((o) => o.status === "diproses");
      if (target) {
        updateStatus(target.id, "siap");
        return target.id;
      }
      return null;
    },
    [state.orders, updateStatus]
  );

  // Submit ulasan: update status pesanan dan simpan review ke daftar warung
  const submitReview = useCallback(
    (orderId: string, rating: number, komentar: string) => {
      const now = new Date().toISOString();
      dispatch({
        type: "SUBMIT_REVIEW",
        payload: {
          orderId,
          rating,
          komentar,
          dibuatPada: now,
        },
      });

      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        addStoredReview({
          id: `rev-${Date.now()}`,
          warungId: order.warungId,
          namaUser: "Radhitya Fadhil",
          rating,
          komentar,
          tanggal: "Hari ini",
        });
      }
    },
    [state.orders]
  );

  // Selector: filter orders by status
  const ordersByStatus = useCallback(
    (status: OrderStatus) => {
      return state.orders.filter((o) => o.status === status);
    },
    [state.orders]
  );

  // Selector: get order by ID
  const getOrder = useCallback(
    (id: string) => {
      return state.orders.find(
        (o) => o.id === id || o.kodePesanan === id
      );
    },
    [state.orders]
  );

  // Simulasi otomatis: order "diproses" berumur >30 detik otomatis jadi "siap"
  useEffect(() => {
    const checkAutoAdvance = () => {
      const now = Date.now();
      state.orders.forEach((order) => {
        if (order.status === "diproses" && order.dibuatPada) {
          const createdAt = new Date(order.dibuatPada).getTime();
          if (now - createdAt >= 30 * 1000) {
            updateStatus(order.id, "siap");
          }
        }
      });
    };

    checkAutoAdvance();
    const interval = setInterval(checkAutoAdvance, 5000);
    return () => clearInterval(interval);
  }, [state.orders, updateStatus]);

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        addOrder,
        updateStatus,
        completeOrder,
        advanceOrderDemo,
        submitReview,
        ordersByStatus,
        getOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
