import { isAccessTokenExpiring } from '@/shared/auth/authTokens';

const NOW = Date.parse('2026-06-04T12:00:00.000Z');
const REFRESH_BUFFER_MS = 60_000;

describe('isAccessTokenExpiring', () => {
  it('uses tokens with unknown expiry until the API rejects them', () => {
    expect(isAccessTokenExpiring(null, REFRESH_BUFFER_MS, NOW)).toBe(false);
    expect(isAccessTokenExpiring('invalid-date', REFRESH_BUFFER_MS, NOW)).toBe(false);
  });

  it('refreshes tokens inside the refresh buffer', () => {
    expect(isAccessTokenExpiring('2026-06-04T12:00:30.000Z', REFRESH_BUFFER_MS, NOW)).toBe(true);
  });

  it('does not refresh tokens outside the refresh buffer', () => {
    expect(isAccessTokenExpiring('2026-06-04T12:05:00.000Z', REFRESH_BUFFER_MS, NOW)).toBe(false);
  });
});
