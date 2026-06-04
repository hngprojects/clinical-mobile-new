import type { AuthTokens as SharedAuthTokens } from '@/shared/auth/authTokens';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  code: string;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
  expiresInSeconds: number;
}

export interface CompletePasswordResetRequest {
  token: string;
  newPassword: string;
}

export interface CompletePasswordResetResponse {
  message: string;
}

export type AuthTokens = SharedAuthTokens;

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  googleId?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface OtpDispatchResponse {
  email: string;
  expiresInSeconds: number;
}

export interface GuestSessionResponse {
  guestSessionId: string;
  expiresIn: number;
  expiresAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface UpdateProfileResponse {
  user: UserProfile;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface DeleteAccountResponse {
  message: string;
}

export interface RequestEmailChangeRequest {
  email: string;
  password: string;
}

export interface RequestEmailChangeResponse {
  message: string;
  expiresInSeconds?: number;
}

export interface VerifyEmailChangeRequest {
  token: string;
}

export interface VerifyEmailChangeResponse {
  message: string;
}
