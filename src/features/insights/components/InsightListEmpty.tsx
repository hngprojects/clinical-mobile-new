import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { InsightSearchEmptyState } from './InsightSearchEmptyState';
import { InsightUploadEmptyState } from './InsightUploadEmptyState';

interface InsightListEmptyProps {
  hasAnyItems: boolean;
  /** User has typed a query but the list has no rows yet (searching or no matches). */
  isSearchActive: boolean;
  isSearching: boolean;
  onUploadPress: () => void;
}

export function InsightListEmpty({
  hasAnyItems,
  isSearchActive,
  isSearching,
  onUploadPress,
}: InsightListEmptyProps) {
  const { colors } = useTheme();

  if (!hasAnyItems) {
    return <InsightUploadEmptyState onUploadPress={onUploadPress} />;
  }

  if (isSearchActive && isSearching) {
    return (
      <View
        style={styles.searchLoading}
        accessibilityLabel="Searching insights"
        accessibilityLiveRegion="polite"
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          accessibilityLabel="Searching insights"
        />
        <Typography variant="body2" color={colors.textSecondary} style={styles.loadingText}>
          Searching insights...
        </Typography>
      </View>
    );
  }

  if (isSearchActive) {
    return <InsightSearchEmptyState />;
  }

  return null;
}

const styles = StyleSheet.create({
  searchLoading: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    textAlign: 'center',
  },
});
