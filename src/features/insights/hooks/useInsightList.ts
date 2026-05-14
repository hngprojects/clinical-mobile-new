import { useCallback, useEffect, useMemo, useState } from 'react';

import type { InsightListItem } from '../api/types';
import { DUMMY_INSIGHT_LIST } from '../data/dummyInsights';

const SEARCH_DEBOUNCE_MS = 420;

export function useInsightList() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<InsightListItem[]>(() => [...DUMMY_INSIGHT_LIST]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const id = setTimeout(() => setIsSearching(false), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

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
    isSearching,
    addDemoInsight,
    renameInsight,
    deleteInsight,
  };
}
