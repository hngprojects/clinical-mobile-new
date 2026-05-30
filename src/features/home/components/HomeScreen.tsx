import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInsightCases } from '@/features/insights/hooks/useInsightCases';
import { UploadBottomSheet, UploadedFile, UploadError } from '@/shared/components';
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

  const handleViewInsight = useCallback(
    (id: string) => {
      const insight = insights.find((i) => i.id === id);
      if (insight?.caseId) {
        router.push({ pathname: '/(main)/chat-review', params: { caseId: insight.caseId } });
      } else {
        router.push('/(main)/chat-review?demo=true');
      }
    },
    [insights, router],
  );

  return (
    <>
      <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]} edges={['top']}>
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
