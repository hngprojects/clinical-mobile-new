import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useCompletePasswordReset() {
  return useApiMutation(authApi.completePasswordReset);
}
