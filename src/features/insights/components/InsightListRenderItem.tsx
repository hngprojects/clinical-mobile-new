import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';

import type { InsightListItem } from '../api/types';

import { InsightItemCard } from './InsightItemCard';

interface InsightListRenderItemProps {
  item: InsightListItem;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function InsightListRenderItem({ item, onRename, onDelete }: InsightListRenderItemProps) {
  const router = useRouter();

  const openChatReview = useCallback(() => {
    router.push('/(main)/chat-review?demo=true');
  }, [router]);

  return (
    <InsightItemCard
      insight={{
        id: item.id,
        title: item.title,
        timestamp: item.subtitle,
      }}
      onPress={openChatReview}
      onView={() => openChatReview()}
      onRename={onRename}
      onDelete={onDelete}
    />
  );
}
