import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useInsightCases } from '@/features/insights/hooks/useInsightCases';
import { useTheme } from '@/shared/theme';

import { useHome } from '../hooks/useHome';
import { HomeHeader } from './HomeHeader';
import { Insight } from './InsightCard';
import { RecentInsightsSection } from './RecentInsightsSection';
import { UploadCard } from './UploadCard';
import { UploadBottomSheet, UploadedFile, UploadError } from '@/shared/components';

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user, isGuest } = useHome();
  const router = useRouter();
  const { insightItems, renameCase } = useInsightCases(0, 3);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  useEffect(() => {
    if (insightItems.length > 0) {
      setInsights(
        insightItems.map((item) => ({
          id: item.id,
          title: item.title,
          timestamp: item.subtitle,
        })),
      );
    }
  }, [insightItems]);

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
    let previousInsights: Insight[] = [];

    setInsights((prev) => {
      previousInsights = prev;
      return prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i));
    });

    renameCase(id, newTitle).catch(() => {
      setInsights(previousInsights);
    });
  };

  const handleDelete = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  const handleViewInsight = (_id: string) => {
    router.push('/(main)/chat-review?demo=true');
  };

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
