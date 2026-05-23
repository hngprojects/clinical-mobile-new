import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { env } from '@/shared/constants/env';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const GOOGLE_AUTH_PATH = '/api/v1/auth/google';
const GOOGLE_AUTH_REDIRECT_URL = 'clinsight://auth/google';
const ACCESS_TOKEN_KEYS = ['access_token', 'token', 'accessToken'];
const REFRESH_TOKEN_KEYS = ['refresh_token', 'refreshToken']; // cookie-based; may not be in URL

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

export function useGoogleAuth() {
  const [isPending, setIsPending] = useState(false);

  const startGoogleAuth = async () => {
    if (isPending) return { success: false };
    setIsPending(true);

    try {
      const redirectUrl = GOOGLE_AUTH_REDIRECT_URL;
      const googleAuthUrl = buildGoogleAuthUrl(redirectUrl);

      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const tokens = getTokensFromUrl(result.url);

        if (tokens) {
          useAuthStore.getState().setTokens(tokens);
          try {
            const userProfile = await authApi.getMe();
            useAuthStore.getState().setSession(tokens, userProfile);
            return { success: true };
          } catch (profileError) {
            useAuthStore.getState().clearSession();
            console.error('Google Auth Profile Fetch Error:', profileError);
          }
        }

        const authError = getAuthErrorFromUrl(result.url);
        if (authError) console.error('Google Auth Redirect Error:', authError);
      }
    } catch (e) {
      console.error('Google Auth Session Error:', e);
    } finally {
      setIsPending(false);
    }

    return { success: false };
  };

  return { startGoogleAuth, isPending };
}
