import type { Menu, Warung, Order, OrderStatus, Review, CartItem } from "./mock/types";
import type { User, Settings } from "./user/types";
import type { VoucherItem } from "./mock";
import type { AppNotification } from "./notifications/types";
import { mockMenuList } from "./mock/menu";
import { mockWarungList } from "./mock/warung";
import { initialReviews } from "./mock/reviews";
import { mockInitialUserVouchers, mockRedeemableVouchers } from "./mock";
import {
  apiFetch,
  isAuthenticated,
  isMockMode,
  logout as clearAuthStorage,
  setAuthUser,
  setToken,
  type AuthUser,
} from "./auth";

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

function mapMenuFromApi(raw: any): Menu {
  const addOnGroups = Array.isArray(raw.addon_groups)
    ? raw.addon_groups.map((g: any) => ({
        id: g.group_key || g.id,
        title: g.group_title || g.title,
        type: g.selection_type === "multiple" ? "multiple" : "single",
        required: Boolean(g.is_required),
        options: Array.isArray(g.options)
          ? g.options.map((o: any) => ({
              id: String(o.id),
              name: o.option_name || o.name,
              additionalPrice: Number(o.additional_price ?? 0),
            }))
          : [],
      }))
    : [];

  return {
    id: String(raw.id),
    warungId: String(raw.warung_id),
    categoryId: raw.category?.slug || String(raw.category_id || "heavy"),
    kategori: raw.category?.name || raw.category?.slug || "Makanan",
    name: raw.name,
    nama: raw.name,
    description: raw.description || "",
    deskripsi: raw.description || "",
    price: Number(raw.price ?? 0),
    harga: Number(raw.price ?? 0),
    imageUrl: raw.image_path || "",
    gambar: raw.image_path || "",
    isAvailable: Boolean(raw.is_available ?? true),
    rating: Number(raw.rating_avg ?? 4.8),
    soldCount: Number(raw.sold_count ?? 0),
    addOnGroups,
  };
}

function mapWarungFromApi(raw: any): Warung {
  return {
    id: String(raw.id),
    name: raw.name,
    nama: raw.name,
    slug: raw.slug,
    description: raw.description || "",
    location: raw.location || raw.canteen?.name || "Kantin Kampus",
    jamBuka: raw.opening_hours || "08:00 - 17:00",
    openingHours: raw.opening_hours || "08:00 - 17:00",
    logo: raw.logo_path || "",
    estimatedMinutes: Number(raw.estimated_minutes ?? 10),
    rating: Number(raw.rating_avg ?? 4.8),
    reviewCount: Number(raw.review_count ?? 0),
    isOpen: Boolean(raw.is_open ?? true),
  };
}

function mapOrderFromApi(raw: any): Order {
  const statusMap: Record<string, OrderStatus> = {
    menunggu_pembayaran: "diproses",
    diproses: "diproses",
    siap: "siap",
    selesai: "selesai",
    dibatalkan: "selesai",
  };

  return {
    id: String(raw.id),
    kodePesanan: raw.order_code || String(raw.id),
    warungId: String(raw.warung_id),
    warungNama: raw.warung?.name || "Kantin Kampus",
    items: Array.isArray(raw.items)
      ? raw.items.map((it: any) => ({
          id: String(it.id),
          menuId: String(it.menu_id),
          warungId: String(raw.warung_id),
          jumlah: Number(it.quantity ?? 1),
          quantity: Number(it.quantity ?? 1),
          hargaSatuan: Number(it.unit_price ?? 0),
          catatan: it.notes || undefined,
          addOns: Array.isArray(it.addons_snapshot)
            ? it.addons_snapshot.map((a: any) => ({
                optionId: String(a.id),
                name: a.option_name,
                additionalPrice: Number(a.additional_price ?? 0),
              }))
            : [],
          menu: {
            id: String(it.menu_id),
            warungId: String(raw.warung_id),
            name: it.menu_name,
            nama: it.menu_name,
            price: Number(it.unit_price ?? 0),
            harga: Number(it.unit_price ?? 0),
            imageUrl: it.menu_image || "",
            gambar: it.menu_image || "",
            isAvailable: true,
          },
        }))
      : [],
    waktuPengambilan: raw.pickup_time || "",
    voucher: null,
    subtotal: Number(raw.subtotal ?? 0),
    diskon: Number(raw.discount ?? 0),
    biayaLayanan: Number(raw.service_fee ?? 0),
    total: Number(raw.total ?? 0),
    dibuatPada: raw.created_at || new Date().toISOString(),
    status: statusMap[raw.status] || "diproses",
    rawStatus: raw.status,
    sudahDiulas: Boolean(raw.review),
  } as Order;
}

