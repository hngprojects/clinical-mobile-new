import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

import { secureStorage } from '@/shared/storage/secureStorage';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);
  const deepLinkUrl = Linking.useURL();

  // 1. Session Restoration on App Launch
  useEffect(() => {
    async function init() {
      try {
        const { useAuthStore } = await import('@/features/auth/store/auth.store');
        const { useOnboardingStore } = await import('@/features/onboarding/store/onboarding.store');

        const [tokens] = await Promise.all([
          secureStorage.getTokens(),
          useOnboardingStore.getState().loadFromStorage(),
        ]);

        if (tokens) {
          useAuthStore.getState().setTokens(tokens);
          try {
            // Restore full user profile
            const { authApi } = await import('@/features/auth/api/auth.api');
            const userProfile = await authApi.getMe();
            useAuthStore.getState().setSession(tokens, userProfile);
          } catch (e) {
            console.warn('Launch session restore failed, clearing tokens:', e);
            useAuthStore.getState().clearSession();
          }
        }
      } catch (e) {
        console.warn('App init error:', e);
      } finally {
        setIsReady(true);
      }
    }

    init();
  }, []);

  // 2. Google OAuth Deep Link Callback Listener
  useEffect(() => {
    async function handleDeepLink(url: string | null) {
      if (!url) return;
      try {
        const parsed = Linking.parse(url);
        const token =
          parsed.queryParams?.access_token ||
          parsed.queryParams?.token ||
          parsed.queryParams?.accessToken;

        if (token && typeof token === 'string') {
          const { useAuthStore } = await import('@/features/auth/store/auth.store');
          const { authApi } = await import('@/features/auth/api/auth.api');

          // Temporarily store token for Authorization interceptor headers
          useAuthStore.getState().setTokens({ accessToken: token, refreshToken: token });

          // Fetch full user profile
          const userProfile = await authApi.getMe();
          useAuthStore
            .getState()
            .setSession({ accessToken: token, refreshToken: token }, userProfile);
        }
      } catch (e) {
        console.warn('Google Callback Deep Link parsing error:', e);
      }
    }

    handleDeepLink(deepLinkUrl);
  }, [deepLinkUrl]);

  return { isReady };
}
