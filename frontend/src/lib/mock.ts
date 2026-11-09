// KantinGO Mock Data & Type Definitions
// Seluruh data mock di bawah ini digunakan untuk keperluan antarmuka frontend tahap 1.
// TODO: ganti dengan API

export interface UserProfile {
  id: string;
  name: string;
  points: number;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: "order" | "promo" | "system";
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Warung {
  id: number;
  name: string;
  location: string;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  estimatedMinutes: number;
  imageUrl: string;
  categoryLabel?: string;
  categories: string[];
}

export interface MenuItem {
  id: number;
  canteenId: number;
  canteenName: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  rating: number;
  soldCount: number;
  categoryId: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discount: number;
  minSpend: number;
  validUntil: string;
  status?: "active" | "used" | "expired";
}

// ----------------------------------------------------
// Mock Data (TODO: ganti dengan API)
// ----------------------------------------------------

// TODO: ganti dengan API - Data profil pengguna
export const mockUser: UserProfile = {
  id: "usr-01",
  name: "Radhitya Fadhil",
  points: 1250,
  email: "radhitya.fadhil@kampus.ac.id",
  phone: "081234567890",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

// TODO: ganti dengan API - Notifikasi pengguna
export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    title: "Pesanan Siap Diambil!",
    message: "Ayam Geprek Sambal Matah di Kantin Bu Siti sudah siap di counter pick-up 2.",
    createdAt: "5 menit lalu",
    isRead: false,
    type: "order",
  },
  {
    id: "notif-2",
    title: "Promo Flash Sale Jam Makan Siang",
    message: "Diskon Rp5.000 untuk semua menu minuman dengan kode KANTINHEMAT.",
    createdAt: "1 jam lalu",
    isRead: false,
    type: "promo",
  },
  {
    id: "notif-3",
    title: "Poin Ditambahkan +50",
    message: "Selamat! Kamu mendapatkan 50 poin dari pesanan #KGO-8921 kemarin.",
    createdAt: "1 hari lalu",
    isRead: true,
    type: "system",
  },
];

// TODO: ganti dengan API - Kategori Menu Kantin
export const mockCategories: MenuCategory[] = [
  { id: "all", name: "Semua", icon: "Utensils" },
  { id: "heavy", name: "Makanan Berat", icon: "Soup" },
  { id: "drinks", name: "Minuman", icon: "Coffee" },
  { id: "snacks", name: "Snack & Cemilan", icon: "Cookie" },
  { id: "hemat", name: "Paket Hemat", icon: "BadgePercent" },
];

// TODO: ganti dengan API - Daftar Warung / Kantin Mitra
export const mockWarung: Warung[] = [
  {
    id: 1,
    name: "Kantin Bu Siti - Masakan Nusantara",
    location: "Kantin Utama Gedung A, Lantai 1",
    isOpen: true,
    rating: 4.8,
    reviewCount: 320,
    estimatedMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
    categoryLabel: "Nasi • Nusantara • Ayam",
    categories: ["nasi", "camilan", "heavy", "hemat"],
  },
  {
    id: 2,
    name: "Kedai Kopi Kampus 2.0",
    location: "Kantin Pusat, Sayap Barat",
    isOpen: true,
    rating: 4.9,
    reviewCount: 412,
    estimatedMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80",
    categoryLabel: "Kopi • Minuman • Roti",
    categories: ["minuman", "camilan", "drinks", "snacks"],
  },
  {
    id: 3,
    name: "Ayam Geprek Mas Bro",
    location: "Food Court Perpustakaan",
    isOpen: true,
    rating: 4.7,
    reviewCount: 250,
    estimatedMinutes: 12,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80",
    categoryLabel: "Ayam Geprek • Nasi • Pedas",
    categories: ["nasi", "western", "heavy"],
  },
  {
    id: 4,
    name: "Bakso & Mie Ayam Podomoro",
    location: "Kantin Gedung Bawah",
    isOpen: false,
    rating: 4.6,
    reviewCount: 180,
    estimatedMinutes: 15,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80",
    categoryLabel: "Mie Ayam • Bakso • Pangsit",
    categories: ["mie", "heavy"],
  },
  {
    id: 5,
    name: "Burger & Fries Uncle Sam",
    location: "Kantin Selasar Barat",
    isOpen: true,
    rating: 4.8,
    reviewCount: 210,
    estimatedMinutes: 8,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    categoryLabel: "Burger • Western • Fries",
    categories: ["western", "camilan", "snacks"],
  },
  {
    id: 6,
    name: "Kedai Minuman Segar Ceria",
    location: "Kantin Gedung C",
    isOpen: true,
    rating: 4.7,
    reviewCount: 165,
    estimatedMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
    categoryLabel: "Es Teh • Jus Buah • Boba",
    categories: ["minuman", "drinks"],
  },
];

