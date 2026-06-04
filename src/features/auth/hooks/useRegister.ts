import { router } from 'expo-router';

import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useRegister({ caseId }: { caseId?: string } = {}) {
  return useApiMutation(authApi.register, {
    onSuccess: (data) => {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          email: data.email,
          expiresInSeconds: data.expiresInSeconds.toString(),
          ...(caseId ? { caseId } : {}),
        },
      });
    },
  });
}
