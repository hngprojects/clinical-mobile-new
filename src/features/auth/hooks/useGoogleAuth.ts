import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { env } from '@/shared/constants/env';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useGoogleAuth() {
  const [isPending, setIsPending] = useState(false);

  const startGoogleAuth = async () => {
    if (isPending) return { success: false };
    setIsPending(true);

    try {
      const redirectUrl = Linking.createURL('/');
      // Build the backend OAuth URL (clean, param-free as per OpenAPI spec)
      const googleAuthUrl = `${env.API_BASE_URL}/api/v1/auth/google`;

      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const token =
          parsed.queryParams?.access_token ||
          parsed.queryParams?.token ||
          parsed.queryParams?.accessToken;

        if (token && typeof token === 'string') {
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
