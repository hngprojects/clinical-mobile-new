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
      title={item.title}
      subtitle={item.subtitle}
      onRename={(next) => onRename(item.id, next)}
      onDelete={() => onDelete(item.id)}
    />
  );
}
