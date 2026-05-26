import { router } from 'expo-router';

import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useLogin() {
  return useApiMutation(authApi.login, {
    onSuccess: ({ user, tokens }) => {
      useAuthStore.getState().setSession(tokens, user);
      router.replace('/(main)');
    },
  });
}
