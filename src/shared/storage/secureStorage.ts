import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from '@/shared/auth/authTokens';
import { STORAGE_KEYS } from '@/shared/constants/keys';

export const secureStorage = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      tokens.accessTokenExpiresAt
        ? SecureStore.setItemAsync(
            STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT,
            tokens.accessTokenExpiresAt,
          )
        : SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT),
      tokens.refreshToken
        ? SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
        : SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken, accessTokenExpiresAt] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT),
    ]);
    if (!accessToken) return null;
    return {
      accessToken,
      refreshToken: refreshToken ?? null,
      accessTokenExpiresAt: accessTokenExpiresAt ?? null,
    };
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN_EXPIRES_AT),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },
};
