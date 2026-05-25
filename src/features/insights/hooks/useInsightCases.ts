import { useEffect, useMemo, useState } from 'react';

import { useApiQuery } from '@/shared/api/hooks';

import type { InsightListItem } from '../api/types';

import { casesApi, type CaseListItem } from '../api/cases.api';

const CASES_QUERY_KEY = ['insight-cases', 0, 50];

export function useInsightCases(offset = 0, limit = 50) {
  const query = useApiQuery(CASES_QUERY_KEY, () => casesApi.listCases(offset, limit), {
    retry: false,
  });

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
    [query.data, updateTrigger],
  );

  useEffect(() => {
    if (query.data) {
      console.log('[Insights cases]', query.data);
    }
  }, [query.data]);

  return {
    ...query,
    insightItems,
    refetch: query.refetch,
  };
}

function mapCasesToInsightItems(cases: CaseListItem[]): InsightListItem[] {
  return cases.map((item) => ({
    id: item.id,
    title: `Case ${item.id.slice(0, 8)}`,
    subtitle: formatCaseSubtitle(item),
  }));
}

function formatCaseSubtitle(item: CaseListItem) {
  const createdAt = new Date(item.created_at);
  if (Number.isNaN(createdAt.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
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
