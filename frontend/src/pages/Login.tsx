import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isAuthenticated, loginDummy } from "../lib/auth";
import logoUrl from "../../logo_KantinGO.png";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    loginDummy();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 max-w-md w-full text-center">
        <img src={logoUrl} alt="KantinGO" className="w-20 h-20 mx-auto mb-6" />

        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">
          Selamat datang di
        </h1>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-6">
          KantinGO
        </h1>
        <p className="text-navy/60 text-sm mb-10">
          Silakan masuk untuk melanjutkan pemesanan makanan favoritmu di kantin kampus.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all active:scale-[0.98] focus-visible:outline-none cursor-pointer"
        >
          <span>Masuk ke KantinGO</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
