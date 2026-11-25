import { Navigate } from "react-router-dom";
import { getRole, isAuthenticated, type UserRole } from "../lib/auth";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: UserRole | UserRole[];
}

export default function RequireAuth({ children, role }: RequireAuthProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const currentRole = getRole();
    const allowed = Array.isArray(role) ? role : [role];
    if (!currentRole || !allowed.includes(currentRole)) {
      return <Navigate to={currentRole === "warung_owner" ? "/mitra" : "/"} replace />;
    }
  }

  return <>{children}</>;
}
