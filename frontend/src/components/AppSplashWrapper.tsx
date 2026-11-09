import { useEffect, useState } from "react";
import SplashScreen from "../pages/SplashScreen";

interface AppSplashWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper global untuk menampilkan splash screen setiap kali aplikasi
 * pertama kali dibuka atau dimuat ulang (cold start / initial load).
 */
export default function AppSplashWrapper({ children }: AppSplashWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Mulai animasi fade-out pada 1700ms
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1700);

    // Hilangkan splash overlay sepenuhnya dari DOM pada 2200ms
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showSplash && <SplashScreen isOverlay={true} isFading={isFading} />}
      {children}
    </>
  );
}
