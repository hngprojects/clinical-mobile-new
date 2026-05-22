import { useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/constants/keys';
import { asyncStorage } from '@/shared/storage/asyncStorage';
import { secureStorage } from '@/shared/storage/secureStorage';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

  // 1. Session Restoration on App Launch
  useEffect(() => {
    // Fallback: if any storage/network call hangs indefinitely (e.g. SecureStore
    // in certain emulated environments), ensure the splash is always dismissed.
    const fallback = setTimeout(() => setIsReady(true), 5_000);

    async function init() {
      try {
        const { useAuthStore } = await import('@/features/auth/store/auth.store');
        const { useOnboardingStore } = await import('@/features/onboarding/store/onboarding.store');

        const [tokens, isGuest, guestSessionId] = await Promise.all([
          secureStorage.getTokens(),
          asyncStorage.getItem<boolean>(STORAGE_KEYS.GUEST_SESSION),
          asyncStorage.getItem<string>(STORAGE_KEYS.GUEST_SESSION_ID),
          useOnboardingStore.getState().loadFromStorage(),
        ]);

        const currentAuthState = useAuthStore.getState();
        if (currentAuthState.isGuest || currentAuthState.accessToken) {
          return;
        }

        if (tokens) {
          try {
            // Restore full user profile
            const { authApi } = await import('@/features/auth/api/auth.api');
            const userProfile = await authApi.getMe();
            useAuthStore.getState().setSession(tokens, userProfile);
          } catch (e) {
            console.warn('Launch session restore failed, clearing tokens:', e);
            if (!useAuthStore.getState().isGuest) {
              useAuthStore.getState().clearSession();
            }
          }
        } else if (isGuest) {
          useAuthStore.getState().setGuestSession(true, guestSessionId);
        }
      } catch (e) {
        console.warn('App init error:', e);
      } finally {
        clearTimeout(fallback);
        setIsReady(true);
      }
    }

    init();

    return () => clearTimeout(fallback);
  }, []);

  return { isReady };
}
