import * as Crypto from 'expo-crypto';

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
  startGuestSession: (guestSessionId?: string | null) => string;
  setGuestSession: (isGuest: boolean, guestSessionId?: string | null) => void;
  clearSession: () => void;
}

function getSecureRandomBytes(length: number) {
  const randomBytes = new Uint8Array(length);
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(randomBytes);
    return randomBytes;
  }

  return Crypto.getRandomBytes(length);
}

function createGuestSessionId() {
  const randomBytes = getSecureRandomBytes(8);
  const randomPart = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `guest-${Date.now()}-${randomPart}`;
}

function createGuestDeviceFingerprint() {
  const randomBytes = getSecureRandomBytes(16);
  const randomPart = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `mobile-${Date.now()}-${randomPart}`;
}

let guestFingerprintCache: Promise<string> | null = null;

export function getOrCreateGuestDeviceFingerprint(): Promise<string> {
  if (!guestFingerprintCache) {
    guestFingerprintCache = asyncStorage
      .getItem<string>(STORAGE_KEYS.GUEST_DEVICE_FINGERPRINT)
      .then(async (stored) => {
        if (stored) return stored;
        const fingerprint = createGuestDeviceFingerprint();
        await asyncStorage.setItem(STORAGE_KEYS.GUEST_DEVICE_FINGERPRINT, fingerprint);
        return fingerprint;
      });
  }
  return guestFingerprintCache;
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

  startGuestSession: (providedGuestSessionId) => {
    const nextGuestSessionId =
      providedGuestSessionId ?? get().guestSessionId ?? createGuestSessionId();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isGuest: true,
      guestSessionId: nextGuestSessionId,
    });
    secureStorage.clearTokens().catch(console.warn);
    asyncStorage.setItem(STORAGE_KEYS.GUEST_SESSION, true).catch(console.warn);
    asyncStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, nextGuestSessionId).catch(console.warn);
    return nextGuestSessionId;
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
  isGuest: useAuthStore.getState().isGuest,
  setTokens: useAuthStore.getState().setTokens,
  clearSession: useAuthStore.getState().clearSession,
}));
