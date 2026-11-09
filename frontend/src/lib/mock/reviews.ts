import type { Review } from "./types";

export const initialReviews: Review[] = [
  // ==========================================
  // Kantin Bu Siti (warungId: "1") - Min 5 reviews
  // ==========================================
  {
    id: "rev-siti-1",
    warungId: "1",
    namaUser: "Ahmad Zaki",
    rating: 5,
    komentar: "Ayam geprek sambal matahnya the best di kampus! Porsi nasinya banyak dan sambalnya fresh banget.",
    tanggal: "2 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-siti-2",
    warungId: "1",
    namaUser: "Dinda Maharani",
    rating: 5,
    komentar: "Nasi goreng spesialnya enak banget, telurnya pas setengah matang. Pelayanan Bu Siti ramah selalu.",
    tanggal: "4 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-siti-3",
    warungId: "1",
    namaUser: "Bima Pratama",
    rating: 4,
    komentar: "Soto ayam lamongannya gurih kuahnya kaya koya rempah. Enak disantap pas makan siang pas hujan.",
    tanggal: "6 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-siti-4",
    warungId: "1",
    namaUser: "Siti Rahma",
    rating: 5,
    komentar: "Tempe mendoannya anget-anget waktu di-pickup, sambal kecap rawitnya nampol. Recommended!",
    tanggal: "7 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-siti-5",
    warungId: "1",
    namaUser: "Fikri Ramadhan",
    rating: 5,
    komentar: "Sangat praktis pesan lewat KantinGO, gak perlu antre berjubel lagi jam makan siang.",
    tanggal: "8 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },

  // ==========================================
  // Kedai Kopi Kampus (warungId: "2") - Min 5 reviews
  // ==========================================
  {
    id: "rev-kopi-1",
    warungId: "2",
    namaUser: "Sarah Jessica",
    rating: 5,
    komentar: "Kopi susu arennya juara! Creamy tapi rasa espresso robustanya tetap mantap kerasa di lidah.",
    tanggal: "3 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-kopi-2",
    warungId: "2",
    namaUser: "Rian Saputra",
    rating: 5,
    komentar: "Matcha Latte-nya beneran otentik gak cuma manis gula. Enak banget buat nemenin nugas di perpus.",
    tanggal: "5 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-kopi-3",
    warungId: "2",
    namaUser: "Clara Anindya",
    rating: 4,
    komentar: "Croissant butternya renyah flakey, cocok dicocol ke kopi susu panas. Baristanya cekatan.",
    tanggal: "6 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-kopi-4",
    warungId: "2",
    namaUser: "Dimas Anggara",
    rating: 5,
    komentar: "Americano double shot bikin melek seharian pas ujian tengah semester. Harga mahasiswa!",
    tanggal: "7 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-kopi-5",
    warungId: "2",
    namaUser: "Nadia Putri",
    rating: 5,
    komentar: "Roti bakar cokelat kejunya melimpah! Waktu pick-up langsung siap di counter sayap barat.",
    tanggal: "9 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
  },

  // ==========================================
  // Ayam Geprek Mas Bro (warungId: "3") - Min 5 reviews
  // ==========================================
  {
    id: "rev-bro-1",
    warungId: "3",
    namaUser: "Bayu Wicaksono",
    rating: 5,
    komentar: "Level 5 keju lelehnya nendang banget! Keju mozarellanya tebal dan beneran melted.",
    tanggal: "1 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-bro-2",
    warungId: "3",
    namaUser: "Vania Aurelia",
    rating: 4,
    komentar: "Paket hemat komplit udah dapet es jeruk, tahu tempe kenyang pol cuma 18 ribu.",
    tanggal: "4 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-bro-3",
    warungId: "3",
    namaUser: "Galih Perkasa",
    rating: 5,
    komentar: "Kulit krispi pedas gurihnya nagih banget buat cemilan tambahan sambil nunggu kelas.",
    tanggal: "5 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-bro-4",
    warungId: "3",
    namaUser: "Tasya Kamila",
    rating: 5,
    komentar: "Sambal bawangnya gurih berminyak sedap, cabe rawitnya segar bukan cabe bubukan.",
    tanggal: "8 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "rev-bro-5",
    warungId: "3",
    namaUser: "Reza Mahendra",
    rating: 4,
    komentar: "Ayamnya kriuk garing di luar juicy di dalam. Mas Bro pelayanannya cepat dan rapi.",
    tanggal: "9 Nov 2026",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
  },
];

const REVIEWS_STORAGE_KEY = "kantingo_reviews_v1";

export function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Abaikan
  }
  return initialReviews;
}

export function saveStoredReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // Abaikan
  }
}

/**
 * Menghitung rating rata-rata dan total ulasan warung dari review
 */
export function calculateWarungStats(warungId: string, reviewsList: Review[] = getStoredReviews()) {
  const warungReviews = reviewsList.filter(
    (r) => String(r.warungId) === String(warungId)
  );

  const totalReviews = warungReviews.length;
  if (totalReviews === 0) {
    return {
      ratingRataRata: 0,
      jumlahUlasan: 0,
    };
  }

  const sumRating = warungReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = Math.round((sumRating / totalReviews) * 10) / 10;

  return {
    ratingRataRata: avg,
    jumlahUlasan: totalReviews,
  };
}

export function addStoredReview(review: Review): Review[] {
  const current = getStoredReviews();
  const updated = [review, ...current];
  saveStoredReviews(updated);
  return updated;
}
