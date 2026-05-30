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
    if (item.caseId) {
      router.push({ pathname: '/(main)/chat-review', params: { caseId: item.caseId } });
      return;
    }

    router.push('/(main)/chat-review?demo=true');
  }, [item.caseId, router]);

  return (
    <>
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
    </>
  );
}
