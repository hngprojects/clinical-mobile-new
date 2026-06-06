import { create, isAxiosError } from 'axios';

import type { AuthTokens } from '@/features/auth/api/auth.types';
import { isAccessTokenExpiring } from '@/shared/auth/authTokens';
import { env } from '@/shared/constants/env';

import { ApiError } from './types';

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;

export const client = create({
  baseURL: env.API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Lazily imported to avoid circular deps at module load time
type AuthStateAccessor = () => {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  isGuest: boolean;

  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
};

let getAuthState: AuthStateAccessor | null = null;
let refreshPromise: Promise<AuthTokens> | null = null;

export function registerAuthStore(store: AuthStateAccessor) {
  getAuthState = store;
}

async function refreshAccessToken(refreshToken?: string | null) {
  const { authApi } = await import('@/features/auth/api/auth.api');
  return authApi.refreshTokens(refreshToken);
}

function isRefreshAuthFailure(error: unknown) {
  if (error instanceof ApiError)
    return error.status === 400 || error.status === 401 || error.status === 403;
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status === 400 || status === 401 || status === 403;
  }
  return false;
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

export async function ensureFreshAccessToken(options: { force?: boolean } = {}) {
  const state = getAuthState?.();
  if (!state?.accessToken || state.isGuest) return state?.accessToken ?? null;

  if (
    !options.force &&
    !isAccessTokenExpiring(state.accessTokenExpiresAt, ACCESS_TOKEN_REFRESH_BUFFER_MS)
  ) {
    return state.accessToken;
  }

  try {
    refreshPromise ??= refreshAccessToken(state.refreshToken).finally(() => {
      refreshPromise = null;
    });
    const newTokens = await refreshPromise;
    getAuthState?.().setTokens(newTokens);
    return newTokens.accessToken;
  } catch (error) {
    if (!options.force && !isRefreshAuthFailure(error)) {
      return state.accessToken;
    }

    await showSessionExpiredMessage();
    getAuthState?.().clearSession();
    throw error;
  }
}

client.interceptors.request.use(async (config) => {
  const original = config as typeof config & { _retry?: boolean };
  let token = getAuthState?.().accessToken;

  if (!original._retry) {
    try {
      token = (await ensureFreshAccessToken()) ?? token;
    } catch (error) {
      return Promise.reject(toApiError(error));
    }
  }

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
        const newAccessToken = await ensureFreshAccessToken({ force: true });
        if (!newAccessToken) throw error;
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(original);
      } catch {
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
