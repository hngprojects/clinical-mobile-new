import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useVerifyEmailChange() {
  return useApiMutation(authApi.verifyEmailChange);
}
