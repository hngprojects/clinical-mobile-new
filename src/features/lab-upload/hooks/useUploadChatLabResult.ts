import { useQueryClient } from '@tanstack/react-query';

import { useApiMutation } from '@/shared/api/hooks';

import { uploadApi } from '../api/upload.api';
import type { UploadChatLabResultRequest } from '../api/upload.types';

export function useUploadChatLabResult() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (request: UploadChatLabResultRequest) => uploadApi.uploadLabResultToCase(request),
    {
      onSuccess: (_data, request) => {
        queryClient.invalidateQueries({ queryKey: ['ai-review', request.caseId] });
        queryClient.invalidateQueries({ queryKey: ['ai-review-history', request.caseId] });
        queryClient.invalidateQueries({ queryKey: ['case-chat', request.caseId] });
      },
    },
  );
}
