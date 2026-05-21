import { useApiQuery } from '@/shared/api/hooks';

import { aiReviewApi } from '../api/ai-review.api';

export function useAiReview(caseId: string, guestSessionId?: string | null) {
  return useApiQuery(
    ['ai-review', caseId, guestSessionId],
    () => aiReviewApi.getLatestInterpretation(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      refetchInterval: false,
      retry: false,
    },
  );
}
