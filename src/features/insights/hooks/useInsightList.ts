import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { InsightListItem } from '../api/types';
import { DUMMY_INSIGHT_LIST } from '../data/dummyInsights';

const SEARCH_DEBOUNCE_MS = 420;

interface UseInsightListOptions {
  onRename?: (id: string, title: string) => Promise<void> | void;
}

export function useInsightList(
  initialItems: InsightListItem[] = DUMMY_INSIGHT_LIST,
  { onRename }: UseInsightListOptions = {},
) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<InsightListItem[]>(() => [...initialItems]);
  const [isSearching, setIsSearching] = useState(false);
  const previousItemsRef = useRef<InsightListItem[]>([]);

  useLayoutEffect(() => {
    setItems([...initialItems]);
  }, [initialItems]);

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

  const renameInsight = useCallback(
    async (id: string, title: string) => {
      setItems((prev) => {
        previousItemsRef.current = prev;
        return prev.map((row) => (row.id === id ? { ...row, title } : row));
      });

      try {
        await onRename?.(id, title);
      } catch (error) {
        setItems(previousItemsRef.current);
        console.error('[Insights] Failed to rename case', error);
      }
    },
    [onRename],
  );

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
