import { useApiQuery } from '@/shared/api/hooks';

import { aiReviewApi } from '../api/ai-review.api';

export function useAiReview(caseId: string) {
  return useApiQuery(['ai-review', caseId], () => aiReviewApi.getLatestInterpretation(caseId), {
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'complete' || status === 'failed' ? false : 1200;
    },
  });
}
