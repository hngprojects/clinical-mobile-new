import { useApiQuery } from '@/shared/api/hooks';

import { aiReviewApi } from '../api/ai-review.api';

export function useAiReview(caseId: string, guestSessionId?: string | null) {
  return useApiQuery(
    ['ai-review', caseId, guestSessionId],
    () => aiReviewApi.getLatestInterpretation(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === 'complete' || status === 'failed' ? false : 1200;
      },
    },
  );
}
