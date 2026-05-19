import { registerAuthStore } from '@/shared/api/client';
import { secureStorage } from '@/shared/storage/secureStorage';
import { createStore } from '@/shared/store/factory';

import type { AuthTokens, UserProfile } from '../api/auth.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
}

interface AuthActions {
  setSession: (tokens: AuthTokens, user: UserProfile) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
}

export const useAuthStore = createStore<AuthState & AuthActions>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setSession: (tokens, user) => {
    set({ ...tokens, user });
    secureStorage.saveTokens(tokens).catch(console.warn);
  },

  setTokens: (tokens) => {
    set({ ...tokens });
  },

  clearSession: () => {
    set({ accessToken: null, refreshToken: null, user: null });
    secureStorage.clearTokens().catch(console.warn);
  },
}));

// Register with Axios interceptor (synchronous store access outside React)
registerAuthStore(() => ({
  accessToken: useAuthStore.getState().accessToken,
  refreshToken: useAuthStore.getState().refreshToken,
  setTokens: useAuthStore.getState().setTokens,
  clearSession: useAuthStore.getState().clearSession,
}));
