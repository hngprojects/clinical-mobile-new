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

  setTokens: (tokens: { accessToken: string; refreshToken: string | null }) => void;
  clearSession: () => void;
};

let getAuthState: AuthStateAccessor | null = null;
let refreshPromise: Promise<{ accessToken: string; refreshToken: string | null }> | null = null;

export function registerAuthStore(store: AuthStateAccessor) {
  getAuthState = store;
}

async function refreshAccessToken() {
  const { authApi } = await import('@/features/auth/api/auth.api');
  return authApi.refreshTokens();
}

async function showSessionExpiredMessage() {
  try {
    const { useAuthFeedbackStore } = await import('@/features/auth/store/authFeedback.store');
    useAuthFeedbackStore
      .getState()
      .setErrorMessage('Your session has expired. Please sign in again.');
  } catch (feedbackError) {
    if (__DEV__) console.warn('Could not show session expiry feedback:', feedbackError);
  }
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
      const { accessToken, isGuest, clearSession } = getAuthState();

      // Guest sessions use x-guest-session-id — a 401 means the guest session expired
      if (isGuest) {
        clearSession();
        return Promise.reject(toApiError(error));
      }

      // No access token means we're already logged out
      if (!accessToken) {
        clearSession();
        return Promise.reject(toApiError(error));
      }

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newTokens = await refreshPromise;
        getAuthState().setTokens(newTokens);
        original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return client(original);
      } catch {
        await showSessionExpiredMessage();
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
