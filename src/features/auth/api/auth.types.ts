export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface CompletePasswordResetRequest {
  token: string;
  password: string;
}

export interface CompletePasswordResetResponse {
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

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
