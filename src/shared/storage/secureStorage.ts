import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/shared/constants/keys';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
}

export const secureStorage = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      tokens.refreshToken
        ? SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
        : SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    if (!accessToken) return null;
    return { accessToken, refreshToken: refreshToken ?? null };
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },
};
