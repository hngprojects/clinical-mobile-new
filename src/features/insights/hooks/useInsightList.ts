import { useCallback, useMemo, useState } from 'react';

import type { InsightListItem } from '../api/types';
import { DUMMY_INSIGHT_LIST } from '../data/dummyInsights';

export function useInsightList() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<InsightListItem[]>(() => [...DUMMY_INSIGHT_LIST]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => row.title.toLowerCase().includes(q));
  }, [items, query]);

  const addDemoInsight = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        title: 'Hormone Health Discussion',
        subtitle: '2 mins ago',
      },
    ]);
  }, []);

  const renameInsight = useCallback((id: string, title: string) => {
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, title } : row)));
  }, []);

  const deleteInsight = useCallback((id: string) => {
    setItems((prev) => prev.filter((row) => row.id !== id));
  }, []);

  return {
    query,
    setQuery,
    items,
    filtered,
    addDemoInsight,
    renameInsight,
    deleteInsight,
  };
}
