import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import { Toast } from '@/shared/components';

import type { InsightListItem } from '../api/types';

import { InsightItemCard } from './InsightItemCard';

interface InsightListRenderItemProps {
  item: InsightListItem;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function InsightListRenderItem({ item, onRename, onDelete }: InsightListRenderItemProps) {
  const router = useRouter();
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return undefined;

    const timer = setTimeout(() => setToastVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const openChatReview = useCallback(() => {
    const caseId = item.caseId ?? item.id;

    if (!caseId) {
      setToastVisible(true);
      return;
    }

    router.push({ pathname: '/(main)/chat-review', params: { caseId } });
  }, [item.caseId, item.id, router]);

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
      <Toast
        visible={toastVisible}
        message="Chat is not available for this insight."
        variant="neutral"
      />
    </>
  );
}
