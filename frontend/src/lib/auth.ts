const TOKEN_KEY = "kantingo_auth_token";
const ROLE_KEY = "kantingo_auth_role";
const USER_KEY = "kantingo_auth_user";
const DUMMY_TOKEN = "dummy_token_kantingo_local_user";

export type UserRole = "customer" | "warung_owner" | "admin";

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  points?: number;
  avatar_path?: string | null;
  warung?: {
    id: number;
    name: string;
    slug: string;
    status: "pending" | "approved" | "rejected" | "suspended";
    rejection_reason?: string | null;
    is_open: boolean;
  } | null;
}

export function getDefaultHomeForUser(user?: AuthUser | null): string {
  const resolvedUser = user ?? getAuthUser();
  const role = resolvedUser?.role ?? getRole();
  if (role === "warung_owner") {
    return resolvedUser?.warung?.status === "approved" ? "/mitra" : "/mitra/menunggu";
  }
  return "/";
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  return String(url).replace(/\/+$/, "");
}

export function isMockMode(): boolean {
  return String(import.meta.env.VITE_USE_MOCK) === "true";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ROLE_KEY);
  if (raw === "customer" || raw === "warung_owner" || raw === "admin") {
    return raw;
  }
  return null;
}

export function setRole(role: UserRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (user.role) {
    setRole(user.role);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function loginDummy(): void {
  setToken(DUMMY_TOKEN);
  setRole("customer");
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("kantingo_user_v1");
  localStorage.removeItem("kantingo_cart_state_v1");
  localStorage.removeItem("kantingo_orders_v1");
  localStorage.removeItem("kantingo_orders_history_v1");
  localStorage.removeItem("kantingo_notifications_v1");
  localStorage.removeItem("kantingo_redeemed_codes_v1");
  localStorage.removeItem("kantingo_user_vouchers_v1");
}

export interface ApiFetchOptions extends RequestInit {
  idempotencyKey?: string;
  skipAuthRedirect?: boolean;
}

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { idempotencyKey, skipAuthRedirect, headers: customHeaders, body, ...rest } = options;
  const token = getToken();
  const headers = new Headers(customHeaders);

  headers.set("Accept", "application/json");
  if (!(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...rest,
    headers,
    body,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    logout();
    if (!skipAuthRedirect && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && !currentPath.startsWith("/simulasi-bayar")) {
        window.location.href = "/login";
      }
    }
    throw new ApiError(
      payload?.message || "Sesi Anda telah berakhir. Silakan masuk kembali.",
      401
    );
  }

  if (response.status === 422) {
    const errors = payload?.errors as Record<string, string[]> | undefined;
    const firstFieldError = errors
      ? Object.values(errors).flat()[0]
      : undefined;
    throw new ApiError(
      firstFieldError || payload?.message || "Data yang dikirim tidak valid.",
      422,
      errors
    );
  }

  if (response.status === 429) {
    throw new ApiError(
      payload?.message || "Terlalu banyak percobaan, coba lagi nanti",
      429
    );
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || "Terjadi kesalahan pada server.",
      response.status
    );
  }

  return payload as T;
}
