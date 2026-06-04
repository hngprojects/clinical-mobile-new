import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useVerifyResetOtp() {
  return useApiMutation(authApi.verifyResetOtp);
}
