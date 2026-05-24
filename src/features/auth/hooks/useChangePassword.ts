import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useChangePassword() {
  return useApiMutation(authApi.changePassword);
}
