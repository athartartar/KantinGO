import { Navigate, useLocation } from "react-router-dom";
import {
  getAuthUser,
  getDefaultHomeForUser,
  getRole,
  isAuthenticated,
  type UserRole,
} from "../lib/auth";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: UserRole | UserRole[];
  allowPending?: boolean;
}

export default function RequireAuth({
  children,
  role,
  allowPending = false,
}: RequireAuthProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const authUser = getAuthUser();
  const currentRole = authUser?.role ?? getRole();

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!currentRole || !allowed.includes(currentRole)) {
      return <Navigate to={getDefaultHomeForUser(authUser)} replace />;
    }
  }

  if (
    currentRole === "warung_owner" &&
    !allowPending &&
    authUser?.warung?.status !== "approved"
  ) {
    return <Navigate to="/mitra/menunggu" replace />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to={getDefaultHomeForUser()} replace />;
  }

  return <>{children}</>;
}
