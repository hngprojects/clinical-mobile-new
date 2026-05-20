import { authApi } from '@/features/auth/api/auth.api';
import { client } from '@/shared/api/client';

jest.mock('@/shared/api/client', () => ({
  client: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockPost = client.post as jest.Mock;
const mockGet = client.get as jest.Mock;

const backendUser = {
  id: 'user-1',
  email: 'jane@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  role: 'patient',
  is_email_verified: true,
  is_active: true,
  google_id: null,
  created_at: '2026-05-18T08:00:00.000Z',
  last_login_at: null,
};

const tokenResponse = {
  data: {
    status: 'success',
    message: 'ok',
    data: {
      access_token: 'access-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: backendUser,
    },
  },
};

describe('authApi', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
  });

  it('logs in through the backend and maps the user response', async () => {
    mockPost.mockResolvedValueOnce(tokenResponse);

    const result = await authApi.login({
      email: 'jane@example.com',
      password: 'Password1',
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'jane@example.com',
      password: 'Password1',
    });
    expect(result.user).toMatchObject({
      id: 'user-1',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      isEmailVerified: true,
    });
    expect(result.tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'access-token',
    });
  });

  it('signs up with backend field names and returns OTP expiry details', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'otp sent',
        data: { email: 'jane@example.com', expires_in_seconds: 300 },
      },
    });

    const result = await authApi.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1',
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/signup', {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      password: 'Password1',
      confirm_password: 'Password1',
    });
    expect(result).toEqual({ email: 'jane@example.com', expiresInSeconds: 300 });
  });

  it('verifies OTP and maps tokens', async () => {
    mockPost.mockResolvedValueOnce(tokenResponse);

    const result = await authApi.verifyOtp({
      email: 'jane@example.com',
      code: '123456',
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/verify-otp', {
      email: 'jane@example.com',
      code: '123456',
    });
    expect(result.tokens.accessToken).toBe('access-token');
  });

  it('resends OTP through the backend', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'otp sent',
        data: { email: 'jane@example.com', expires_in_seconds: 180 },
      },
    });

    await expect(authApi.resendOtp({ email: 'jane@example.com' })).resolves.toEqual({
      email: 'jane@example.com',
      expiresInSeconds: 180,
    });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/resend-otp', {
      email: 'jane@example.com',
    });
  });

  it('refreshes tokens through the backend', async () => {
    mockPost.mockResolvedValueOnce(tokenResponse);

    await expect(authApi.refreshTokens('old-token')).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'access-token',
    });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/refresh');
  });

  it('requests password reset through the backend', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'If an account exists for this email, reset instructions have been sent.',
        data: null,
      },
    });

    await expect(authApi.resetPassword({ email: 'jane@example.com' })).resolves.toEqual({
      message: 'If an account exists for this email, reset instructions have been sent.',
    });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/forgot-password', {
      email: 'jane@example.com',
    });
  });

  it('completes password reset through the backend', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'Password reset successfully. You can now log in.',
        data: null,
      },
    });

    await expect(
      authApi.completePasswordReset({ token: 'reset-token', password: 'Password1' }),
    ).resolves.toEqual({
      message: 'Password reset successfully. You can now log in.',
    });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/reset-password', {
      token: 'reset-token',
      password: 'Password1',
    });
  });

  it('restores the current user profile', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', message: 'ok', data: backendUser },
    });

    await expect(authApi.getMe()).resolves.toMatchObject({
      id: 'user-1',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/auth/me');
  });

  it('calls logout endpoint', async () => {
    mockPost.mockResolvedValueOnce({ data: { status: 'success', message: 'ok' } });

    await authApi.logout();

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/logout');
  });
});
