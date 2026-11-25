import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Store,
  User as UserIcon,
} from "lucide-react";
import {
  ApiError,
  getDefaultHomeForUser,
  isMockMode,
  loginDummy,
} from "../lib/auth";
import { authApi, canteensApi } from "../lib/api";
import { useUser } from "../lib/user";
import logoUrl from "../../logo_KantinGO.png";

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 10,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [role, setRole] = useState<"customer" | "partner">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [warungName, setWarungName] = useState("");
  const [canteenId, setCanteenId] = useState("");
  const [canteens, setCanteens] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isMockMode() && role === "partner" && canteens.length === 0) {
      canteensApi
        .list()
        .then((list) => {
          setCanteens(list);
          if (list.length > 0 && !canteenId) {
            setCanteenId(String(list[0].id));
          }
        })
        .catch(() => {});
    }
  }, [role, canteens.length, canteenId]);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const passedChecksCount = useMemo(
    () => Object.values(passwordChecks).filter(Boolean).length,
    [passwordChecks]
  );

  const strengthLabel = useMemo(() => {
    if (!password) return "";
    if (passedChecksCount <= 1) return "Lemah";
    if (passedChecksCount <= 3) return "Sedang";
    return "Kuat";
  }, [password, passedChecksCount]);

  const strengthColor = useMemo(() => {
    if (passedChecksCount <= 1) return "bg-rose-500";
    if (passedChecksCount <= 3) return "bg-amber-500";
    return "bg-emerald-500";
  }, [passedChecksCount]);

  const validateClient = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) errors.name = "Nama wajib diisi.";
    if (!trimmedEmail) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Format email tidak valid.";
    }

    if (role === "partner" && !trimmedPhone) {
      errors.phone = "Nomor telepon wajib diisi untuk pendaftaran mitra.";
    } else if (trimmedPhone && (trimmedPhone.length < 9 || trimmedPhone.length > 20)) {
      errors.phone = "Nomor telepon harus antara 9 hingga 20 karakter.";
    }

    if (!password) {
      errors.password = "Kata sandi wajib diisi.";
    } else if (
      !passwordChecks.minLength ||
      !passwordChecks.hasUpper ||
      !passwordChecks.hasLower ||
      !passwordChecks.hasNumber
    ) {
      errors.password =
        "Kata sandi minimal 10 karakter dan harus mengandung huruf besar, huruf kecil, serta angka.";
    }

    if (password !== passwordConfirmation) {
      errors.password_confirmation = "Konfirmasi kata sandi tidak cocok.";
    }

    if (role === "partner") {
      if (!warungName.trim()) {
        errors.warung_name = "Nama warung wajib diisi untuk pendaftaran mitra.";
      }
      if (!canteenId) {
        errors.canteen_id = "Lokasi kantin wajib dipilih untuk pendaftaran mitra.";
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (isMockMode()) {
      loginDummy();
      navigate("/", { replace: true });
      return;
    }

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        password_confirmation: passwordConfirmation,
        role,
        warung_name: role === "partner" ? warungName.trim() : undefined,
        canteen_id: role === "partner" && canteenId ? Number(canteenId) : undefined,
      });

      await refreshUser();
      navigate(getDefaultHomeForUser(res.user), { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
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
          setError(err.message || "Pendaftaran gagal. Silakan periksa data Anda.");
        }
      } else {
        setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-card p-6 md:p-10 max-w-md w-full">
        <div className="text-center">
          <img src={logoUrl} alt="KantinGO" className="w-14 h-14 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-navy mb-1">Daftar Akun KantinGO</h1>
          <p className="text-navy/60 text-xs mb-5">
            Pilih peran akun Anda untuk mulai menggunakan KantinGO.
          </p>
        </div>

        {/* Toggle dua kartu Pembeli vs Gabung jadi Mitra */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            type="button"
            onClick={() => {
              setRole("customer");
              setFieldErrors({});
              setError("");
            }}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
              role === "customer"
                ? "border-primary bg-blue-50/70 text-primary shadow-xs"
                : "border-slate-200 text-navy/70 hover:border-slate-300"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-xs font-bold">Pembeli</span>
            <span className="text-[10px] text-navy/55 leading-tight">
              Pesan makanan kantin
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("partner");
              setFieldErrors({});
              setError("");
            }}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
              role === "partner"
                ? "border-primary bg-blue-50/70 text-primary shadow-xs"
                : "border-slate-200 text-navy/70 hover:border-slate-300"
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-xs font-bold">Gabung jadi Mitra</span>
            <span className="text-[10px] text-navy/55 leading-tight">
              Kelola warung di kantin
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-navy mb-1">
              Nama Lengkap
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                fieldErrors.name
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-navy mb-1">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
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
            <label htmlFor="reg-phone" className="block text-xs font-semibold text-navy mb-1">
              Nomor HP {role === "partner" ? "" : "(Opsional)"}
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              required={role === "partner"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                fieldErrors.phone
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-primary"
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.phone}</p>
            )}
          </div>

          {role === "partner" && (
            <div className="space-y-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <label
                  htmlFor="reg-warung-name"
                  className="block text-xs font-semibold text-navy mb-1"
                >
                  Nama Warung
                </label>
                <input
                  id="reg-warung-name"
                  type="text"
                  required
                  value={warungName}
                  onChange={(e) => setWarungName(e.target.value)}
                  placeholder="Contoh: Warung Mbak Sari"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none ${
                    fieldErrors.warung_name
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-primary"
                  }`}
                />
                {fieldErrors.warung_name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.warung_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-canteen-id"
                  className="block text-xs font-semibold text-navy mb-1"
                >
                  Pilih Kantin
                </label>
                <select
                  id="reg-canteen-id"
                  required
                  value={canteenId}
                  onChange={(e) => setCanteenId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none ${
                    fieldErrors.canteen_id
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-primary"
                  }`}
                >
                  <option value="">Pilih lokasi kantin</option>
                  {canteens.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.canteen_id && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {fieldErrors.canteen_id}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-navy/65 leading-relaxed flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  Akun mitra perlu disetujui admin terlebih dahulu sebelum warung dapat
                  menerima pesanan.
                </span>
              </p>
            </div>
          )}

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-navy mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 10 karakter"
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

            {/* Indikator kekuatan password */}
            {password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(passedChecksCount / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-navy/70">{strengthLabel}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.minLength ? "text-emerald-600 font-semibold" : "text-navy/50"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Min. 10 karakter
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.hasUpper ? "text-emerald-600 font-semibold" : "text-navy/50"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Huruf besar (A-Z)
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.hasLower ? "text-emerald-600 font-semibold" : "text-navy/50"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Huruf kecil (a-z)
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordChecks.hasNumber ? "text-emerald-600 font-semibold" : "text-navy/50"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Angka (0-9)
                  </span>
                </div>
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-password-confirmation"
              className="block text-xs font-semibold text-navy mb-1"
            >
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                id="reg-password-confirmation"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi kata sandi"
                className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border text-sm focus:outline-none ${
                  fieldErrors.password_confirmation
                    ? "border-rose-400 focus:border-rose-500"
                    : "border-slate-200 focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi kata sandi"
                    : "Tampilkan konfirmasi kata sandi"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/45 hover:text-navy transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.password_confirmation && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {fieldErrors.password_confirmation}
              </p>
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
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-navy/65 mt-6">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
