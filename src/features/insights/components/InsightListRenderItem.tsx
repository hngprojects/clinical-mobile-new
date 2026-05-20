import React from 'react';

import type { InsightListItem } from '../api/types';

import { InsightItemCard } from './InsightItemCard';

interface InsightListRenderItemProps {
  item: InsightListItem;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function InsightListRenderItem({ item, onRename, onDelete }: InsightListRenderItemProps) {
  return (
    <InsightItemCard
      insight={{
        id: item.id,
        title: item.title,
        timestamp: item.subtitle,
      }}
      onRename={onRename}
      onDelete={onDelete}
    />
  );
}
