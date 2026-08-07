import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useApiQuery } from '@/shared/api/hooks';

import { casesApi, type CasesListResponse } from '../api/cases.api';

export function useCaseName(caseId: string | undefined): string | undefined {
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const queryClient = useQueryClient();

  const cachedTitle = isAuthenticated ? getCachedCaseTitle(queryClient, caseId) : undefined;

  const query = useApiQuery(['case', caseId], () => casesApi.getCaseById(caseId!), {
    enabled: isAuthenticated && !!caseId && cachedTitle === undefined,
  });

  if (!isAuthenticated) return undefined;

  return cachedTitle ?? query.data?.title ?? undefined;
}

function getCachedCaseTitle(
  queryClient: ReturnType<typeof useQueryClient>,
  caseId: string | undefined,
): string | undefined {
  if (!caseId) return undefined;

  const queries = queryClient.getQueriesData<CasesListResponse>({ queryKey: ['insight-cases'] });

  for (const [, data] of queries) {
    const found = data?.data.find((item) => item.id === caseId);
    if (found?.title) return found.title;
  }

  return undefined;
}
