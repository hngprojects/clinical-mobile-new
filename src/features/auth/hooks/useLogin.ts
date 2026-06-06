import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useLogin(_options: { caseId?: string } = {}) {
  return useApiMutation(authApi.login);
}
