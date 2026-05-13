import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { Insight, InsightCard } from './InsightCard';

interface RecentInsightsSectionProps {
  insights: Insight[];
  onViewAll?: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export function RecentInsightsSection({ insights, onViewAll, onRename, onDelete }: RecentInsightsSectionProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Typography variant="h3">Recent Insights</Typography>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Typography variant="body2" color={colors.primary} style={styles.viewAll}>
            View All
          </Typography>
        </Pressable>
      </View>

      <View style={{ gap: spacing.md }}>
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} onRename={onRename} onDelete={onDelete} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    textDecorationLine: 'underline',
  },
});
