import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';

import { env } from '@/shared/constants/env';
import { wait } from '@/shared/utils/wait';

import { authApi } from '../api/auth.api';
import { useAuthFeedbackStore } from '../store/authFeedback.store';
import { useAuthStore } from '../store/auth.store';

const GOOGLE_AUTH_PATH = '/api/v1/auth/google';
const GOOGLE_AUTH_REDIRECT_URL = 'clinsight://auth/google';
const ACCESS_TOKEN_KEYS = ['access_token', 'token', 'accessToken'];
const REFRESH_TOKEN_KEYS = ['refresh_token', 'refreshToken'];
const SUCCESS_REDIRECT_DELAY_MS = 1200;

type UrlQueryParams = NonNullable<ReturnType<typeof Linking.parse>['queryParams']>;

function buildGoogleAuthUrl(redirectUrl: string) {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, '');
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);

  return `${baseUrl}${GOOGLE_AUTH_PATH}?redirect_uri=${encodedRedirectUrl}&return_url=${encodedRedirectUrl}&platform=mobile&device_id=mobile`;
}

function getParamValue(
  params: UrlQueryParams | URLSearchParams | null | undefined,
  keys: string[],
) {
  if (!params) return null;

  for (const key of keys) {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key];
    if (typeof value === 'string' && value.length > 0) return value;
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
      return value[0];
    }
  }

  return null;
}

function getTokensFromUrl(url: string) {
  const parsed = Linking.parse(url);
  const [, fragment = ''] = url.split('#');
  const fragmentParams = new URLSearchParams(fragment);
  const accessToken =
    getParamValue(parsed.queryParams, ACCESS_TOKEN_KEYS) ||
    getParamValue(fragmentParams, ACCESS_TOKEN_KEYS);

  if (!accessToken) return null;

  const refreshToken =
    getParamValue(parsed.queryParams, REFRESH_TOKEN_KEYS) ||
    getParamValue(fragmentParams, REFRESH_TOKEN_KEYS) ||
    null;

  return { accessToken, refreshToken };
}

function getAuthErrorFromUrl(url: string) {
  const parsed = Linking.parse(url);
  const [, fragment = ''] = url.split('#');
  const fragmentParams = new URLSearchParams(fragment);

  return (
    getParamValue(parsed.queryParams, ['error_description', 'error', 'message']) ||
    getParamValue(fragmentParams, ['error_description', 'error', 'message'])
  );
}

function mapGoogleOAuthError(rawError: string, flow: 'signin' | 'signup'): string {
  const lower = rawError.toLowerCase();
  const action = flow === 'signup' ? 'sign-up' : 'sign-in';

  if (lower.includes('already exists')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (lower.includes('not verified')) {
    return 'Your Google account email is not verified. Please verify it with Google first.';
  }
  if (
    lower.includes('exchange') ||
    lower.includes('user information') ||
    lower.includes('missing required')
  ) {
    return `Google ${action} failed. Please try again.`;
  }
  return `Google ${action} failed. Please try again.`;
}

export function useGoogleAuth(flow: 'signin' | 'signup' = 'signin') {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = flow === 'signup' ? 'sign-up' : 'login';

  const startGoogleAuth = async () => {
    if (isPending) return { success: false };
    setIsPending(true);
    setError(null);

    try {
      const redirectUrl = GOOGLE_AUTH_REDIRECT_URL;
      const googleAuthUrl = buildGoogleAuthUrl(redirectUrl);

      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUrl);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { success: false };
      }

      if (result.type === 'success' && result.url) {
        const authError = getAuthErrorFromUrl(result.url);
        if (authError) {
          setError(mapGoogleOAuthError(authError, flow));
          return { success: false };
        }

        const tokens = getTokensFromUrl(result.url);

        if (!tokens) {
          setError(`Google ${action} failed. Please try again.`);
          return { success: false };
        }

        useAuthStore.getState().setTokens(tokens);
        try {
          const userProfile = await authApi.getMe();
          useAuthStore.getState().setSession(tokens, userProfile);
          useAuthFeedbackStore
            .getState()
            .setSuccessMessage(
              flow === 'signup' ? 'Google sign-up successful.' : 'Google login successful.',
            );
          await wait(SUCCESS_REDIRECT_DELAY_MS);
          router.replace('/(main)');
          return { success: true };
        } catch {
          useAuthStore.getState().clearSession();
          setError(
            `${flow === 'signup' ? 'Signed up' : 'Logged in'} but couldn't load your profile. Please try again.`,
          );
          return { success: false };
        }
      }
    } catch {
      setError(`Google ${action} failed. Please check your connection and try again.`);
    } finally {
      setIsPending(false);
    }

    return { success: false };
  };

  const clearError = useCallback(() => setError(null), []);

  return { startGoogleAuth, isPending, error, clearError };
}
