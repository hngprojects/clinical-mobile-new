import { authApi } from '@/features/auth/api/auth.api';
import { client } from '@/shared/api/client';

jest.mock('@/shared/api/client', () => ({
  client: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPost = client.post as jest.Mock;
const mockGet = client.get as jest.Mock;
const mockPatch = client.patch as jest.Mock;
const mockDelete = client.delete as jest.Mock;

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
      refresh_token: 'refresh-token',
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
    mockPatch.mockReset();
    mockDelete.mockReset();
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
      device_id: 'mobile',
      platform: 'mobile',
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
      refreshToken: 'refresh-token',
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
      confirmPassword: 'Password1',
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
      device_id: 'mobile',
      platform: 'mobile',
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

    await expect(authApi.refreshTokens('old-refresh-token')).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/auth/refresh',
      { refresh_token: 'old-refresh-token' },
      { _retry: true },
    );
  });

  it('refreshes tokens without a request body when no refresh token is available', async () => {
    mockPost.mockResolvedValueOnce(tokenResponse);

    await expect(authApi.refreshTokens()).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/refresh', undefined, { _retry: true });
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
      authApi.completePasswordReset({
        email: 'jane@example.com',
        token: 'reset-token',
        newPassword: 'Password1',
      }),
    ).resolves.toEqual({
      message: 'Password reset successfully. You can now log in.',
    });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/reset-password', {
      email: 'jane@example.com',
      token: 'reset-token',
      new_password: 'Password1',
    });
  });

  it('updates profile via users/me', async () => {
    mockPatch.mockResolvedValueOnce({
      data: { status: 'success', message: 'ok', data: backendUser },
    });

    await expect(
      authApi.updateProfile({ firstName: 'Jane', lastName: 'Smith' }),
    ).resolves.toMatchObject({
      user: { firstName: 'Jane', lastName: 'Doe' },
    });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/users/me', {
      first_name: 'Jane',
      last_name: 'Smith',
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

  it('updates password via users/me/password', async () => {
    mockPatch.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'Password updated successfully.',
        data: null,
      },
    });

    await expect(
      authApi.changePassword({
        currentPassword: 'OldPassword1!',
        newPassword: 'NewPassword1!',
      }),
    ).resolves.toEqual({
      message: 'Password updated successfully.',
    });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/users/me/password', {
      current_password: 'OldPassword1!',
      new_password: 'NewPassword1!',
    });
  });

  it('deletes account via users/me', async () => {
    mockDelete.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'Account deleted successfully.',
        data: 'ok',
      },
    });

    await expect(authApi.deleteAccount()).resolves.toEqual({
      message: 'Account deleted successfully.',
    });
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/users/me');
  });
});
