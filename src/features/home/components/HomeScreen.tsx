import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { casesApi } from '@/features/insights/api/cases.api';
import { useInsightCases } from '@/features/insights/hooks/useInsightCases';
import {
  NOTIFICATIONS_KEY,
  UNREAD_COUNT_KEY,
} from '@/features/notifications/hooks/useNotifications';
import { Toast, UploadBottomSheet, UploadedFile, UploadError } from '@/shared/components';
import { useNotificationStream } from '@/shared/hooks/useNotificationStream';
import { useTheme } from '@/shared/theme';

import { useHome } from '../hooks/useHome';
import { HomeHeader } from './HomeHeader';
import { Insight } from './InsightCard';
import { RecentInsightsSection } from './RecentInsightsSection';
import { UploadCard } from './UploadCard';

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user, isGuest } = useHome();
  const router = useRouter();
  const { insightItems, renameCase } = useInsightCases(0, 3);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  useNotificationStream({
    onEvent: (event) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });

      if (event.event === 'interpretation_ready') {
        setToastMessage('Your lab results are ready to view.');
        setShowToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setShowToast(false), 4000);
      } else if (event.event === 'interpretation_failed') {
        setToastMessage('Unable to process your lab results. Please try again.');
        setShowToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setShowToast(false), 4000);
      }
    },
  });

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const insights = useMemo<Insight[]>(
    () =>
      insightItems.map((item) => ({
        caseId: item.caseId ?? item.id,
        id: item.id,
        title: item.title,
        timestamp: item.subtitle,
      })),
    [insightItems],
  );

  const handleUpload = (file: UploadedFile) => {
    router.push({
      pathname: '/(main)/preview-upload',
      params: {
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType,
      },
    });
  };

  const handleUploadError = (error: UploadError) => {
    router.push({
      pathname: '/(main)/preview-upload',
      params: { errorType: error.type },
    });
  };

  const handleRename = (id: string, newTitle: string) => {
    renameCase(id, newTitle).catch((error) => {
      if (__DEV__) {
        console.error('[HomeScreen] Rename failed', error);
      }
    });
  };

  const handleDelete = (id: string) => {
    void id;
  };

  const handleExportPdf = useCallback(
    async (id: string) => {
      try {
        const insight = insights.find((i) => i.id === id);
        const caseId = insight?.caseId ?? id;
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
    [insights],
  );

  const handleViewInsight = useCallback(
    (id: string) => {
      const insight = insights.find((i) => i.id === id);
      if (insight?.caseId) {
        router.push({
          pathname: '/(main)/chat-review',
          params: { caseId: insight.caseId, returnTo: 'home' },
        });
      } else {
        router.push('/(main)/chat-review?demo=true');
      }
    },
    [insights, router],
  );

  return (
    <>
      <Toast
        visible={showToast}
        message={toastMessage}
        variant={toastMessage.includes('ready') ? 'success' : 'error'}
      />
      <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
        <HomeHeader name={isGuest ? 'Guest' : (user?.firstName ?? 'User')} />
        <ScrollView
          style={styles.fill}
          contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <UploadCard onUpload={() => setShowUploadSheet(true)} />
          <RecentInsightsSection
            insights={insights}
            onViewAll={() => router.push('/(main)/insights')}
            onRename={handleRename}
            onView={handleViewInsight}
            onDelete={handleDelete}
            onExportPdf={handleExportPdf}
          />
        </ScrollView>
      </SafeAreaView>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUpload}
        onUploadError={handleUploadError}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
