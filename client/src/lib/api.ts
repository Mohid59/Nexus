import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Single axios instance for the whole app.
 * - withCredentials so the httpOnly refresh cookie is sent to /auth/refresh.
 * - request interceptor attaches the in-memory access token.
 * - response interceptor transparently refreshes once on 401, then retries.
 */
export const api = axios.create({ baseURL, withCredentials: true });

const ACCESS_TOKEN_KEY = 'nexus_access_token';

// In-memory token is the source of truth; mirrored to localStorage to survive reloads.
let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return accessToken;
}

// AuthContext registers a handler so a failed refresh can clear client auth state.
let onAuthFailure: (() => void) | null = null;
export function setAuthFailureHandler(fn: (() => void) | null): void {
  onAuthFailure = fn;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Shared in-flight refresh so concurrent 401s trigger only one /auth/refresh call.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Bare axios call (not `api`) to avoid interceptor recursion.
    const res = await axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true });
    const newToken: string | undefined = res.data?.accessToken;
    if (newToken) {
      setAccessToken(newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthRoute =
      url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      if (!refreshing) refreshing = refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;

      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      // Refresh failed → drop client session and notify AuthContext.
      setAccessToken(null);
      onAuthFailure?.();
    }

    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from an API/axios error. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