function mapUserVoucherFromApi(raw: any): VoucherItem {
  const v = raw.voucher || raw;
  const discount =
    v.type === "persen"
      ? Number(v.max_discount ?? v.value ?? 0)
      : Number(v.value ?? 0);

  return {
    id: String(raw.id),
    code: v.code,
    title: v.title,
    discount,
    minSpend: Number(v.min_spend ?? 0),
    status: raw.status === "used" ? "used" : raw.status === "expired" ? "expired" : "active",
    validUntil: v.valid_until || "",
  };
}

function mapUserFromAuthUser(u: AuthUser): User {
  return {
    id: String(u.id),
    nama: u.name,
    username: u.email.split("@")[0] || u.name,
    email: u.email,
    noHp: u.phone || "",
    avatar: u.avatar_path || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    poin: Number(u.points ?? 0),
  };
}

function mapNotificationFromApi(raw: any): AppNotification {
  const typeMap: Record<string, AppNotification["jenis"]> = {
    payment_paid: "diproses",
    order_status_changed: raw.data?.status === "siap" ? "siap" : raw.data?.status === "selesai" ? "diterima" : "diproses",
    new_paid_order: "diproses",
  };

  return {
    id: String(raw.id),
    orderId: String(raw.data?.order_id || raw.data?.order_code || ""),
    jenis: typeMap[raw.type] || "diproses",
    judul: raw.title,
    pesan: raw.message,
    waktu: raw.created_at || new Date().toISOString(),
    sudahDibaca: Boolean(raw.read_at),
  };
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
  if (isMockMode()) return getLocalMenus();
  const res = await apiFetch<{ data: any[] }>("/menus/popular?per_page=50", { skipAuthRedirect: true });
  return (res.data || []).map(mapMenuFromApi);
}

export async function getMenuById(id: string | number): Promise<Menu | undefined> {
  if (isMockMode()) {
    const menus = getLocalMenus();
    return menus.find((m) => String(m.id) === String(id));
  }
  const res = await apiFetch<{ data: any }>(`/menus/${id}`, { skipAuthRedirect: true });
  return res.data ? mapMenuFromApi(res.data) : undefined;
}

