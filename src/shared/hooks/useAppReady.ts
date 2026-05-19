import { useEffect, useState } from 'react';

import { secureStorage } from '@/shared/storage/secureStorage';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

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

  return { isReady };
}
