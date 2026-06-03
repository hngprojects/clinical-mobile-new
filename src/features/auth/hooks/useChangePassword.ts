import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useChangePassword() {
  return useApiMutation(authApi.changePassword, {
    onSuccess: () => {
      useAuthStore.getState().clearSession();
    },
  });
}
