import { registerAuthStore } from '@/shared/api/client';
import { STORAGE_KEYS } from '@/shared/constants/keys';
import { asyncStorage } from '@/shared/storage/asyncStorage';
import { secureStorage } from '@/shared/storage/secureStorage';
import { createStore } from '@/shared/store/factory';

import type { AuthTokens, UserProfile } from '../api/auth.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isGuest: boolean;
}

interface AuthActions {
  setSession: (tokens: AuthTokens, user: UserProfile) => void;
  setTokens: (tokens: AuthTokens) => void;
  startGuestSession: () => void;
  setGuestSession: (isGuest: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = createStore<AuthState & AuthActions>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isGuest: false,

  setSession: (tokens, user) => {
    set({ ...tokens, user, isGuest: false });
    secureStorage.saveTokens(tokens).catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION).catch(console.warn);
  },

  setTokens: (tokens) => {
    set({ ...tokens, isGuest: false });
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION).catch(console.warn);
  },

  startGuestSession: () => {
    set({ accessToken: null, refreshToken: null, user: null, isGuest: true });
    secureStorage.clearTokens().catch(console.warn);
    asyncStorage.setItem(STORAGE_KEYS.GUEST_SESSION, true).catch(console.warn);
  },

  setGuestSession: (isGuest) => {
    set({ isGuest, accessToken: null, refreshToken: null, user: null });
  },

  clearSession: () => {
    set({ accessToken: null, refreshToken: null, user: null, isGuest: false });
    secureStorage.clearTokens().catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION).catch(console.warn);
  },
}));

// Register with Axios interceptor (synchronous store access outside React)
registerAuthStore(() => ({
  accessToken: useAuthStore.getState().accessToken,
  refreshToken: useAuthStore.getState().refreshToken,
  setSession: useAuthStore.getState().setSession,
  clearSession: useAuthStore.getState().clearSession,
}));
