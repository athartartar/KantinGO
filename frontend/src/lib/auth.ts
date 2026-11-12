const TOKEN_KEY = "kantingo_auth_token";
const DUMMY_TOKEN = "dummy_token_kantingo_local_user";

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

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function loginDummy(): void {
  setToken(DUMMY_TOKEN);
}

export function logout(): void {
  removeToken();
}
