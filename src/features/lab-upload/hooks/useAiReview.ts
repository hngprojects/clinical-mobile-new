import { useQueryClient } from '@tanstack/react-query';

import { useApiQuery } from '@/shared/api/hooks';
import { useNotificationStream } from '@/shared/hooks/useNotificationStream';

import { aiReviewApi } from '../api/ai-review.api';

interface UseAiReviewOptions {
  keepStreamOpen?: boolean;
  onInterpretationEvent?: (status: 'ready' | 'failed') => void;
}

export function useAiReview(
  caseId: string,
  guestSessionId?: string | null,
  options: UseAiReviewOptions = {},
) {
  const queryClient = useQueryClient();
  const queryKey = ['ai-review', caseId, guestSessionId];
  const { keepStreamOpen = false, onInterpretationEvent } = options;

  const query = useApiQuery(
    queryKey,
    () => aiReviewApi.getLatestInterpretation(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      retry: false,
      refetchInterval: (q) => {
        if (q.state.error) return false;

        const status = q.state.data?.status;
        if (keepStreamOpen) return status === 'failed' ? false : 10_000;
        if (status === 'complete' || status === 'completed' || status === 'failed') return false;

        return 10_000;
      },
    },
  );

  const isSettled =
    query.data?.status === 'complete' ||
    query.data?.status === 'completed' ||
    query.data?.status === 'failed';

  useNotificationStream({
    enabled: Boolean(caseId) && (keepStreamOpen || !isSettled),
    guestSessionId,
    onEvent: ({ event, data }) => {
      const isMatch =
        (event === 'interpretation_ready' || event === 'interpretation_failed') &&
        data.case_id === caseId;

      if (isMatch) {
        onInterpretationEvent?.(event === 'interpretation_ready' ? 'ready' : 'failed');
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['ai-review-history', caseId, guestSessionId] });
      }
    },
  });

  return query;
}

export function useAiReviewHistory(caseId: string, guestSessionId?: string | null) {
  return useApiQuery(
    ['ai-review-history', caseId, guestSessionId],
    () => aiReviewApi.getInterpretations(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      retry: false,
    },
  );
}
