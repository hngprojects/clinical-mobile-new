import { useQueryClient } from '@tanstack/react-query';

import { useApiQuery } from '@/shared/api/hooks';
import { useNotificationStream } from '@/shared/hooks/useNotificationStream';

import { aiReviewApi } from '../api/ai-review.api';

export function useAiReview(caseId: string, guestSessionId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['ai-review', caseId, guestSessionId];

  const query = useApiQuery(
    queryKey,
    () => aiReviewApi.getLatestInterpretation(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      retry: false,
      refetchInterval: (q) => {
        if (q.state.error) return false;
        const status = q.state.data?.status;
        if (status === 'complete' || status === 'failed') return false;
        // Fallback polling — only fires if SSE connection drops
        return 10_000;
      },
    },
  );

  const isSettled = query.data?.status === 'complete' || query.data?.status === 'failed';

  useNotificationStream({
    enabled: Boolean(caseId) && !isSettled,
    guestSessionId,
    onEvent: ({ event, data }) => {
      const isMatch =
        (event === 'interpretation_ready' || event === 'interpretation_failed') &&
        data.case_id === caseId;

      if (isMatch) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  return query;
}
