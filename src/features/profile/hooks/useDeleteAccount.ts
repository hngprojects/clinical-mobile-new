import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useDeleteAccount() {
  return useApiMutation(authApi.deleteAccount, {
    onSuccess: () => {
      useAuthStore.getState().clearSession();
    },
  });
}
