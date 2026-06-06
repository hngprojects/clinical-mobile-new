import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApiQuery } from '@/shared/api/hooks';

import type { InsightListItem } from '../api/types';

import { casesApi, type CaseListItem, type CasesListResponse } from '../api/cases.api';

export function useInsightCases(offset = 0, limit = 50) {
  const queryClient = useQueryClient();
  const query = useApiQuery(
    ['insight-cases', offset, limit],
    () => casesApi.listCases(offset, limit),
    {
      retry: false,
    },
  );

  const renameCase = useCallback(
    async (caseId: string, title: string) => {
      await queryClient.cancelQueries({ queryKey: ['insight-cases'] });

      const previousQueries = queryClient.getQueriesData<CasesListResponse>({
        queryKey: ['insight-cases'],
      });

      queryClient.setQueriesData<CasesListResponse>(
        { queryKey: ['insight-cases'] },
        (current: CasesListResponse | undefined) => {
          if (!current) return current;

          return {
            ...current,
            data: current.data.map((item: CaseListItem) =>
              item.id === caseId ? { ...item, title } : item,
            ),
          };
        },
      );

      try {
        await casesApi.updateCaseTitle(caseId, title);
      } catch (error) {
        previousQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
        throw error;
      }
    },
    [queryClient],
  );

  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const insightItems = useMemo(
    () => mapCasesToInsightItems(query.data?.data ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data?.data, updateTrigger],
  );

  return {
    ...query,
    insightItems,
    renameCase,
    refetch: query.refetch,
  };
}

export function mapCasesToInsightItems(cases: CaseListItem[]): InsightListItem[] {
  return cases.map((item) => ({
    id: item.id,
    caseId: item.id,
    title: item.title,
    subtitle: formatCaseSubtitle(item),
  }));
}

function formatCaseSubtitle(item: CaseListItem) {
  const createdAt = new Date(item.created_at);
  if (Number.isNaN(createdAt.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - createdAt.getTime());
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}
