import { useCallback, useEffect, useMemo, useState } from 'react';

import { useApiMutation, useApiQuery } from '@/shared/api/hooks';

import type { InsightListItem } from '../api/types';

import { casesApi, type CaseListItem } from '../api/cases.api';

export function useInsightCases(offset = 0, limit = 50) {
  const query = useApiQuery(
    ['insight-cases', offset, limit],
    () => casesApi.listCases(offset, limit),
    {
      retry: false,
    },
  );

  const renameMutation = useApiMutation(({ caseId, title }: { caseId: string; title: string }) =>
    casesApi.updateCaseTitle(caseId, title),
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

  useEffect(() => {
    if (__DEV__ && query.data) {
      console.log('[Insights cases]', query.data);
    }
  }, [query.data]);

  const renameCase = useCallback(
    (caseId: string, title: string) => renameMutation.mutateAsync({ caseId, title }),
    [renameMutation],
  );

  return {
    ...query,
    insightItems,
    renameCase,
    refetch: query.refetch,
  };
}

function mapCasesToInsightItems(cases: CaseListItem[]): InsightListItem[] {
  return cases.map((item) => ({
    id: item.id,
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
