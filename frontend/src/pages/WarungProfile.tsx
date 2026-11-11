import {
  AlertCircle,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  Star,
  Store,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StarRating from "../components/StarRating";
import { getWarungById } from "../lib/mock/warung";
import { calculateWarungStats, getStoredReviews } from "../lib/mock/reviews";
import type { Review } from "../lib/mock/types";

export default function WarungProfile() {
  const { warungId } = useParams<{ warungId: string }>();

  // Ambil data warung dari mock
  const warung = useMemo(() => {
    return warungId ? getWarungById(warungId) : undefined;
  }, [warungId]);

  // Ambil daftar ulasan warung dari localStorage (otomatis termasuk review baru yang di-submit)
  const reviews = useMemo<Review[]>(() => {
    if (!warungId) return [];
    const all = getStoredReviews();
    return all.filter((r) => String(r.warungId) === String(warungId));
  }, [warungId]);

  // Hitung rating rata-rata dan total ulasan dinamis
  const stats = useMemo(() => {
    if (!warungId) return { ratingRataRata: 4.8, jumlahUlasan: 0 };
    return calculateWarungStats(warungId, reviews);
  }, [warungId, reviews]);

  // Hitung distribusi bintang 5 sampai 1
  const distribution = useMemo(() => {
    const total = reviews.length;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { star, count, percentage };
    });
  }, [reviews]);

  if (!warung) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16 text-center space-y-4">
        <PageHeader title="Warung Tidak Ditemukan" backTo="/warung" />
        <div className="bg-white border border-blue-100 rounded-3xl p-8 max-w-md mx-auto shadow-soft space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-navy">Mitra Kantin Tidak Ditemukan</h2>
          <p className="text-xs text-navy/60">
            Profil warung yang kamu cari tidak terdaftar atau sudah tidak aktif.
          </p>
          <div className="pt-2">
            <Link
              to="/warung"
              className="inline-flex py-2.5 px-6 rounded-full bg-primary text-white text-xs font-bold"
            >
              Lihat Daftar Warung
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const warungNama = warung.nama || warung.name || "Kantin Kampus";
  const warungLogo =
    warung.logo ||
    warung.imageUrl ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80";
  const warungLokasi = warung.location || "Kantin Kampus";
  const warungJamBuka = warung.jamBuka || "08:00 - 17:00";
  const warungDeskripsi =
    warung.deskripsi ||
    "Menyajikan aneka hidangan lezat dan minuman segar dengan harga terjangkau untuk seluruh civitas akademika kampus.";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8 space-y-6 animate-fadeIn pb-24 md:pb-12">
      {/* Header Halaman dengan Tombol Back ke Detail Warung */}
      <PageHeader
        title={`Profil ${warungNama}`}
        backTo={`/warung/${warung.id}`}
      />

      {/* ==================================================== */}
      {/* HEADER PROFIL WARUNG (Wireframe Warung A Profil)    */}
      {/* Logo, Nama Warung, Pill Kecil (Kategori & Jam Buka) */}
      {/* ==================================================== */}
      <section className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
        {/* Logo Warung */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-blue-100 shadow-xs">
          <img
            src={warungLogo}
            alt={warungNama}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informasi Utama */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
              Mitra Kantin Terverifikasi
            </span>
            <h1 className="text-xl md:text-2xl font-black text-navy tracking-tight truncate">
              {warungNama}
            </h1>
          </div>

          {/* Pill Kecil Kategori & Jam Buka */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Buka: {warungJamBuka}</span>
            </span>

            {(warung.kategori || warung.categories || []).map((kat, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold bg-surface text-navy/70 px-3 py-1 rounded-full border border-blue-100/80"
              >
                {kat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* LAYOUT RESPONSIVE:                                   */}
      {/* Mobile: 1 kolom vertical.                           */}
      {/* Desktop (lg): 2 Kolom (Kiri Info & Rating Sticky,   */}
      {/*               Kanan List Kartu Ulasan)              */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================== */}
        {/* KOLOM KIRI (lg:col-span-5): Deskripsi & Rating     */}
        {/* ================================================== */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Kartu Deskripsi Warung */}
          <div className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-soft space-y-4">
            <h2 className="text-base font-bold text-navy flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <span>Tentang Warung</span>
            </h2>

            <p className="text-xs sm:text-sm text-navy/70 leading-relaxed">
              {warungDeskripsi}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs sm:text-sm text-navy/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Lokasi: <strong className="text-navy">{warungLokasi}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Jam Operasional:{" "}
                  <strong className="text-navy">{warungJamBuka}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Kartu Ringkasan Rating & Distribusi Bintang */}
          <div className="bg-white border border-blue-100 rounded-3xl p-5 md:p-6 shadow-soft space-y-5">
            <h2 className="text-base font-bold text-navy flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>Ringkasan Rating</span>
            </h2>

            {/* Nilai Besar + Bintang + Jumlah Ulasan */}
            <div className="flex items-center gap-5 pb-4 border-b border-slate-100">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-navy leading-none tracking-tight">
                  {stats.ratingRataRata.toFixed(1)}
                </div>
                <span className="text-[11px] font-bold text-navy/50 block mt-1">
                  dari 5.0
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(stats.ratingRataRata)
                          ? "fill-amber-400 text-amber-500"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-navy/70 font-semibold">
                  Berdasarkan {stats.jumlahUlasan} ulasan pembeli
                </p>
              </div>
            </div>

            {/* Distribusi Bintang 5 sampai 1 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-navy/60 uppercase tracking-wider block">
                Distribusi Ulasan
              </span>

              <div className="space-y-1.5">
                {distribution.map((dist) => (
                  <div
                    key={dist.star}
                    className="flex items-center gap-2.5 text-xs text-navy/70"
                  >
                    <div className="flex items-center gap-1 w-7 shrink-0 font-bold">
                      <span>{dist.star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>

                    {/* Progress Bar Persentase */}
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>

                    <span className="w-9 text-right font-medium text-[11px] text-navy/50">
                      {dist.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* KOLOM KANAN (lg:col-span-7): List Kartu Ulasan     */}
        {/* ================================================== */}
        <section
          aria-labelledby="daftar-ulasan-heading"
          className="lg:col-span-7 space-y-4"
        >
          <div className="flex items-center justify-between pb-1">
            <h2
              id="daftar-ulasan-heading"
              className="text-lg md:text-xl font-bold text-navy flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Semua Ulasan ({reviews.length})</span>
            </h2>
            <span className="text-xs text-navy/50 font-medium">
              Diurutkan terbaru
            </span>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3.5">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white border border-blue-100 rounded-3xl p-5 shadow-soft space-y-3 hover:shadow-card transition-all"
                >
                  {/* Baris Atas: Avatar, Nama User, Tanggal, Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.avatarUrl ? (
                        <img
                          src={rev.avatarUrl}
                          alt={rev.namaUser}
                          className="w-10 h-10 rounded-full object-cover border border-blue-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface text-primary flex items-center justify-center font-bold text-sm border border-blue-100">
                          {rev.namaUser.charAt(0)}
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold text-sm text-navy">
                          {rev.namaUser}
                        </h3>
                        <span className="text-[11px] text-navy/50">
                          {rev.tanggal}
                        </span>
                      </div>
                    </div>

                    {/* Bintang Rating */}
                    <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-black text-amber-700 ml-0.5">
                        {rev.rating}
                      </span>
                    </div>
                  </div>

                  {/* Komentar Ulasan */}
                  <p className="text-xs sm:text-sm text-navy/80 leading-relaxed">
                    {rev.komentar}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            /* Empty State Ulasan */
            <div className="bg-white border border-blue-100 rounded-3xl p-10 text-center space-y-3 shadow-soft">
              <div className="w-14 h-14 rounded-full bg-surface text-primary flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-navy">
                Belum Ada Ulasan
              </h3>
              <p className="text-xs text-navy/60 max-w-sm mx-auto">
                Jadilah yang pertama mencoba makanan dari {warungNama} dan bagikan pengalamanmu!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
