import type { Menu, Warung, Order, OrderStatus, Review, CartItem } from "./mock/types";
import type { User, Settings } from "./user/types";
import type { VoucherItem } from "./mock";
import { mockMenuList } from "./mock/menu";
import { mockWarungList } from "./mock/warung";
import { initialReviews } from "./mock/reviews";
import { mockInitialUserVouchers, mockRedeemableVouchers } from "./mock";

const MENUS_KEY = "kantingo_menus_v1";
const WARUNG_KEY = "kantingo_warung_v1";
const ORDERS_KEY = "kantingo_orders_v1";
const CART_KEY = "kantingo_cart_state_v1";
const USER_KEY = "kantingo_user_v1";
const SETTINGS_KEY = "kantingo_settings_v1";
const VOUCHERS_KEY = "kantingo_vouchers_v1";
const REDEEMED_CODES_KEY = "kantingo_redeemed_codes_v1";
const REVIEWS_KEY = "kantingo_reviews_v1";

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getLocalMenus(): Menu[] {
  const current = getFromStorage<Menu[]>(MENUS_KEY, []);
  if (current.length === 0) {
    setToStorage(MENUS_KEY, mockMenuList);
    return mockMenuList;
  }
  return current;
}

export async function getMenus(): Promise<Menu[]> {
  return getLocalMenus();
}

export async function getMenuById(id: string | number): Promise<Menu | undefined> {
  const menus = getLocalMenus();
  return menus.find((m) => String(m.id) === String(id));
}

export async function createMenu(item: Omit<Menu, "id"> & { id?: string }): Promise<Menu> {
  const menus = getLocalMenus();
  const newItem: Menu = {
    ...item,
    id: item.id || `menu-${Date.now()}`,
    name: item.name || item.nama,
    price: item.price ?? item.harga,
    description: item.description || item.deskripsi,
    imageUrl: item.imageUrl || item.gambar,
    isAvailable: item.isAvailable ?? true,
  };
  const updated = [newItem, ...menus];
  setToStorage(MENUS_KEY, updated);
  return newItem;
}

export async function updateMenu(id: string | number, patch: Partial<Menu>): Promise<Menu | null> {
  const menus = getLocalMenus();
  let found: Menu | null = null;
  const updated = menus.map((m) => {
    if (String(m.id) === String(id)) {
      found = { ...m, ...patch };
      return found;
    }
    return m;
  });
  if (found) {
    setToStorage(MENUS_KEY, updated);
  }
  return found;
}

export async function deleteMenu(id: string | number): Promise<boolean> {
  const menus = getLocalMenus();
  const filtered = menus.filter((m) => String(m.id) !== String(id));
  if (filtered.length !== menus.length) {
    setToStorage(MENUS_KEY, filtered);
    return true;
  }
  return false;
}

export function getLocalWarungs(): Warung[] {
  const current = getFromStorage<Warung[]>(WARUNG_KEY, []);
  if (current.length === 0) {
    setToStorage(WARUNG_KEY, mockWarungList);
    return mockWarungList;
  }
  return current;
}

export async function getWarungs(): Promise<Warung[]> {
  return getLocalWarungs();
}

export async function getWarungById(id: string | number): Promise<Warung | undefined> {
  const warungs = getLocalWarungs();
  return warungs.find((w) => String(w.id) === String(id));
}

export async function createWarung(warung: Omit<Warung, "id"> & { id?: string | number }): Promise<Warung> {
  const warungs = getLocalWarungs();
  const newWarung: Warung = {
    ...warung,
    id: warung.id || `warung-${Date.now()}`,
    name: warung.name || warung.nama || "Kantin Baru",
    isOpen: warung.isOpen ?? true,
    rating: warung.rating || 5.0,
  };
  const updated = [newWarung, ...warungs];
  setToStorage(WARUNG_KEY, updated);
  return newWarung;
}

export async function updateWarung(id: string | number, patch: Partial<Warung>): Promise<Warung | null> {
  const warungs = getLocalWarungs();
  let found: Warung | null = null;
  const updated = warungs.map((w) => {
    if (String(w.id) === String(id)) {
      found = { ...w, ...patch };
      return found;
    }
    return w;
  });
  if (found) {
    setToStorage(WARUNG_KEY, updated);
  }
  return found;
}

export async function deleteWarung(id: string | number): Promise<boolean> {
  const warungs = getLocalWarungs();
  const filtered = warungs.filter((w) => String(w.id) !== String(id));
  if (filtered.length !== warungs.length) {
    setToStorage(WARUNG_KEY, filtered);
    return true;
  }
  return false;
}

export function getLocalOrders(): Order[] {
  return getFromStorage<Order[]>(ORDERS_KEY, []);
}

export async function getOrders(): Promise<Order[]> {
  return getLocalOrders();
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = getLocalOrders();
  return orders.find((o) => o.id === id);
}

export async function createOrder(orderData: Omit<Order, "id"> & { id?: string }): Promise<Order> {
  const orders = getLocalOrders();
  const newOrder: Order = {
    ...orderData,
    id: orderData.id || `order-${Date.now()}`,
  };
  const updated = [newOrder, ...orders];
  setToStorage(ORDERS_KEY, updated);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const orders = getLocalOrders();
  let found: Order | null = null;
  const updated = orders.map((o) => {
    if (o.id === id) {
      found = { ...o, status };
      return found;
    }
    return o;
  });
  if (found) {
    setToStorage(ORDERS_KEY, updated);
  }
  return found;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = getLocalOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length !== orders.length) {
    setToStorage(ORDERS_KEY, filtered);
    return true;
  }
  return false;
}

export interface LocalCartState {
  items: CartItem[];
  warungId: string | null;
  warungNama: string | null;
}

