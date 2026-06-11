import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';
import type { LoginFormData } from '../schemas/auth.schemas';
import { useAuthStore } from '../store/auth.store';

export function useLogin(options: { caseId?: string; guestSessionId?: string } = {}) {
  return useApiMutation((data: LoginFormData) =>
    authApi.login({
      ...data,
      guestSessionId: options.guestSessionId ?? useAuthStore.getState().guestSessionId ?? undefined,
    }),
  );
}
