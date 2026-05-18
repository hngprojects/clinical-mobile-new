import { useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/shared/constants/keys';
import { asyncStorage } from '@/shared/storage/asyncStorage';
import { secureStorage } from '@/shared/storage/secureStorage';

export function useAppReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { useAuthStore } = await import('@/features/auth/store/auth.store');
        const { useOnboardingStore } = await import('@/features/onboarding/store/onboarding.store');

        const [tokens, isGuest] = await Promise.all([
          secureStorage.getTokens(),
          asyncStorage.getItem<boolean>(STORAGE_KEYS.GUEST_SESSION),
          useOnboardingStore.getState().loadFromStorage(),
        ]);

        if (tokens) {
          useAuthStore.getState().setTokens(tokens);
        } else if (isGuest) {
          useAuthStore.getState().setGuestSession(true);
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
