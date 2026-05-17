import { ApiError } from '@/shared/api/types';

import type {
  AuthResponse,
  AuthTokens,
  CompletePasswordResetRequest,
  CompletePasswordResetResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './auth.types';

const DUMMY_USER = {
  id: 'logickoder',
  email: 'jeffery@logickoder.dev',
  firstName: 'Jeffery',
  lastName: 'Orazulike',
};

const DUMMY_ACCESS = 'dummy.access.token';
const DUMMY_REFRESH = 'dummy.refresh.token';
const DUMMY_ACCESS_ROTATED = 'dummy.access.token.rotated';

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function login(data: LoginRequest): Promise<AuthResponse> {
  await delay(800);
  if (data.email === 'jeffery@logickoder.dev' && data.password === 'Password1') {
    return {
      user: DUMMY_USER,
      tokens: { accessToken: DUMMY_ACCESS, refreshToken: DUMMY_REFRESH },
    };
  }
  throw new ApiError('Invalid credentials', 401);
}

async function register(data: RegisterRequest): Promise<AuthResponse> {
  await delay(1000);
  if (!data.email || !data.password) {
    throw new ApiError('Email and password are required', 400);
  }
  return {
    user: {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    tokens: { accessToken: DUMMY_ACCESS, refreshToken: DUMMY_REFRESH },
  };
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  await delay(400);
  if (refreshToken === DUMMY_REFRESH) {
    return { accessToken: DUMMY_ACCESS_ROTATED, refreshToken: DUMMY_REFRESH };
  }
  throw new ApiError('Refresh token invalid', 401);
}

async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  await delay(800);
  if (!data.email) {
    throw new ApiError('Email is required', 400);
  }
  return {
    message: 'If an account exists for this email, reset instructions have been sent.',
  };
}

async function completePasswordReset(
  data: CompletePasswordResetRequest,
): Promise<CompletePasswordResetResponse> {
  await delay(800);
  if (!data.password) {
    throw new ApiError('Password is required', 400);
  }
  return {
    message: 'Password reset successfully. You can now log in.',
  };
}

export const authApi = { login, register, refreshTokens, resetPassword, completePasswordReset };
