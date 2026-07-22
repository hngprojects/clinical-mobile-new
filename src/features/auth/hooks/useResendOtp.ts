import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useResendOtp() {
  return useApiMutation(authApi.resendOtp);
}
