import { client } from '@/shared/api/client';

import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  OtpDispatchResponse,
} from './auth.types';

interface SuccessResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
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
  };
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

interface BackendOtpResponse {
  email: string;
  expires_in_seconds: number;
}

async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>(
    '/api/v1/auth/login',
    data,
  );
  const { access_token, user } = response.data.data;
  return {
    user: {
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
    },
    tokens: {
      accessToken: access_token,
      refreshToken: access_token, // Cookie-based session refresh fallback
    },
  };
}

async function register(data: RegisterRequest): Promise<OtpDispatchResponse> {
  const response = await client.post<SuccessResponse<BackendOtpResponse>>('/api/v1/auth/signup', {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    password: data.password,
    confirm_password: data.password,
  });
  const { email, expires_in_seconds } = response.data.data;
  return {
    email,
    expiresInSeconds: expires_in_seconds,
  };
}

async function verifyOtp(data: { email: string; code: string }): Promise<AuthResponse> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>(
    '/api/v1/auth/verify-otp',
    data,
  );
  const { access_token, user } = response.data.data;
  return {
    user: {
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
    },
    tokens: {
      accessToken: access_token,
      refreshToken: access_token,
    },
  };
}

async function resendOtp(data: { email: string }): Promise<OtpDispatchResponse> {
  const response = await client.post<SuccessResponse<BackendOtpResponse>>(
    '/api/v1/auth/resend-otp',
    data,
  );
  const { email, expires_in_seconds } = response.data.data;
  return {
    email,
    expiresInSeconds: expires_in_seconds,
  };
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await client.post<SuccessResponse<BackendTokenResponse>>('/api/v1/auth/refresh');
  const { access_token } = response.data.data;
  return {
    accessToken: access_token,
    refreshToken: access_token,
  };
}

async function getMe(): Promise<UserProfile> {
  const response = await client.get<SuccessResponse<BackendUserResponse>>('/api/v1/auth/me');
  const user = response.data.data;
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

async function logout(): Promise<void> {
  await client.post('/api/v1/auth/logout');
}

export const authApi = {
  login,
  register,
  verifyOtp,
  resendOtp,
  refreshTokens,
  getMe,
  logout,
};