export async function createMenu(item: Omit<Menu, "id"> & { id?: string }): Promise<Menu> {
  if (isMockMode()) {
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
  const res = await apiFetch<{ data: any }>("/partner/menus", {
    method: "POST",
    body: JSON.stringify({
      category_id: Number(item.categoryId || 1),
      name: item.name || item.nama,
      description: item.description || item.deskripsi || "",
      price: Number(item.price ?? item.harga ?? 1000),
      is_available: item.isAvailable ?? true,
    }),
  });
  return mapMenuFromApi(res.data);
}

export async function updateMenu(id: string | number, patch: Partial<Menu>): Promise<Menu | null> {
  if (isMockMode()) {
    const menus = getLocalMenus();
    let found: Menu | null = null;
    const updated = menus.map((m) => {
      if (String(m.id) === String(id)) {
        found = { ...m, ...patch };
        return found;
      }
      return m;
    });
    if (found) setToStorage(MENUS_KEY, updated);
    return found;
  }
  const res = await apiFetch<{ data: any }>(`/partner/menus/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: patch.name || patch.nama,
      description: patch.description || patch.deskripsi,
      price: patch.price ?? patch.harga,
      is_available: patch.isAvailable,
    }),
  });
  return res.data ? mapMenuFromApi(res.data) : null;
}

export async function deleteMenu(id: string | number): Promise<boolean> {
  if (isMockMode()) {
    const menus = getLocalMenus();
    const filtered = menus.filter((m) => String(m.id) !== String(id));
    if (filtered.length !== menus.length) {
      setToStorage(MENUS_KEY, filtered);
      return true;
    }
    return false;
  }
  await apiFetch(`/partner/menus/${id}`, { method: "DELETE" });
  return true;
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
  if (isMockMode()) return getLocalWarungs();
  const res = await apiFetch<{ data: any[] }>("/warungs?per_page=50", { skipAuthRedirect: true });
  return (res.data || []).map(mapWarungFromApi);
}

export async function getWarungById(id: string | number): Promise<Warung | undefined> {
  if (isMockMode()) {
    const warungs = getLocalWarungs();
    return warungs.find((w) => String(w.id) === String(id));
  }
  const res = await apiFetch<{ data: any }>(`/warungs/${id}`, { skipAuthRedirect: true });
  return res.data ? mapWarungFromApi(res.data) : undefined;
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
  if (!isMockMode()) {
    const res = await apiFetch<{ data: any }>("/partner/warung", {
      method: "PUT",
      body: JSON.stringify({
        name: patch.name || patch.nama,
        description: patch.description,
        location: patch.location,
        opening_hours: patch.jamBuka || patch.openingHours,
      }),
    });
    return res.data ? mapWarungFromApi(res.data) : null;
  }
  const warungs = getLocalWarungs();
  let found: Warung | null = null;
  const updated = warungs.map((w) => {
    if (String(w.id) === String(id)) {
      found = { ...w, ...patch };
      return found;
    }
    return w;
  });
  if (found) setToStorage(WARUNG_KEY, updated);
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
  if (isMockMode() || !isAuthenticated()) return getLocalOrders();
  const res = await apiFetch<{ data: any[] }>("/orders?per_page=50");
  return (res.data || []).map(mapOrderFromApi);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (isMockMode() || !isAuthenticated()) {
    const orders = getLocalOrders();
    return orders.find((o) => o.id === id);
  }
  const res = await apiFetch<{ data: any }>(`/orders/${id}`);
  return res.data ? mapOrderFromApi(res.data) : undefined;
}

export async function createOrder(
  orderData: Omit<Order, "id"> & { id?: string; idempotencyKey?: string }
): Promise<Order> {
  if (isMockMode() || !isAuthenticated()) {
    const orders = getLocalOrders();
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `order-${Date.now()}`,
    };
    const updated = [newOrder, ...orders];
    setToStorage(ORDERS_KEY, updated);
    return newOrder;
  }

  const res = await apiFetch<{ data: any }>("/orders", {
    method: "POST",
    idempotencyKey: orderData.idempotencyKey,
    body: JSON.stringify({
      items: (orderData.items || []).map((item: any) => ({
        menu_id: Number(item.menuId),
        qty: Number(item.jumlah ?? item.quantity ?? 1),
        addon_id: Array.isArray(item.addOns)
          ? item.addOns.map((a: any) => Number(a.optionId || a.id)).filter((n: number) => !Number.isNaN(n))
          : [],
      })),
      pickup_time: orderData.waktuPengambilan,
      voucher_code: orderData.voucher?.kode || undefined,
    }),
  });
  return mapOrderFromApi(res.data);
}

export async function updateOrderStatus(id: string, status: OrderStatus | "dibatalkan"): Promise<Order | null> {
  if (isMockMode() || !isAuthenticated()) {
    const orders = getLocalOrders();
    let found: Order | null = null;
    const updated = orders.map((o) => {
      if (o.id === id) {
        found = { ...o, status: status === "dibatalkan" ? "selesai" : status };
        return found;
      }
      return o;
    });
    if (found) setToStorage(ORDERS_KEY, updated);
    return found;
  }

  if (status === "selesai") {
    const res = await apiFetch<{ data: any }>(`/orders/${id}/confirm-pickup`, { method: "POST" });
    return res.data ? mapOrderFromApi(res.data) : null;
  }
  if (status === "dibatalkan") {
    const res = await apiFetch<{ data: any }>(`/orders/${id}/cancel`, { method: "POST" });
    return res.data ? mapOrderFromApi(res.data) : null;
  }
  const res = await apiFetch<{ data: any }>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data ? mapOrderFromApi(res.data) : null;
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
  if (isMockMode() || !isAuthenticated()) return getLocalUser();
  const res = await apiFetch<{ data: { user: AuthUser } }>("/auth/me");
  if (res.data?.user) {
    setAuthUser(res.data.user);
    const mapped = mapUserFromAuthUser(res.data.user);
    setToStorage(USER_KEY, mapped);
    return mapped;
  }
  return getLocalUser();
}

export async function updateUser(patch: Partial<User>): Promise<User> {
  if (isMockMode() || !isAuthenticated()) {
    const current = getLocalUser();
    const updated = { ...current, ...patch };
    setToStorage(USER_KEY, updated);
    return updated;
  }
  const res = await apiFetch<{ data: { user: AuthUser } }>("/auth/me", {
    method: "PUT",
    body: JSON.stringify({
      name: patch.nama,
      phone: patch.noHp,
    }),
  });
  if (res.data?.user) {
    setAuthUser(res.data.user);
    const mapped = mapUserFromAuthUser(res.data.user);
    setToStorage(USER_KEY, mapped);
    return mapped;
  }
  return getLocalUser();
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
  if (isMockMode() || !isAuthenticated()) return getLocalVouchers();
  const res = await apiFetch<{ data: any[] }>("/me/vouchers?per_page=50");
  return (res.data || []).map(mapUserVoucherFromApi);
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

  if (!isMockMode() && isAuthenticated()) {
    try {
      const res = await apiFetch<{ message: string; data: any }>("/vouchers/redeem", {
        method: "POST",
        body: JSON.stringify({ code: normalizedCode }),
      });
      return {
        success: true,
        message: res.message || "Voucher berhasil diklaim.",
        voucher: res.data ? mapUserVoucherFromApi(res.data) : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Gagal menukarkan voucher.",
      };
    }
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
  if (isMockMode()) return getLocalReviews(warungId);
  if (warungId) {
    const res = await apiFetch<{ data: any[] }>(`/warungs/${warungId}/reviews`, { skipAuthRedirect: true });
    return (res.data || []).map((r: any) => ({
      id: String(r.id),
      warungId: String(r.warung_id),
      namaUser: r.user?.name || "Pengguna",
      rating: Number(r.rating),
      komentar: r.comment || "",
      tanggal: r.created_at || "",
    }));
  }
  const res = await apiFetch<{ data: any[] }>("/me/reviews");
  return (res.data || []).map((r: any) => ({
    id: String(r.id),
    warungId: String(r.warung_id),
    namaUser: r.user?.name || "Saya",
    rating: Number(r.rating),
    komentar: r.comment || "",
    tanggal: r.created_at || "",
  }));
}

export async function addReview(review: Review & { orderId?: string }): Promise<Review[]> {
  if (!isMockMode() && isAuthenticated() && review.orderId) {
    await apiFetch(`/orders/${review.orderId}/review`, {
      method: "POST",
      body: JSON.stringify({
        rating: review.rating,
        comment: review.komentar,
      }),
    });
    return getReviews();
  }
  const current = getFromStorage<Review[]>(REVIEWS_KEY, initialReviews);
  const updated = [review, ...current];
  setToStorage(REVIEWS_KEY, updated);
  return updated;
}

export const authApi = {
  async login(email: string, password: string) {
    const res = await apiFetch<{
      success: boolean;
      message: string;
      data: { user: AuthUser; token: string; expires_at: string };
    }>("/auth/login", {
      method: "POST",
      skipAuthRedirect: true,
      body: JSON.stringify({ email, password }),
    });
    setToken(res.data.token);
    setAuthUser(res.data.user);
    return res.data;
  },
  async register(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    role: "customer" | "partner";
    warung_name?: string;
    canteen_id?: number;
  }) {
    const res = await apiFetch<{
      success: boolean;
      message: string;
      data: { user: AuthUser; token: string; expires_at: string };
    }>("/auth/register", {
      method: "POST",
      skipAuthRedirect: true,
      body: JSON.stringify(payload),
    });
    setToken(res.data.token);
    setAuthUser(res.data.user);
    return res.data;
  },
  async me() {
    const res = await apiFetch<{ data: { user: AuthUser } }>("/auth/me");
    if (res.data?.user) {
      setAuthUser(res.data.user);
    }
    return res.data.user;
  },
  async logout() {
    try {
      if (!isMockMode() && isAuthenticated()) {
        await apiFetch("/auth/logout", { method: "POST", skipAuthRedirect: true });
      }
    } finally {
      clearAuthStorage();
    }
  },
};

export const canteensApi = {
  async list() {
    const res = await apiFetch<{ data: Array<{ id: number; name: string; location?: string }> }>("/canteens", {
      skipAuthRedirect: true,
    });
    return res.data || [];
  },
};

export const paymentsApi = {
  async createPayment(orderId: string | number) {
    const res = await apiFetch<{
      data: {
        id: number;
        order_id: number;
        code: string;
        amount: number;
        status: "pending" | "paid" | "expired" | "refunded";
        qr_payload: string;
        expires_at: string;
        paid_at: string | null;
      };
    }>(`/orders/${orderId}/pay`, { method: "POST" });
    return res.data;
  },
  async getPaymentStatus(orderId: string | number) {
    const res = await apiFetch<{
      data: {
        id: number;
        order_id: number;
        code: string;
        amount: number;
        status: "pending" | "paid" | "expired" | "refunded";
        qr_payload: string;
        expires_at: string;
        paid_at: string | null;
      };
    }>(`/orders/${orderId}/payment`);
    return res.data;
  },
  async getSimulation(code: string) {
    const res = await apiFetch<{
      data: {
        code: string;
        warung_name: string | null;
        amount: number;
        status: string;
        expired: boolean;
        expires_at: string | null;
        paid_at: string | null;
      };
    }>(`/payments/simulate/${code}`, { skipAuthRedirect: true });
    return res.data;
  },
  async paySimulation(code: string) {
    const res = await apiFetch<{
      success: boolean;
      message: string;
      data: {
        payment: { status: string; paid_at: string };
        order_status: string;
      };
    }>(`/payments/simulate/${code}/pay`, {
      method: "POST",
      skipAuthRedirect: true,
    });
    return res;
  },
};

export const notificationsApi = {
  async list(): Promise<AppNotification[]> {
    const res = await apiFetch<{ data: any[] }>("/notifications?per_page=50");
    return (res.data || []).map(mapNotificationFromApi);
  },
  async markAsRead(id: string) {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
  },
  async markAllAsRead() {
    await apiFetch("/notifications/read-all", { method: "POST" });
  },
};

export const categoriesApi = {
  async list(): Promise<Array<{ id: number; name: string; slug: string }>> {
    const res = await apiFetch<{ data: Array<{ id: number; name: string; slug: string }> }>("/categories", {
      skipAuthRedirect: true,
    });
    return res.data || [];
  },
};

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const partnerApi = {
  async getWarung() {
    const res = await apiFetch<{ data: any }>("/partner/warung");
    return res.data;
  },
  async updateWarung(payload: {
    name: string;
    description?: string | null;
    location?: string | null;
    opening_hours?: string | null;
    estimated_minutes?: number;
  }) {
    const res = await apiFetch<{ data: any }>("/partner/warung", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async toggleOpen(isOpen: boolean) {
    const res = await apiFetch<{ data: any }>("/partner/warung/open", {
      method: "PATCH",
      body: JSON.stringify({ is_open: isOpen }),
    });
    return res.data;
  },
  async getStats() {
    const res = await apiFetch<{
      data: {
        orders_today: number;
        revenue_today: number;
        pending_balance: number;
        available_balance: number;
      };
    }>("/partner/stats");
    return res.data;
  },
  async getOrders(status?: string, page = 1) {
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    if (status) params.set("status", status);
    const res = await apiFetch<{ data: any[]; meta?: PaginationMeta }>(
      `/partner/orders?${params.toString()}`
    );
    return { items: res.data || [], meta: res.meta };
  },
  async updateOrderStatus(orderId: number | string, status: string) {
    const res = await apiFetch<{ data: any }>(`/partner/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  },
  async getMenus(page = 1) {
    const res = await apiFetch<{ data: any[]; meta?: PaginationMeta }>(
      `/partner/menus?page=${page}&per_page=30`
    );
    return { items: res.data || [], meta: res.meta };
  },
  async createMenu(formData: FormData) {
    const res = await apiFetch<{ data: any }>("/partner/menus", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },
  async updateMenu(menuId: number | string, payload: FormData | Record<string, any>) {
    if (payload instanceof FormData) {
      payload.append("_method", "PATCH");
      const res = await apiFetch<{ data: any }>(`/partner/menus/${menuId}`, {
        method: "POST",
        body: payload,
      });
      return res.data;
    }
    const res = await apiFetch<{ data: any }>(`/partner/menus/${menuId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async deleteMenu(menuId: number | string) {
    await apiFetch(`/partner/menus/${menuId}`, { method: "DELETE" });
  },
  async getMenuAddons(menuId: number | string) {
    const res = await apiFetch<{ data: any[] }>(`/partner/menus/${menuId}/addons`);
    return res.data || [];
  },
  async createMenuAddon(
    menuId: number | string,
    payload: {
      group_key: string;
      group_title: string;
      selection_type: "single" | "multiple";
      is_required?: boolean;
      option_name: string;
      additional_price: number;
      is_available?: boolean;
      sort_order?: number;
    }
  ) {
    const res = await apiFetch<{ data: any }>(`/partner/menus/${menuId}/addons`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async deleteMenuAddon(menuId: number | string, addonId: number | string) {
    await apiFetch(`/partner/menus/${menuId}/addons/${addonId}`, { method: "DELETE" });
  },
  async getWallet(page = 1) {
    const res = await apiFetch<{
      data: {
        pending_balance: number;
        available_balance: number;
        bank_account: {
          bank_name: string;
          account_holder: string;
          account_number_masked: string;
        } | null;
        transactions: any[];
      };
      meta: PaginationMeta;
    }>(`/partner/wallet?page=${page}&per_page=10`);
    return { ...res.data, meta: res.meta };
  },
  async updateBankAccount(payload: {
    bank_name: string;
    account_holder: string;
    account_number: string;
  }) {
    const res = await apiFetch<{
      data: {
        bank_name: string;
        account_holder: string;
        account_number_masked: string;
      };
    }>("/partner/bank-account", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  async withdraw(amount: number, idempotencyKey: string) {
    const res = await apiFetch<{ data: any; message: string }>("/partner/withdrawals", {
      method: "POST",
      idempotencyKey,
      body: JSON.stringify({ amount }),
    });
    return res.data;
  },
  async getWithdrawals(page = 1) {
    const res = await apiFetch<{ data: any[]; meta: PaginationMeta }>(
      `/partner/withdrawals?page=${page}&per_page=10`
    );
    return { items: res.data || [], meta: res.meta };
  },
};

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
        const data = await getMenus();
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
