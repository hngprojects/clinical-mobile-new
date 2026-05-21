import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { env } from '@/shared/constants/env';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const GOOGLE_AUTH_PATH = '/api/v1/auth/google';
const TOKEN_KEYS = ['access_token', 'token', 'accessToken'];

function buildGoogleAuthUrl(redirectUrl: string) {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, '');
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);

  return `${baseUrl}${GOOGLE_AUTH_PATH}?redirect_uri=${encodedRedirectUrl}&return_url=${encodedRedirectUrl}`;
}

function getTokenFromUrl(url: string) {
  const parsed = Linking.parse(url);

  for (const key of TOKEN_KEYS) {
    const value = parsed.queryParams?.[key];
    if (typeof value === 'string') return value;
  }

  const [, fragment = ''] = url.split('#');
  const fragmentParams = new URLSearchParams(fragment);

  for (const key of TOKEN_KEYS) {
    const value = fragmentParams.get(key);
    if (value) return value;
  }

  return null;
}

export function useGoogleAuth() {
  const [isPending, setIsPending] = useState(false);

  const startGoogleAuth = async () => {
    if (isPending) return { success: false };
    setIsPending(true);

    try {
      const redirectUrl = Linking.createURL('auth/google');
      const googleAuthUrl = buildGoogleAuthUrl(redirectUrl);

      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const token = getTokenFromUrl(result.url);

        if (token) {
          // Temporarily save tokens for API authorization headers
          useAuthStore.getState().setTokens({ accessToken: token, refreshToken: token });

          // Fetch full user profile details dynamically
          const userProfile = await authApi.getMe();
          useAuthStore
            .getState()
            .setSession({ accessToken: token, refreshToken: token }, userProfile);
          return { success: true };
        }
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
