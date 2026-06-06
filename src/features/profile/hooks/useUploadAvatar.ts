import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useUploadAvatar() {
  return useApiMutation(authApi.uploadAvatar, {
    onSuccess: (user) => {
      useAuthStore.getState().patchUser({ avatarUrl: user.avatarUrl });
    },
  });
}
