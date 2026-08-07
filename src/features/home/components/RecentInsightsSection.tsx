import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { InsightItemCard } from '@/features/insights/components/InsightItemCard';
import type { InsightCardModel } from '@/features/insights/api/types';
import { expandHitSlop, minTouchTargetStyle } from '@/shared/accessibility';
import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface RecentInsightsSectionProps {
  insights: InsightCardModel[];
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

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Typography variant="h3" accessibilityRole="header">
          Recent Insights
        </Typography>
        {insights.length > 0 && (
          <Pressable
            onPress={onViewAll}
            hitSlop={expandHitSlop(24)}
            style={minTouchTargetStyle}
            accessibilityRole="button"
            accessibilityLabel="View all insights"
          >
            <Typography variant="body2" color={colors.primary} style={styles.viewAll}>
              View All
            </Typography>
          </Pressable>
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        {insights.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../../../assets/images/Folder.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
            <Typography variant="body1" color={colors.textSecondary} align="center">
              No recent insights yet
            </Typography>
          </View>
        ) : (
          insights.map((insight) => (
            <View key={insight.id} style={{ marginHorizontal: spacing.md }}>
              <InsightItemCard
                insight={insight}
                onPress={() => onView?.(insight.id)}
                onRename={onRename}
                onView={onView}
                onDelete={onDelete}
                onExportPdf={onExportPdf}
              />
            </View>
          ))
        )}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  illustration: {
    width: 140,
    height: 140,
  },
});
