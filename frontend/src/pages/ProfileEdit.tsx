import { CheckCircle2, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useUser } from "../lib/user";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();

  const [nama, setNama] = useState(user.nama);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [noHp, setNoHp] = useState(user.noHp || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setErrorMessage("Nama dan email wajib diisi.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    updateUser({
      nama: nama.trim(),
      username: username.trim().replace(/^@/, ""),
      email: email.trim(),
      noHp: noHp.trim(),
    });

    setToastMessage("Profil berhasil diperbarui!");

    setTimeout(() => {
      navigate("/profile");
    }, 1200);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
      {/* Header dengan tombol back ke /profile */}
      <PageHeader title="Edit Profil" backTo="/profile" />

      {/* Toast Notifikasi Sukses */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs md:text-sm px-4 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg animate-scaleUp">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Alert Error */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs md:text-sm px-4 py-3 rounded-2xl">
          {errorMessage}
        </div>
      )}

      {/* Card Form Edit Profil */}
      <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center text-center pb-2">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-surface border-2 border-primary/20 shadow-xs flex items-center justify-center mb-2">
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
            <span className="text-[11px] text-navy/50 font-medium">
              Foto profil terhubung dengan akun kampus
            </span>
          </div>

          {/* Field: Nama Lengkap */}
          <div className="space-y-1.5">
            <label
              htmlFor="nama"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              id="nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Field: Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-bold text-navy/40">
                @
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Field: Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Email Kampus <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kampus.ac.id"
              className="w-full px-4 py-3 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Field: No HP */}
          <div className="space-y-1.5">
            <label
              htmlFor="noHp"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Nomor Handphone / WhatsApp
            </label>
            <input
              id="noHp"
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="081234567890"
              className="w-full px-4 py-3 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
