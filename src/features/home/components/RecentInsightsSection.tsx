import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { Insight, InsightCard } from './InsightCard';

interface RecentInsightsSectionProps {
  insights: Insight[];
  onViewAll?: () => void;
  onRename?: (id: string, newTitle: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExportPdf?: (id: string) => void;
}

export function RecentInsightsSection({
  insights,
  onViewAll,
  onRename,
  onView,
  onDelete,
  onExportPdf,
}: RecentInsightsSectionProps) {
  const { colors, spacing } = useTheme();
  const hasInsights = insights.length > 0;

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Typography variant="h3">Recent Insights</Typography>
        {hasInsights ? (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <Typography variant="body2" color={colors.primary} style={styles.viewAll}>
              View All
            </Typography>
          </Pressable>
        ) : null}
      </View>

      {hasInsights ? (
        <View style={{ gap: spacing.md }}>
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onPress={onView}
              onRename={onRename}
              onView={onView}
              onDelete={onDelete}
              onExportPdf={onExportPdf}
            />
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderSubtle,
              marginHorizontal: spacing.md,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySubtle }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.emptyText}>
            <Typography variant="body1" style={styles.emptyTitle}>
              No insights yet
            </Typography>
            <Typography variant="body2" color={colors.textSecondary} style={styles.emptyBody}>
              Your latest lab interpretations will appear here after you upload a result.
            </Typography>
          </View>
        </View>
      )}
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
  emptyCard: {
    minHeight: 124,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    flex: 1,
    gap: 4,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptyBody: {
    lineHeight: 20,
  },
});
