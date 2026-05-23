import { create, isAxiosError } from 'axios';

import { env } from '@/shared/constants/env';

import { ApiError } from './types';

export const client = create({
  baseURL: env.API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Lazily imported to avoid circular deps at module load time
type AuthStateAccessor = () => {
  accessToken: string | null;
  refreshToken: string | null;
  isGuest: boolean;

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
};

let getAuthState: AuthStateAccessor | null = null;

export function registerAuthStore(store: AuthStateAccessor) {
  getAuthState = store;
}

client.interceptors.request.use((config) => {
  const token = getAuthState?.().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry && getAuthState) {
      original._retry = true;
      const { refreshToken, clearSession } = getAuthState();

      if (!refreshToken) {
        // Guest users authenticate via x-guest-session-id, not tokens — don't wipe their session
        if (!getAuthState().isGuest) {
          clearSession();
        }
        return Promise.reject(toApiError(error));
      }

      try {
        const { authApi } = await import('@/features/auth/api/auth.api');
        const newTokens = await authApi.refreshTokens(refreshToken);
        getAuthState().setTokens(newTokens);
        original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return client(original);
      } catch {
        getAuthState().clearSession();
        return Promise.reject(toApiError(error));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; detail?: string | { loc: string[]; msg: string }[] }
      | undefined;

    let msg: string;
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      msg = (data.detail as { loc: string[]; msg: string }[])
        .map((d) => `${d.loc.slice(1).join('.')}: ${d.msg}`)
        .join(', ');
    } else if (typeof data?.detail === 'string' && data.detail) {
      msg = data.detail;
    } else {
      msg = data?.message ?? error.message;
    }

    if (__DEV__) {
      console.warn('[API Error]', error.response?.status, error.config?.url, msg, data);
    }

    return new ApiError(msg, error.response?.status ?? 0);
  }
  return new ApiError('Unknown error', 0);
}
