export interface AddOnOption {
  id: string;
  nama: string;
  hargaTambahan: number;
}

export interface AddOnGroup {
  id: string;
  judul: string;
  tipe: "single" | "multiple";
  opsi: AddOnOption[];
  required?: boolean;
}

export interface Menu {
  id: string;
  warungId: string;
  nama: string;
  deskripsi: string;
  harga: number;
  gambar: string;
  kategori: string;
  addOnGroups: AddOnGroup[];
  name?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
  canteenId?: string | number;
  canteenName?: string;
  isAvailable?: boolean;
  rating?: number;
  soldCount?: number;
  categoryId?: string;
}

export interface Warung {
  id: string | number;
  nama?: string;
  rating: number;
  ratingRataRata?: number;
  jumlahUlasan?: number;
  jamBuka?: string;
  logo?: string;
  kategori?: string[];
  deskripsi?: string;
  name?: string;
  location?: string;
  isOpen?: boolean;
  reviewCount?: number;
  estimatedMinutes?: number;
  imageUrl?: string;
  categoryLabel?: string;
  categories?: string[];
}

export interface CartAddOn {
  groupId?: string;
  groupJudul?: string;
  optionId?: string;
  id?: string;
  nama: string;
  hargaTambahan: number;
}

export interface CartItem {
  id: string;
  menuId: string;
  warungId: string;
  jumlah: number;
  addOns: CartAddOn[];
  catatan?: string;
  hargaSatuan: number;
  menu?: Menu;
  warungNama?: string;
  quantity?: number;
  notes?: string;
  menuItem?: any;
}

export interface Voucher {
  id: string;
  kode: string;
  judul: string;
  tipe: "persen" | "nominal";
  nilai: number;
  minimalBelanja: number;
  code?: string;
  title?: string;
  discount?: number;
  minSpend?: number;
  validUntil?: string;
  status?: "active" | "used" | "expired";
}

export interface Review {
  id: string;
  warungId: string;
  namaUser: string;
  rating: number;
  komentar: string;
  tanggal: string;
  avatarUrl?: string;
}

export interface OrderItem {
  id?: string;
  menuId: string;
  nama: string;
  gambar: string;
  jumlah: number;
  hargaSatuan: number;
  addOns: CartAddOn[];
  catatan?: string;
  warungId?: string;
  menu?: Menu;
  quantity?: number;
}

export type OrderStatus = "diproses" | "siap" | "selesai";

export interface OrderReview {
  rating: number;
  komentar: string;
  dibuatPada: string;
}

export interface Order {
  id: string;
  kodePesanan: string;
  warungId: string;
  warungNama: string;
  items: OrderItem[];
  waktuPengambilan: string;
  voucher?: Voucher | { kode: string; judul: string; nilai: number } | null;
  subtotal: number;
  diskon: number;
  biayaLayanan: number;
  total: number;
  dibuatPada: string;
  status: OrderStatus;
  sudahDiulas: boolean;
  ulasan?: OrderReview;
}
