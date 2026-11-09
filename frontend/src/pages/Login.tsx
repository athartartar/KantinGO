import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { loginWithGoogle } from "../lib/firebase";
import { setToken } from "../lib/auth";
import logoUrl from "../../logo_KantinGO.png";

/**
 * Halaman login. Tersedia hanya satu opsi: login dengan Google.
 *
 * Alur:
 * 1. Firebase popup sign-in → dapatkan Firebase ID token
 * 2. Kirim idToken ke backend POST /api/auth/google
 * 3. Backend verifikasi & kembalikan JWT aplikasi (data.token)
 * 4. Simpan JWT aplikasi ke localStorage dan arahkan ke beranda
 */
export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Jika sudah login, arahkan ke beranda
  if (typeof window !== "undefined" && localStorage.getItem("kantingo_auth_token")) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Login dengan Google via Firebase popup
      const { token: idToken } = await loginWithGoogle();

      // 2. Kirim ID token ke backend untuk diverifikasi dan ditukarkan JWT aplikasi
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        data?: { token?: string; user?: unknown };
      };

      if (!res.ok) {
        throw new Error(body.message || "Login Google gagal");
      }

      const token = body.data?.token;
      if (!token) {
        throw new Error("Token tidak diterima dari server");
      }

      // 3. Simpan JWT aplikasi dan arahkan ke beranda
      setToken(token);
      navigate("/", { replace: true });
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Proses login dibatalkan karena jendela login ditutup.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Jendela popup diblokir oleh peramban. Harap izinkan popup.");
      } else if (err?.code === "auth/network-request-failed") {
        setError("Koneksi jaringan bermasalah. Silakan periksa koneksi internet Anda.");
      } else {
        setError(err.message || "Gagal login dengan Google. Coba lagi nanti.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
      {/* Tampilan pesan error jika login gagal */}
      {error && (
        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 max-w-md w-full text-center">
          <img src={logoUrl} alt="KantinGO" className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">Login Gagal</h2>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-[#4285F4] bg-white border border-[#4285F4]/20 rounded-xl shadow-sm hover:bg-[#4285F4]/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Coba Lagi"
            )}
          </button>
          <button
            onClick={() => navigate("/splash", { replace: true })}
            className="mt-3 text-xs text-navy/40 hover:text-navy underline underline-offset-4"
          >
            Kembali ke layar awal
          </button>
        </div>
      )}

      {/* Form login utama */}
      {!error && (
        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 max-w-md w-full text-center">
          <img src={logoUrl} alt="KantinGO" className="w-20 h-20 mx-auto mb-6" />

          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">
            Selamat datang di
          </h1>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-6">
            KantinGO
          </h1>
          <p className="text-navy/60 text-sm mb-10">
            Silakan masuk dengan akun Google Anda untuk melanjutkan.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold text-[#4285F4] bg-white border border-[#4285F4]/20 rounded-xl shadow-sm hover:bg-[#4285F4]/5 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sedang memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          <p className="mt-8 text-xs text-navy/40">
            Dengan melanjutkan, Anda setuju dengan ketentuan kami.
          </p>
        </div>
      )}
    </div>
  );
}

