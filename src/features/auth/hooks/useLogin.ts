import { router } from 'expo-router';

import { useApiMutation } from '@/shared/api/hooks';

import { useAuthFeedbackStore } from '../store/authFeedback.store';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const SUCCESS_REDIRECT_DELAY_MS = 1200;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useLogin() {
  return useApiMutation(authApi.login, {
    onSuccess: async ({ user, tokens }) => {
      useAuthFeedbackStore.getState().setSuccessMessage('Login successful.');
      await wait(SUCCESS_REDIRECT_DELAY_MS);
      useAuthStore.getState().setSession(tokens, user);
      router.replace('/(main)');
    },
  });
}
