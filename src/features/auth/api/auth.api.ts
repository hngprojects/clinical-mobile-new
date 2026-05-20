import { client } from '@/shared/api/client';

import type {
  AuthResponse,
  AuthTokens,
  CompletePasswordResetRequest,
  CompletePasswordResetResponse,
  LoginRequest,
  OtpDispatchResponse,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserProfile,
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
  token_type: string;
  expires_in: number;
  user: BackendUserResponse;
}

interface BackendOtpResponse {
  email: string;
  expires_in_seconds: number;
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

function mapAuthResponse(data: BackendTokenResponse): AuthResponse {
  return {
    user: mapUser(data.user),
    tokens: {
      accessToken: data.access_token,
      refreshToken: data.access_token,
    },
  };
}

function mapOtpResponse(data: BackendOtpResponse): OtpDispatchResponse {
  return {
    email: data.email,
    expiresInSeconds: data.expires_in_seconds,
  };
}

async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>(
    '/api/v1/auth/login',
    data,
  );
  return mapAuthResponse(response.data.data);
}

async function register(data: RegisterRequest): Promise<OtpDispatchResponse> {
  const response = await client.post<SuccessResponse<BackendOtpResponse>>('/api/v1/auth/signup', {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    password: data.password,
    confirm_password: data.password,
  });
  return mapOtpResponse(response.data.data);
}

async function verifyOtp(data: { email: string; code: string }): Promise<AuthResponse> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>(
    '/api/v1/auth/verify-otp',
    data,
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

async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>('/api/v1/auth/refresh');
  return {
    accessToken: response.data.data.access_token,
    refreshToken: response.data.data.access_token,
  };
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
  const response = await client.post<SuccessResponse<unknown>>('/api/v1/auth/reset-password', data);
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

export const authApi = {
  login,
  register,
  verifyOtp,
  resendOtp,
  refreshTokens,
  resetPassword,
  completePasswordReset,
  getMe,
  logout,
};
