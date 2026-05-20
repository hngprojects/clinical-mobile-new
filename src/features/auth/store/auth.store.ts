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
  guestSessionId: string | null;
}

interface AuthActions {
  setSession: (tokens: AuthTokens, user: UserProfile) => void;
  setTokens: (tokens: AuthTokens) => void;
  startGuestSession: () => void;
  setGuestSession: (isGuest: boolean, guestSessionId?: string | null) => void;
  clearSession: () => void;
}

function createGuestSessionId() {
  const randomBytes = getRandomBytes(8);
  const randomPart = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `guest-${Date.now()}-${randomPart}`;
}

function getRandomBytes(length: number) {
  const randomBytes = new Uint8Array(length);
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(randomBytes);
    return randomBytes;
  }

  for (let i = 0; i < randomBytes.length; i += 1) {
    randomBytes[i] = Math.floor(Math.random() * 256);
  }

  return randomBytes;
}

export const useAuthStore = createStore<AuthState & AuthActions>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isGuest: false,
  guestSessionId: null,

  setSession: (tokens, user) => {
    set({ ...tokens, user, isGuest: false, guestSessionId: null });
    secureStorage.saveTokens(tokens).catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION).catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION_ID).catch(console.warn);
  },

  setTokens: (tokens) => {
    set({ ...tokens, isGuest: false, guestSessionId: null });
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION).catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION_ID).catch(console.warn);
  },

  startGuestSession: () => {
    const guestSessionId = get().guestSessionId ?? createGuestSessionId();
    set({ accessToken: null, refreshToken: null, user: null, isGuest: true, guestSessionId });
    secureStorage.clearTokens().catch(console.warn);
    asyncStorage.setItem(STORAGE_KEYS.GUEST_SESSION, true).catch(console.warn);
    asyncStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, guestSessionId).catch(console.warn);
  },

  setGuestSession: (isGuest, guestSessionId = null) => {
    set({ isGuest, guestSessionId, accessToken: null, refreshToken: null, user: null });
  },

  clearSession: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isGuest: false,
      guestSessionId: null,
    });
    secureStorage.clearTokens().catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION).catch(console.warn);
    asyncStorage.removeItem(STORAGE_KEYS.GUEST_SESSION_ID).catch(console.warn);
  },
}));

// Register with Axios interceptor (synchronous store access outside React)
registerAuthStore(() => ({
  accessToken: useAuthStore.getState().accessToken,
  refreshToken: useAuthStore.getState().refreshToken,
  setTokens: useAuthStore.getState().setTokens,
  clearSession: useAuthStore.getState().clearSession,
}));
