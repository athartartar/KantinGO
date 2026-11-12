import { CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function ProfilePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!oldPassword) {
      setErrorMessage("Silakan masukkan kata sandi saat ini.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    // Mock ubah kata sandi berhasil
    setTimeout(() => {
      setIsSubmitting(false);
      setToastMessage("Kata sandi berhasil diubah!");
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    }, 600);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-6 pb-24 md:pb-12 animate-fadeIn">
      {/* Header Back ke /profile */}
      <PageHeader title="Ubah Kata Sandi" backTo="/profile" />

      {/* Toast Sukses */}
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

      {/* Card Form */}
      <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-surface text-primary flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy">Keamanan Akun</h2>
            <p className="text-xs text-navy/60">
              Gunakan kata sandi yang kuat untuk melindungi akun kantinmu
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kata Sandi Lama */}
          <div className="space-y-1.5">
            <label
              htmlFor="oldPassword"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Kata Sandi Saat Ini
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showOld ? "text" : "password"}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="w-full px-4 py-3 pr-11 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy cursor-pointer"
                aria-label="Lihat kata sandi"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Kata Sandi Baru */}
          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 pr-11 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy cursor-pointer"
                aria-label="Lihat kata sandi"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi Baru */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-navy uppercase tracking-wider block"
            >
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-4 py-3 pr-11 rounded-2xl bg-surface border border-blue-100 text-sm text-navy placeholder:text-navy/40 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy cursor-pointer"
                aria-label="Lihat kata sandi"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-primary hover:bg-blue-bright text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Memproses..." : "Perbarui Kata Sandi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
