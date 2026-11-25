import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  ApiError,
  getDefaultHomeForUser,
  isMockMode,
  loginDummy,
} from "../lib/auth";
import { authApi } from "../lib/api";
import logoUrl from "../../logo_KantinGO.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [adminNotice, setAdminNotice] = useState(false);

  const fromPath = (location.state as { from?: { pathname?: string } } | null)
    ?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (isMockMode()) {
      loginDummy();
      navigate(fromPath || "/", { replace: true });
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      const nextErrors: Record<string, string> = {};
      if (!trimmedEmail) nextErrors.email = "Email wajib diisi.";
      if (!password) nextErrors.password = "Kata sandi wajib diisi.";
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(trimmedEmail, password);
      if (res.user.role === "admin") {
        setAdminNotice(true);
        return;
      }

      if (res.user.role === "warung_owner") {
        navigate(getDefaultHomeForUser(res.user), { replace: true });
        return;
      }

      const safeRedirect =
        fromPath &&
        !fromPath.startsWith("/login") &&
        !fromPath.startsWith("/register") &&
        !fromPath.startsWith("/mitra")
          ? fromPath
          : "/";
      navigate(safeRedirect, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Email atau kata sandi salah.");
        } else if (err.status === 429) {
          setError("Terlalu banyak percobaan, coba lagi nanti");
        } else if (err.status === 422 && err.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, messages] of Object.entries(err.errors)) {
            if (Array.isArray(messages) && messages.length > 0) {
              mapped[key] = messages[0];
            }
          }
          setFieldErrors(mapped);
          if (Object.keys(mapped).length === 0) {
            setError(err.message);
          }
        } else {
          setError(err.message || "Gagal masuk. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (adminNotice) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-card p-6 md:p-10 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-navy">Akun Admin Terdeteksi</h1>
            <p className="text-sm text-navy/70 leading-relaxed">
              Pengelolaan sistem admin KantinGO menggunakan panel admin terpisah.
              Anda tetap dapat melanjutkan ke beranda aplikasi pembeli.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Lanjut ke Beranda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-card p-6 md:p-10 max-w-md w-full">
        <div className="text-center">
          <img src={logoUrl} alt="KantinGO" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-1">Masuk ke KantinGO</h1>
          <p className="text-navy/60 text-xs mb-6">
            Pesan makanan kantin kampus lebih cepat tanpa antre.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-navy mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required={!isMockMode()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kampus.ac.id"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                fieldErrors.email
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-navy mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required={!isMockMode()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border text-sm focus:outline-none ${
                  fieldErrors.password
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-200 focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/45 hover:text-navy transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Masuk ke KantinGO</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-navy/65 mt-6">
          Belum punya akun?{" "}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
