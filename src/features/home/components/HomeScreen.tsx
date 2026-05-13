import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/shared/theme';

import { useHome } from '../hooks/useHome';
import { HomeHeader } from './HomeHeader';
import { Insight } from './InsightCard';
import { RecentInsightsSection } from './RecentInsightsSection';
import { UploadCard } from './UploadCard';

const MOCK_INSIGHTS: Insight[] = [
  { id: '1', title: 'Hormone Health Discussion', timestamp: '2 mins ago' },
  { id: '2', title: 'Hormone Health Discussion', timestamp: '2 mins ago' },
  { id: '3', title: 'Hormone Health Discussion', timestamp: '2 mins ago' },
];

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useHome();
  const [insights, setInsights] = useState<Insight[]>(MOCK_INSIGHTS);

  const handleRename = (id: string, newTitle: string) => {
    try {
      setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i)));
      Toast.show({
        type: 'success',
        text1: `You have successfully renamed your Insight to ${newTitle}`,
        topOffset: 60,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: "Sorry! We've encountered a problem renaming your Insight. Kindly try again.",
        topOffset: 60,
      });
    }
  };

  const handleDelete = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
    Toast.show({
      type: 'success',
      text1: 'Your Insight message has been successfully deleted',
      topOffset: 60,
    });
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]} edges={['top']}>
      <HomeHeader name={user?.firstName ?? 'User'} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <UploadCard />
        <RecentInsightsSection
          insights={insights}
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
