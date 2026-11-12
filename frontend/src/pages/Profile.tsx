import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  Tag,
  Ticket,
  User as UserIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "../lib/orders";
import { useUser } from "../lib/user";
import { logout as authLogout } from "../lib/auth";

export default function Profile() {
  const navigate = useNavigate();
  const { user, settings, updateSettings, logout } = useUser();
  const { orders } = useOrders();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Jumlah pesanan yang sudah selesai diambil
  const completedOrdersCount = orders.filter(
    (order) => order.status === "selesai"
  ).length;

  const formattedPoints = new Intl.NumberFormat("id-ID").format(user.poin);

  // Handler konfirmasi logout
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    authLogout(); // Bersihkan token autentikasi
    navigate("/login");
  };

  return (
    <div className="w-full pb-24 md:pb-12 animate-fadeIn">
      {/* ==================================================== */}
      {/* 1. HEADER BIRU GAYA KANTINGO                         */}
      {/* ==================================================== */}
      <header className="relative w-full bg-gradient-to-r from-primary via-primary to-blue-bright text-white rounded-b-[2rem] md:rounded-b-none shadow-md">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-6 md:pt-8 md:pb-8 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-lime uppercase tracking-wider block">
              Akun Pengguna
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Profil
            </h1>
          </div>
          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition-all border border-white/20"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profil</span>
          </Link>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. KONTEN UTAMA                                      */}
      {/* Mobile: 1 kolom. Desktop (lg): 2 Kolom               */}
      {/* (Kiri: Info & Ringkasan Sticky, Kanan: Daftar Menu)  */}
      {/* ==================================================== */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-5 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================ */}
          {/* KOLOM KIRI (lg:col-span-5): Kartu Profil & Poin  */}
          {/* ================================================ */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
            {/* Kartu Profil Utama */}
            <div className="bg-white border border-blue-100 rounded-3xl p-5 sm:p-6 shadow-soft flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Avatar Kotak Rounded */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl overflow-hidden bg-surface border-2 border-primary/20 shadow-xs flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-primary">
                      {user.nama.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Nama & Email */}
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-navy truncate">
                    {user.nama}
                  </h2>
                  <p className="text-xs text-navy/60 truncate font-medium">
                    {user.email}
                  </p>
                  <span className="inline-block text-[11px] font-bold text-primary bg-surface px-2 py-0.5 rounded-md border border-blue-100 mt-1 font-mono">
                    @{user.username || "pengguna"}
                  </span>
                </div>
              </div>

              {/* Tombol Kecil Edit */}
              <Link
                to="/profile/edit"
                className="w-9 h-9 rounded-2xl bg-surface hover:bg-blue-100/60 active:scale-95 text-primary flex items-center justify-center shrink-0 border border-blue-100 transition-all"
                title="Edit Profil"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            </div>

            {/* Ringkasan Singkat: Poin & Pesanan Selesai */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Poin Reward */}
              <Link
                to="/voucher"
                className="bg-white border border-blue-100 rounded-3xl p-4 sm:p-5 shadow-soft hover:shadow-card hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-navy/50 uppercase tracking-wider">
                    Poin Saya
                  </span>
                  <div className="w-8 h-8 rounded-full bg-lime text-navy flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xl sm:text-2xl font-black text-navy group-hover:text-primary transition-colors">
                    {formattedPoints}
                  </div>
                  <span className="text-[11px] text-primary font-bold">
                    Tukar Voucher →
                  </span>
                </div>
              </Link>

              {/* Pesanan Selesai */}
              <Link
                to="/status"
                state={{ defaultTab: "selesai" }}
                className="bg-white border border-blue-100 rounded-3xl p-4 sm:p-5 shadow-soft hover:shadow-card hover:border-primary/40 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-navy/50 uppercase tracking-wider">
                    Selesai
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xl sm:text-2xl font-black text-navy group-hover:text-primary transition-colors">
                    {completedOrdersCount} Pesanan
                  </div>
                  <span className="text-[11px] text-navy/60 font-medium">
                    Lihat Riwayat →
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* ================================================ */}
          {/* KOLOM KANAN (lg:col-span-7): Daftar Menu Profil  */}
          {/* ================================================ */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Kelompok: Akun */}
            <section className="space-y-2.5">
              <span className="text-xs font-bold text-navy/50 uppercase tracking-wider px-1 block">
                Akun
              </span>
              <div className="bg-white border border-blue-100 rounded-3xl shadow-soft divide-y divide-slate-100 overflow-hidden">
                <Link
                  to="/profile/edit"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                        Edit Profil
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Nama, username, email & nomor HP
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile/password"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                        Ubah Kata Sandi
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Perbarui kata sandi akun untuk keamanan
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                        Lokasi Kantin Favorit
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Kantin Utama Gedung A (Lantai 1)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </section>

            {/* 2. Kelompok: Aktivitas */}
            <section className="space-y-2.5">
              <span className="text-xs font-bold text-navy/50 uppercase tracking-wider px-1 block">
                Aktivitas
              </span>
              <div className="bg-white border border-blue-100 rounded-3xl shadow-soft divide-y divide-slate-100 overflow-hidden">
                <Link
                  to="/status"
                  state={{ defaultTab: "selesai" }}
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                        Riwayat Pesanan
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Daftar transaksi pesanan yang telah selesai
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/voucher/saya"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                        Voucher Saya
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Kupon diskon yang siap digunakan
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile/reviews"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                        Ulasan Saya
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Review dan rating makanan yang telah kamu berikan
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </section>

            {/* 3. Kelompok: Pengaturan */}
            <section className="space-y-2.5">
              <span className="text-xs font-bold text-navy/50 uppercase tracking-wider px-1 block">
                Pengaturan
              </span>
              <div className="bg-white border border-blue-100 rounded-3xl shadow-soft divide-y divide-slate-100 overflow-hidden">
                {/* Toggle Notifikasi Pesanan */}
                <div className="p-4 sm:p-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy block">
                        Notifikasi Pesanan
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Pemberitahuan saat pesanan siap diambil
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        notifikasiPesanan: !settings.notifikasiPesanan,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                      settings.notifikasiPesanan ? "bg-primary" : "bg-slate-300"
                    }`}
                    role="switch"
                    aria-checked={settings.notifikasiPesanan}
                    aria-label="Toggle Notifikasi Pesanan"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.notifikasiPesanan
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle Notifikasi Promo */}
                <div className="p-4 sm:p-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy block">
                        Notifikasi Promo
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Info diskon voucher dan flash sale kantin
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        notifikasiPromo: !settings.notifikasiPromo,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                      settings.notifikasiPromo ? "bg-primary" : "bg-slate-300"
                    }`}
                    role="switch"
                    aria-checked={settings.notifikasiPromo}
                    aria-label="Toggle Notifikasi Promo"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settings.notifikasiPromo
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Bahasa */}
                <div className="p-4 sm:p-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy block">
                        Bahasa
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Pilihan bahasa aplikasi
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary bg-surface px-2.5 py-1 rounded-full border border-blue-100">
                    Bahasa Indonesia
                  </span>
                </div>

                {/* Tema */}
                <div className="p-4 sm:p-4.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-navy block">
                        Tema
                      </span>
                      <span className="text-[11px] text-navy/50">
                        Mode tampilan antarmuka
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary bg-surface px-2.5 py-1 rounded-full border border-blue-100">
                    Terang
                  </span>
                </div>
              </div>
            </section>

            {/* 4. Kelompok: Lainnya */}
            <section className="space-y-2.5">
              <span className="text-xs font-bold text-navy/50 uppercase tracking-wider px-1 block">
                Lainnya
              </span>
              <div className="bg-white border border-blue-100 rounded-3xl shadow-soft divide-y divide-slate-100 overflow-hidden">
                <Link
                  to="/profile/info/bantuan"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                      Pusat Bantuan & FAQ
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile/info/syarat-ketentuan"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                      Syarat & Ketentuan
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile/info/tentang"
                  className="p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-navy group-hover:text-primary transition-colors block">
                      Tentang KantinGO
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </section>

            {/* Tombol Keluar (Destruktif tapi tetap selaras dengan palet) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full py-4 px-6 rounded-3xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-sm sm:text-base shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ==================================================== */}
      {/* MODAL DIALOG KONFIRMASI KELUAR                       */}
      {/* ==================================================== */}
      {isLogoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl animate-scaleUp text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <LogOut className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-navy">Konfirmasi Keluar</h3>
              <p className="text-xs sm:text-sm text-navy/70 leading-relaxed">
                Apakah kamu yakin ingin keluar dari akun KantinGO? Kamu bisa masuk kembali kapan saja.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-3.5 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 active:scale-98 transition-all cursor-pointer"
              >
                Ya, Keluar
              </button>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-navy text-xs sm:text-sm font-semibold active:scale-98 transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL LOKASI KANTIN FAVORIT                          */}
      {/* ==================================================== */}
      {isLocationModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-navy">Lokasi Favorit</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-navy/60 hover:text-navy cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-surface rounded-2xl p-4 border border-blue-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-primary block">
                  Lokasi Utama Saat Ini
                </span>
                <p className="font-bold text-navy">
                  Kantin Utama Gedung A (Lantai 1)
                </p>
                <p className="text-navy/60 text-xs">
                  Area kantin pusat dekat lobi akademik universitas.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-navy/40 block">
                  Alternatif Food Court
                </span>
                <p className="font-semibold text-navy">
                  Food Court Perpustakaan Pusat
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-3 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 active:scale-98 transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
