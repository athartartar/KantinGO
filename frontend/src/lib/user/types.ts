export interface User {
  id?: string;
  nama: string;
  username: string;
  email: string;
  noHp?: string;
  avatar?: string;
  poin: number;
}

export interface Settings {
  notifikasiPesanan: boolean;
  notifikasiPromo: boolean;
  tema?: "terang";
}
