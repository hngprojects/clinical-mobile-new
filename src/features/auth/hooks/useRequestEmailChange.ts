import { useApiMutation } from '@/shared/api/hooks';

import { authApi } from '../api/auth.api';

export function useRequestEmailChange() {
  return useApiMutation(authApi.requestEmailChange);
}
