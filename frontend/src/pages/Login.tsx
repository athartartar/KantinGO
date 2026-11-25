import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Store, User as UserIcon } from "lucide-react";
import { getRole, isAuthenticated, isMockMode, loginDummy } from "../lib/auth";
import { authApi, canteensApi } from "../lib/api";
import logoUrl from "../../logo_KantinGO.png";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"customer" | "partner">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [warungName, setWarungName] = useState("");
  const [canteenId, setCanteenId] = useState<string>("");
  const [canteens, setCanteens] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      const currentRole = getRole();
      navigate(currentRole === "warung_owner" ? "/mitra" : "/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!isMockMode() && mode === "register" && role === "partner" && canteens.length === 0) {
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
  }, [mode, role, canteens.length, canteenId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isMockMode()) {
      loginDummy();
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const res = await authApi.login(email, password);
        navigate(res.user.role === "warung_owner" ? "/mitra" : "/", { replace: true });
      } else {
        const res = await authApi.register({
          name,
          email,
          phone: phone || undefined,
          password,
          password_confirmation: passwordConfirmation,
          role,
          warung_name: role === "partner" ? warungName : undefined,
          canteen_id: role === "partner" && canteenId ? Number(canteenId) : undefined,
        });
        navigate(res.user.role === "warung_owner" ? "/mitra" : "/", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Autentikasi gagal. Silakan periksa data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-card p-6 md:p-10 max-w-md w-full">
        <div className="text-center">
          <img src={logoUrl} alt="KantinGO" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-1">
            {mode === "login" ? "Masuk ke KantinGO" : "Daftar Akun KantinGO"}
          </h1>
          <p className="text-navy/60 text-xs mb-6">
            Pesan makanan kantin kampus lebih cepat tanpa antre.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === "login" ? "bg-white text-primary shadow-xs" : "text-navy/60"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === "register" ? "bg-white text-primary shadow-xs" : "text-navy/60"
            }`}
          >
            Daftar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    role === "customer"
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-slate-200 text-navy/70"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Pembeli</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("partner")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    role === "partner"
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-slate-200 text-navy/70"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Mitra Warung</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required={!isMockMode()}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">No. HP (Opsional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {role === "partner" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Nama Warung</label>
                    <input
                      type="text"
                      required={!isMockMode()}
                      value={warungName}
                      onChange={(e) => setWarungName(e.target.value)}
                      placeholder="Contoh: Warung Mbak Sari"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Pilih Kantin</label>
                    <select
                      required={!isMockMode()}
                      value={canteenId}
                      onChange={(e) => setCanteenId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-primary"
                    >
                      <option value="">Pilih lokasi kantin</option>
                      {canteens.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Email</label>
            <input
              type="email"
              required={!isMockMode()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kampus.ac.id"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Kata Sandi</label>
            <input
              type="password"
              required={!isMockMode()}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                required={!isMockMode()}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:bg-slate-300 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Masuk ke KantinGO" : "Daftar Sekarang"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
