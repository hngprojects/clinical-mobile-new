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

export interface CompletePasswordResetRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface CompletePasswordResetResponse {
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
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
