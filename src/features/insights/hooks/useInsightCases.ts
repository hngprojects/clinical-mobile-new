import { useEffect, useMemo } from 'react';

import { useApiQuery } from '@/shared/api/hooks';

import type { InsightListItem } from '../api/types';

import { casesApi, type CaseListItem } from '../api/cases.api';

const CASES_QUERY_KEY = ['insight-cases', 0, 50];

export function useInsightCases(offset = 0, limit = 50) {
  const query = useApiQuery(CASES_QUERY_KEY, () => casesApi.listCases(offset, limit), {
    retry: false,
  });

  const insightItems = useMemo(() => mapCasesToInsightItems(query.data?.data ?? []), [query.data]);

  useEffect(() => {
    if (query.data) {
      console.log('[Insights cases]', query.data);
    }
  }, [query.data]);

  return {
    ...query,
    insightItems,
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
  const createdLabel = Number.isNaN(createdAt.getTime())
    ? 'Unknown date'
    : createdAt.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return `${createdLabel} • ${item.status}`;
}
