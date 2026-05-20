import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useVerifyOtp() {
  return useApiMutation(authApi.verifyOtp);
}
