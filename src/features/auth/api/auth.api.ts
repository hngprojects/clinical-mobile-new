import { client } from '@/shared/api/client';

import type {
  AuthResponse,
  AuthTokens,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountResponse,
  CompletePasswordResetRequest,
  CompletePasswordResetResponse,
  GuestSessionResponse,
  LoginRequest,
  OtpDispatchResponse,
  RegisterRequest,
  RequestEmailChangeRequest,
  RequestEmailChangeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserProfile,
  VerifyEmailChangeRequest,
  VerifyEmailChangeResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
} from './auth.types';

interface SuccessResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface BackendUserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_email_verified: boolean;
  is_active: boolean;
  google_id: string | null;
  created_at: string;
  last_login_at: string | null;
}

interface BackendTokenResponse {
  access_token: string;
  refresh_token?: string | null;
  refreshToken?: string | null;
  token_type: string;
  expires_in?: number | null;
  expires_at?: string | null;
  user: BackendUserResponse;
}

interface BackendResetTokenResponse {
  reset_token: string;
  expires_in_seconds: number;
}

interface BackendOtpResponse {
  email: string;
  expires_in_seconds: number;
}

interface BackendGuestSessionResponse {
  guest_session_id: string;
  expires_in: number;
  expires_at: string;
}

function mapUser(user: BackendUserResponse): UserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    isEmailVerified: user.is_email_verified,
    isActive: user.is_active,
    googleId: user.google_id,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  };
}

function getAccessTokenExpiresAt(data: Pick<BackendTokenResponse, 'expires_at' | 'expires_in'>) {
  if (data.expires_at) return data.expires_at;
  if (typeof data.expires_in !== 'number' || data.expires_in <= 0) return null;
  return new Date(Date.now() + data.expires_in * 1000).toISOString();
}

function mapTokens(
  data: BackendTokenResponse,
  fallbackRefreshToken: string | null = null,
): AuthTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? data.refreshToken ?? fallbackRefreshToken,
    accessTokenExpiresAt: getAccessTokenExpiresAt(data),
  };
}

function mapAuthResponse(data: BackendTokenResponse): AuthResponse {
  return {
    user: mapUser(data.user),
    tokens: mapTokens(data),
  };
}

function mapResetTokenResponse(data: BackendResetTokenResponse): VerifyResetOtpResponse {
  return {
    resetToken: data.reset_token,
    expiresInSeconds: data.expires_in_seconds,
  };
}

function mapOtpResponse(data: BackendOtpResponse): OtpDispatchResponse {
  return {
    email: data.email,
    expiresInSeconds: data.expires_in_seconds,
  };
}

function mapGuestSessionResponse(data: BackendGuestSessionResponse): GuestSessionResponse {
  return {
    guestSessionId: data.guest_session_id,
    expiresIn: data.expires_in,
    expiresAt: data.expires_at,
  };
}

async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>('/api/v1/auth/login', {
    email: data.email,
    password: data.password,
    device_id: 'mobile',
    platform: 'mobile',
  });
  return mapAuthResponse(response.data.data);
}

async function register(data: RegisterRequest): Promise<OtpDispatchResponse> {
  const response = await client.post<SuccessResponse<BackendOtpResponse>>('/api/v1/auth/signup', {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    password: data.password,
    confirm_password: data.confirmPassword,
  });
  return mapOtpResponse(response.data.data);
}

async function verifyOtp(data: {
  email: string;
  code: string;
  guestSessionId?: string;
}): Promise<AuthResponse> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>(
    '/api/v1/auth/verify-otp',
    {
      email: data.email,
      code: data.code,
      device_id: 'mobile',
      platform: 'mobile',
      ...(data.guestSessionId ? { guest_session_id: data.guestSessionId } : {}),
    },
  );
  return mapAuthResponse(response.data.data);
}

async function resendOtp(data: { email: string }): Promise<OtpDispatchResponse> {
  const response = await client.post<SuccessResponse<BackendOtpResponse>>(
    '/api/v1/auth/resend-otp',
    data,
  );
  return mapOtpResponse(response.data.data);
}

async function verifyResetOtp(data: VerifyResetOtpRequest): Promise<VerifyResetOtpResponse> {
  const response = await client.post<SuccessResponse<BackendResetTokenResponse>>(
    '/api/v1/auth/verify-reset-otp',
    { email: data.email, code: data.code },
  );
  return mapResetTokenResponse(response.data.data);
}

async function createGuestSession(
  deviceFingerprint?: string | null,
): Promise<GuestSessionResponse> {
  const response = await client.post<SuccessResponse<BackendGuestSessionResponse>>(
    '/api/v1/guest-session',
    undefined,
    {
      headers: deviceFingerprint ? { 'X-Device-Fingerprint': deviceFingerprint } : undefined,
    },
  );
  return mapGuestSessionResponse(response.data.data);
}

async function refreshTokens(refreshToken?: string | null): Promise<AuthTokens> {
  // _retry: true prevents the 401 interceptor from re-entering on this request
  const response = await client.post<SuccessResponse<BackendTokenResponse>>(
    '/api/v1/auth/refresh',
    refreshToken ? { refresh_token: refreshToken } : undefined,
    { _retry: true } as object,
  );
  return mapTokens(response.data.data, refreshToken ?? null);
}

async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await client.post<SuccessResponse<unknown>>(
    '/api/v1/auth/forgot-password',
    data,
  );
  return {
    message: response.data.message,
  };
}

async function completePasswordReset(
  data: CompletePasswordResetRequest,
): Promise<CompletePasswordResetResponse> {
  const response = await client.post<SuccessResponse<unknown>>('/api/v1/auth/reset-password', {
    token: data.token,
    new_password: data.newPassword,
  });
  return {
    message: response.data.message,
  };
}

async function getMe(): Promise<UserProfile> {
  const response = await client.get<SuccessResponse<BackendUserResponse>>('/api/v1/auth/me');
  return mapUser(response.data.data);
}

async function logout(): Promise<void> {
  await client.post('/api/v1/auth/logout');
}

async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await client.patch<SuccessResponse<BackendUserResponse>>('/api/v1/users/me', {
    first_name: data.firstName,
    last_name: data.lastName,
  });
  return { user: mapUser(response.data.data) };
}

async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await client.patch<SuccessResponse<unknown>>('/api/v1/users/me/password', {
    current_password: data.currentPassword,
    new_password: data.newPassword,
  });
  return {
    message: response.data.message,
  };
}

async function deleteAccount(): Promise<DeleteAccountResponse> {
  const response = await client.delete<SuccessResponse<string>>('/api/v1/users/me');
  return {
    message: response.data.message,
  };
}

async function requestEmailChange(
  data: RequestEmailChangeRequest,
): Promise<RequestEmailChangeResponse> {
  const response = await client.post<
    SuccessResponse<{ expires_in_seconds?: number } | null>
  >('/api/v1/users/me/email', {
    email: data.email,
    password: data.password,
  });
  return {
    message: response.data.message,
    expiresInSeconds: response.data.data?.expires_in_seconds,
  };
}

async function verifyEmailChange(
  data: VerifyEmailChangeRequest,
): Promise<VerifyEmailChangeResponse> {
  const response = await client.post<SuccessResponse<unknown>>('/api/v1/users/me/email/verify', {
    token: data.token,
  });
  return { message: response.data.message };
}

export const authApi = {
  login,
  register,
  verifyOtp,
  resendOtp,
  verifyResetOtp,
  createGuestSession,
  refreshTokens,
  resetPassword,
  completePasswordReset,
  getMe,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
  requestEmailChange,
  verifyEmailChange,
};
