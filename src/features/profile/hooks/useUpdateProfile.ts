import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useUpdateProfile() {
  return useApiMutation(authApi.updateProfile, {
    onSuccess: ({ user }) => {
      const state = useAuthStore.getState();
      if (state.user) {
        state.setSession(
          { accessToken: state.accessToken!, refreshToken: state.refreshToken! },
          user,
        );
      }
    },
  });
}
