import {
  FileText,
  HelpCircle,
  Info,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function ProfileInfo() {
  const { slug } = useParams<{ slug: string }>();

  // Konten Bantuan
  if (slug === "bantuan") {
    return (
      <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
        <PageHeader title="Pusat Bantuan" backTo="/profile" />

        <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Pertanyaan Umum (FAQ)</h2>
              <p className="text-xs text-navy/60">
                Panduan praktis memesan dan mengambil makanan di KantinGO
              </p>
            </div>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-3 first:pt-0 space-y-1">
              <h3 className="text-sm font-bold text-navy">
                Bagaimana cara memesan makanan di KantinGO?
              </h3>
              <p className="text-xs text-navy/70 leading-relaxed">
                Pilih warung kantin tujuan, pilih menu yang diinginkan beserta pilihan add-on (level pedas, porsi nasi, dll.), lalu masukkan ke keranjang. Pada halaman Checkout, tentukan perkiraan waktu pengambilan dan lakukan pembayaran melalui QRIS.
              </p>
            </div>

            <div className="pt-4 space-y-1">
              <h3 className="text-sm font-bold text-navy">
                Kapan pesanan saya bisa diambil?
              </h3>
              <p className="text-xs text-navy/70 leading-relaxed">
                Kamu dapat memantau status pesanan di menu <strong>Status</strong>. Saat status berubah menjadi <em>"Sudah Siap"</em>, silakan menuju counter warung dan tunjukkan nomor antrean / kode pesanan pada struk pick up ke pelayan warung.
              </p>
            </div>

            <div className="pt-4 space-y-1">
              <h3 className="text-sm font-bold text-navy">
                Metode pembayaran apa saja yang didukung?
              </h3>
              <p className="text-xs text-navy/70 leading-relaxed">
                Saat ini KantinGO mendukung pembayaran praktis berbasis QRIS Nasional (GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI, dan seluruh m-banking).
              </p>
            </div>

            <div className="pt-4 space-y-1">
              <h3 className="text-sm font-bold text-navy">
                Bagaimana jika ada kendala dengan pesanan?
              </h3>
              <p className="text-xs text-navy/70 leading-relaxed">
                Kamu dapat langsung bertanya kepada mitra kantin bersangkutan di lokasi atau menghubungi layanan tim bantuan KantinGO melalui kanal di bawah ini.
              </p>
            </div>
          </div>

          {/* Kontak Dukungan */}
          <div className="bg-surface rounded-2xl p-4 border border-blue-100 space-y-2">
            <span className="text-xs font-bold text-navy uppercase tracking-wider block">
              Hubungi Layanan Pengguna
            </span>
            <div className="space-y-1.5 text-xs text-navy/70">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>support@kantingo.campus.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>WhatsApp Helpdesk: +62 812-3456-7890</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Konten Syarat & Ketentuan
  if (slug === "syarat-ketentuan") {
    return (
      <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
        <PageHeader title="Syarat & Ketentuan" backTo="/profile" />

        <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Ketentuan Layanan</h2>
              <p className="text-xs text-navy/60">
                Pembaruan terakhir: November 2026
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-navy/80 leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-bold text-navy">1. Akun Civitas Akademika</h3>
              <p>
                Layanan KantinGO diperuntukkan bagi mahasiswa, dosen, dan staf kampus untuk mempermudah pemesanan makanan kantin tanpa antrean fisik yang panjang.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-navy">2. Ketepatan Waktu Pengambilan</h3>
              <p>
                Pengguna diharapkan mengambil pesanan sesuai waktu estimasi pengambilan yang dipilih agar kualitas dan kehangatan makanan tetap optimal.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-navy">3. Pembayaran & Konfirmasi</h3>
              <p>
                Setiap transaksi yang telah diverifikasi melalui QRIS bersifat final dan diteruskan secara otomatis ke dapur mitra kantin.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-navy">4. Tanggung Jawab Menu Makanan</h3>
              <p>
                Ketersediaan bahan, rasa, dan higienitas menu makanan merupakan tanggung jawab masing-masing mitra kantin kampus yang bersangkutan.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Konten Tentang KantinGO
  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
      <PageHeader title="Tentang KantinGO" backTo="/profile" />

      <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6 text-center">
        {/* Logo Brand Besar */}
        <div className="space-y-2">
          <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
            <span className="text-2xl font-black tracking-tight">
              K<span className="text-lime">GO</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-navy tracking-tight">
            Kantin<span className="text-primary">GO</span>
          </h2>
          <span className="inline-block text-xs font-bold text-primary bg-surface px-3 py-1 rounded-full border border-blue-100">
            Versi Prototype 1.0 (Technopreneurship)
          </span>
        </div>

        {/* Deskripsi */}
        <div className="space-y-3 text-xs sm:text-sm text-navy/70 leading-relaxed text-left">
          <p>
            <strong>KantinGO</strong> adalah aplikasi pemesanan makanan berbasis web progresif yang dirancang untuk mengatasi antrean panjang di kantin kampus, meningkatkan efisiensi waktu istirahat mahasiswa, serta mendukung digitalisasi UMKM mitra kantin.
          </p>
          <p>
            Melalui fitur pemesanan di awal (*pre-order*), estimasi waktu pick-up presisi, pembayaran QRIS instan, dan struk digital, mahasiswa dapat menikmati makanan favorit tanpa khawatir kehabisan waktu istirahat kuliah.
          </p>
        </div>

        {/* Info Kelompok / Technopreneurship */}
        <div className="bg-surface rounded-2xl p-4 border border-blue-100 text-left space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Karya Technopreneurship - Kelompok 1</span>
          </div>
          <ul className="text-xs text-navy/70 space-y-1 list-disc list-inside">
            <li>Muhammad Athar Rizwan Alfaiz</li>
            <li>Jeremy Hasintongan</li>
            <li>Muhammad Reis Rajaana Atallah</li>
            <li>Radhitya Fadlurrahman Johari</li>
            <li>Desvia Maharani Kurniawan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
