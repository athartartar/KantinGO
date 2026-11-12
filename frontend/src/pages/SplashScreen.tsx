import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";
import logoUrl from "../../logo_KantinGO.png";

interface SplashScreenProps {
  isOverlay?: boolean;
  isFading?: boolean;
  durationMs?: number;
  onFinish?: () => void;
}

export default function SplashScreen({
  isOverlay = false,
  isFading = false,
  durationMs = 2000,
  onFinish,
}: SplashScreenProps) {
  const navigate = useNavigate();
  const [internalFading, setInternalFading] = useState(false);

  useEffect(() => {
    if (!isOverlay) {
      const fadeTimer = setTimeout(() => {
        setInternalFading(true);
      }, Math.max(durationMs - 400, 1000));

      const finishTimer = setTimeout(() => {
        if (onFinish) {
          onFinish();
        } else if (isAuthenticated()) {
          navigate("/", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }, durationMs);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [isOverlay, durationMs, navigate, onFinish]);

  const fading = isOverlay ? isFading : internalFading;

  return (
    <div
      className={`fixed inset-0 z-[9999] min-h-dvh w-full flex items-center justify-center select-none overflow-hidden transition-opacity duration-500 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(180deg, #F8FF75 0%, #F8FF75 60%, #F9FF96 82%, #FAFFA8 100%)",
      }}
    >
      <div className="flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
        <img
          src={logoUrl}
          alt="KantinGO"
          className="w-48 sm:w-56 max-w-[65vw] max-h-[40vh] object-contain drop-shadow-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
