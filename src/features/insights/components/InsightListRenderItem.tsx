import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback } from 'react';
import { Alert } from 'react-native';

import type { InsightListItem } from '../api/types';
import { casesApi } from '../api/cases.api';

import { InsightItemCard } from './InsightItemCard';

interface InsightListRenderItemProps {
  item: InsightListItem;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function InsightListRenderItem({ item, onRename, onDelete }: InsightListRenderItemProps) {
  const router = useRouter();

  const handleExportPdf = useCallback(
    async (_id: string) => {
      try {
        const caseId = item.caseId ?? item.id;
        const uri = await casesApi.exportCasePdf(caseId);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
        } else {
          Alert.alert('Export complete', `PDF saved to: ${uri}`);
        }
      } catch {
        Alert.alert('Export failed', 'Unable to export PDF. Please try again.');
      }
    },
    [item.caseId, item.id],
  );

  const openChatReview = useCallback(() => {
    const caseId = item.caseId ?? item.id;

    if (caseId) {
      router.push({ pathname: '/(main)/chat-review', params: { caseId, returnTo: 'insights' } });
      return;
    }

    router.push('/(main)/chat-review?demo=true');
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
        onExportPdf={handleExportPdf}
      />
    </>
  );
}
