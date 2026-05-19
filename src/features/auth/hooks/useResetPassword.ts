import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useResetPassword() {
  return useApiMutation(authApi.resetPassword);
}
