import { router } from 'expo-router';

import { useApiMutation } from '@/shared/api/hooks';
import { wait } from '@/shared/utils/wait';

import { useAuthFeedbackStore } from '../store/authFeedback.store';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const SUCCESS_REDIRECT_DELAY_MS = 1200;

export function useLogin() {
  return useApiMutation(authApi.login, {
    onSuccess: async ({ user, tokens }) => {
      useAuthStore.getState().setSession(tokens, user);
      useAuthFeedbackStore.getState().setSuccessMessage('Login successful.');
      await wait(SUCCESS_REDIRECT_DELAY_MS);
      router.replace('/(main)');
    },
  });
}
