import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';

import { useHome } from '../hooks/useHome';
import { HomeHeader } from './HomeHeader';
import { Insight } from './InsightCard';
import { RecentInsightsSection } from './RecentInsightsSection';
import { UploadCard } from './UploadCard';

const MOCK_INSIGHTS: Insight[] = [
  { id: '1', title: 'Hormone Health Discussion', timestamp: '2 mins ago' },
  { id: '2', title: 'Pregnancy Test Update', timestamp: '15 mins ago' },
  { id: '3', title: 'Menstrual Cycle Complications', timestamp: '40 mins ago' },
];

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user, isGuest } = useHome();
  const router = useRouter();
  const [insights, setInsights] = useState<Insight[]>(MOCK_INSIGHTS);

  const handleRename = (id: string, newTitle: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i)));
  };

  const handleDelete = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeHeader name={isGuest ? 'Guest' : (user?.firstName ?? 'User')} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <UploadCard onUpload={() => router.push('/(main)/preview-upload')} />
        <RecentInsightsSection
          insights={insights}
          onViewAll={() => router.push('/(main)/insights')}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

