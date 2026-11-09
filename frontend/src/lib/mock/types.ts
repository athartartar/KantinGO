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

  // Kompatibilitas dengan komponen eksisting
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
  jumlahUlasan?: number;
  jamBuka?: string;
  logo?: string;
  kategori?: string[];

  // Kompatibilitas dengan komponen eksisting
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
  groupId: string;
  groupJudul?: string;
  optionId: string;
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

  // Metadata pembantu tampilan
  menu?: Menu;
  warungNama?: string;

  // Kompatibilitas
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

  // Kompatibilitas
  code?: string;
  title?: string;
  discount?: number;
  minSpend?: number;
  validUntil?: string;
  status?: "active" | "used" | "expired";
}
