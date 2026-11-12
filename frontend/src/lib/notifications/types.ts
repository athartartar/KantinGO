export interface AppNotification {
  id: string;
  orderId: string;
  jenis: "diproses" | "siap" | "diterima";
  judul: string;
  pesan: string;
  waktu: string; // ISO string
  sudahDibaca: boolean;
}