// TODO: ganti dengan API - Menu Populer Terlaris
export const mockPopularMenus: MenuItem[] = [
  {
    id: 101,
    canteenId: 1,
    canteenName: "Kantin Bu Siti",
    name: "Ayam Geprek Sambal Matah",
    price: 18000,
    originalPrice: 20000,
    description: "Ayam krispi gurih dengan ulekan sambal matah khas Bali dan nasi hangat pulen.",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    rating: 4.9,
    soldCount: 1420,
    categoryId: "heavy",
  },
  {
    id: 102,
    canteenId: 1,
    canteenName: "Kantin Bu Siti",
    name: "Nasi Goreng Spesial Kampus",
    price: 15000,
    description: "Nasi goreng bumbu racik istimewa dengan telur mata sapi, suwiran ayam, dan kerupuk.",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    rating: 4.8,
    soldCount: 980,
    categoryId: "heavy",
  },
  {
    id: 103,
    canteenId: 2,
    canteenName: "Kedai Kopi Kampus",
    name: "Kopi Susu Gula Aren Barista",
    price: 12000,
    originalPrice: 15000,
    description: "Espresso robusta lokal dipadu susu creamy dan manis legit gula aren murni.",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    rating: 4.9,
    soldCount: 2310,
    categoryId: "drinks",
  },
  {
    id: 104,
    canteenId: 3,
    canteenName: "Ayam Geprek Mas Bro",
    name: "Paket Ayam Geprek Keju Leleh",
    price: 22000,
    description: "Ayam geprek pedas level 1-5 berlumur lelehan keju mozarella gurih nikmat.",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    rating: 4.7,
    soldCount: 860,
    categoryId: "heavy",
  },
  {
    id: 105,
    canteenId: 2,
    canteenName: "Kedai Kopi Kampus",
    name: "Matcha Latte Creamy Ice",
    price: 14000,
    description: "Bubuk teh hijau matcha Jepang asli dengan susu segar lembut dan manis pas.",
    imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    rating: 4.8,
    soldCount: 740,
    categoryId: "drinks",
  },
];

// TODO: ganti dengan API - Data keranjang belanja
export const mockCartItems: CartItem[] = [
  {
    id: "cart-1",
    menuItem: mockPopularMenus[0],
    quantity: 1,
    notes: "Sambal matah dipisah ya bu",
  },
  {
    id: "cart-2",
    menuItem: mockPopularMenus[2],
    quantity: 1,
    notes: "Less sugar, es sedang",
  },
];

// TODO: ganti dengan API - Total jumlah item di keranjang
export const mockCartCount: number = mockCartItems.reduce((acc, item) => acc + item.quantity, 0);

// TODO: ganti dengan API - Daftar voucher yang dapat ditukarkan (redeem)
export const mockRedeemableVouchers: VoucherItem[] = [
  {
    id: "vouch-promo-1",
    code: "KANTIN10",
    title: "Potongan Spesial Rp10.000",
    discount: 10000,
    minSpend: 30000,
    validUntil: "31 Des 2026",
  },
  {
    id: "vouch-promo-2",
    code: "HEMAT5",
    title: "Diskon KantinGO Rp5.000",
    discount: 5000,
    minSpend: 15000,
    validUntil: "31 Des 2026",
  },
  {
    id: "vouch-promo-3",
    code: "MABASTART",
    title: "Diskon Mahasiswa Baru 20%",
    discount: 5000,
    minSpend: 20000,
    validUntil: "30 Nov 2026",
  },
  {
    id: "vouch-promo-4",
    code: "LUNCHDEAL",
    title: "Potongan Makan Siang Rp4.000",
    discount: 4000,
    minSpend: 15000,
    validUntil: "25 Nov 2026",
  },
];

// TODO: ganti dengan API - Daftar voucher yang sudah dimiliki pengguna
export const mockInitialUserVouchers: VoucherItem[] = [
  {
    id: "my-vouch-1",
    code: "WELCOMEKGO",
    title: "Voucher Selamat Datang Rp5.000",
    discount: 5000,
    minSpend: 15000,
    validUntil: "31 Des 2026",
    status: "active",
  },
  {
    id: "my-vouch-2",
    code: "FREEOK3",
    title: "Gratis Minuman Segar Rp3.000",
    discount: 3000,
    minSpend: 10000,
    validUntil: "15 Des 2026",
    status: "active",
  },
  {
    id: "my-vouch-3",
    code: "KOPIASIK",
    title: "Potongan Kopi Kampus Rp2.000",
    discount: 2000,
    minSpend: 12000,
    validUntil: "20 Des 2026",
    status: "active",
  },
];

// TODO: ganti dengan API - Riwayat voucher yang telah digunakan atau kedaluwarsa
export const mockHistoryVouchers: VoucherItem[] = [
  {
    id: "hist-vouch-1",
    code: "KANTINHEMAT",
    title: "Diskon Makan Siang Rp5.000",
    discount: 5000,
    minSpend: 15000,
    validUntil: "5 Nov 2026",
    status: "used",
  },
  {
    id: "hist-vouch-2",
    code: "PROMOOKTOBER",
    title: "Potongan Ongkos Pick-Up Rp3.000",
    discount: 3000,
    minSpend: 10000,
    validUntil: "31 Okt 2026",
    status: "expired",
  },
  {
    id: "hist-vouch-3",
    code: "MABASTART",
    title: "Diskon Mahasiswa Baru 20%",
    discount: 5000,
    minSpend: 20000,
    validUntil: "15 Okt 2026",
    status: "used",
  },
];

// TODO: ganti dengan API - Voucher potongan harga katalog
export const mockVouchers: VoucherItem[] = [
  {
    id: "vouch-1",
    code: "MABASTART",
    title: "Diskon Mahasiswa Baru 20%",
    discount: 5000,
    minSpend: 20000,
    validUntil: "30 Nov 2026",
  },
  {
    id: "vouch-2",
    code: "LUNCHDEAL",
    title: "Potongan Makan Siang Rp4.000",
    discount: 4000,
    minSpend: 15000,
    validUntil: "25 Nov 2026",
  },
];

// TODO: ganti dengan API - Jumlah voucher yang dimiliki pengguna
export const mockUserVoucherCount: number = mockInitialUserVouchers.length;
