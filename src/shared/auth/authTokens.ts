export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
}
