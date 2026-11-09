import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Wrapper rute yang memerlukan login.
 * Jika belum login, diarahkan ke halaman login (/login).
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