const initialCartState: LocalCartState = {
  items: [],
  warungId: null,
  warungNama: null,
};

export function getLocalCart(): LocalCartState {
  return getFromStorage<LocalCartState>(CART_KEY, initialCartState);
}

export async function getCart(): Promise<LocalCartState> {
  return getLocalCart();
}

export async function saveCart(cart: LocalCartState): Promise<LocalCartState> {
  setToStorage(CART_KEY, cart);
  return cart;
}

export async function clearCart(): Promise<void> {
  setToStorage(CART_KEY, initialCartState);
}

const defaultUser: User = {
  id: "usr-01",
  nama: "Radhitya Fadhil",
  username: "radhityafadhil",
  email: "radhitya.fadhil@kampus.ac.id",
  noHp: "081234567890",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  poin: 1250,
};

const defaultSettings: Settings = {
  notifikasiPesanan: true,
  notifikasiPromo: true,
  tema: "terang",
};

export function getLocalUser(): User {
  return getFromStorage<User>(USER_KEY, defaultUser);
}

export async function getUser(): Promise<User> {
  return getLocalUser();
}

export async function updateUser(patch: Partial<User>): Promise<User> {
  const current = getLocalUser();
  const updated = { ...current, ...patch };
  setToStorage(USER_KEY, updated);
  return updated;
}

export function getLocalSettings(): Settings {
  return getFromStorage<Settings>(SETTINGS_KEY, defaultSettings);
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = getLocalSettings();
  const updated = { ...current, ...patch };
  setToStorage(SETTINGS_KEY, updated);
  return updated;
}

export function getLocalVouchers(): VoucherItem[] {
  const saved = getFromStorage<VoucherItem[]>(VOUCHERS_KEY, []);
  if (saved.length === 0) {
    setToStorage(VOUCHERS_KEY, mockInitialUserVouchers);
    return mockInitialUserVouchers;
  }
  return saved;
}

export async function getVouchers(): Promise<VoucherItem[]> {
  return getLocalVouchers();
}

export async function redeemVoucher(rawCode: string): Promise<{
  success: boolean;
  message: string;
  voucher?: VoucherItem;
}> {
  const normalizedCode = rawCode.trim().toUpperCase();
  if (!normalizedCode) {
    return {
      success: false,
      message: "Silakan masukkan kode voucher terlebih dahulu.",
    };
  }

  const redeemed = getFromStorage<string[]>(REDEEMED_CODES_KEY, []);
  if (redeemed.includes(normalizedCode)) {
    return {
      success: false,
      message: `Kode "${normalizedCode}" sudah pernah kamu tukarkan sebelumnya.`,
    };
  }

  const matched = mockRedeemableVouchers.find(
    (v) => v.code.toUpperCase() === normalizedCode
  );

  if (!matched) {
    return {
      success: false,
      message: "Kode voucher tidak ditemukan atau sudah kedaluwarsa.",
    };
  }

  const newVoucher: VoucherItem = {
    ...matched,
    id: `redeemed-${Date.now()}-${matched.id}`,
    status: "active",
  };

  const currentVouchers = getLocalVouchers();
  const updatedVouchers = [newVoucher, ...currentVouchers];
  setToStorage(VOUCHERS_KEY, updatedVouchers);
  setToStorage(REDEEMED_CODES_KEY, [...redeemed, normalizedCode]);

  return {
    success: true,
    message: `Voucher ${matched.code} berhasil ditukarkan! Diskon Rp${new Intl.NumberFormat(
      "id-ID"
    ).format(matched.discount)} ditambahkan ke Voucher Saya.`,
    voucher: newVoucher,
  };
}

export function getLocalReviews(warungId?: string): Review[] {
  const all = getFromStorage<Review[]>(REVIEWS_KEY, initialReviews);
  if (!warungId) return all;
  return all.filter((r) => String(r.warungId) === String(warungId));
}

export async function getReviews(warungId?: string): Promise<Review[]> {
  return getLocalReviews(warungId);
}

export async function addReview(review: Review): Promise<Review[]> {
  const current = getFromStorage<Review[]>(REVIEWS_KEY, initialReviews);
  const updated = [review, ...current];
  setToStorage(REVIEWS_KEY, updated);
  return updated;
}

export const api = {
  menus: {
    get: getMenus,
    getById: getMenuById,
    create: createMenu,
    update: updateMenu,
    delete: deleteMenu,
  },
  warungs: {
    get: getWarungs,
    getById: getWarungById,
    create: createWarung,
    update: updateWarung,
    delete: deleteWarung,
  },
  orders: {
    get: getOrders,
    getById: getOrderById,
    create: createOrder,
    updateStatus: updateOrderStatus,
    delete: deleteOrder,
  },
  cart: {
    get: getCart,
    save: saveCart,
    clear: clearCart,
  },
  user: {
    get: getUser,
    update: updateUser,
    getSettings: getLocalSettings,
    updateSettings: updateSettings,
  },
  vouchers: {
    get: getVouchers,
    redeem: redeemVoucher,
  },
  reviews: {
    get: getReviews,
    add: addReview,
  },
  api: {
    menus: {
      $get: async () => {
        const data = getLocalMenus();
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: data.map((item, idx) => ({
              id: item.id || idx + 1,
              stallId: item.warungId || "1",
              canteenId: item.warungId || "1",
              name: item.nama || item.name,
              price: item.harga ?? item.price,
              description: item.deskripsi || item.description,
              imageUrl: item.gambar || item.imageUrl,
              isAvailable: item.isAvailable ?? true,
              orderCount: item.soldCount || 100,
              categoryId: item.categoryId || "heavy",
            })),
          }),
        };
      },
    },
  },
};
