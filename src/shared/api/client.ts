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

  setTokens: (tokens: { accessToken: string; refreshToken: string | null }) => void;
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
        clearSession();
        return Promise.reject(toApiError(error));
      }

      try {
        const { authApi } = await import('@/features/auth/api/auth.api');
        const newTokens = await authApi.refreshTokens();
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
      | {
          message?: string;
          detail?: string | { loc: string[]; msg: string; type: string }[];
        }
      | undefined;

    if (__DEV__) {
      console.warn('[API Error]', {
        status: error.response?.status,
        url: error.config?.url,
        body: error.config?.data,
        response: data,
      });
    }

    let msg: string;

    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      // FastAPI / Pydantic validation errors — detail takes priority
      msg = data.detail.map((d) => `${d.loc.slice(1).join('.')}: ${d.msg}`).join(', ');
    } else if (typeof data?.detail === 'string' && data.detail) {
      msg = data.detail;
    } else {
      msg = data?.message ?? error.message;
    }

    return new ApiError(msg, error.response?.status ?? 0);
  }
  return new ApiError('Unknown error', 0);
}
