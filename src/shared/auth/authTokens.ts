export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
}

export function isAccessTokenExpiring(
  expiresAt: string | null,
  refreshBufferMs: number,
  now = Date.now(),
) {
  if (!expiresAt) return false;

  const expiresAtMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresAtMs)) return false;

  return expiresAtMs - now <= refreshBufferMs;
}
