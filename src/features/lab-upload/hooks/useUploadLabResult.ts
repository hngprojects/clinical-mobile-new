import { useQueryClient } from '@tanstack/react-query';

import { useApiMutation } from '@/shared/api/hooks';

import { uploadApi } from '../api/upload.api';
import type { UploadRequest } from '../api/upload.types';

export function useUploadLabResult() {
  const queryClient = useQueryClient();

  return useApiMutation((request: UploadRequest) => uploadApi.uploadLabResult(request), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insight-cases'] });
    },
  });
}
