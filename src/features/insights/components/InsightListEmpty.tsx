import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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
      <View style={styles.searchLoading}>
        <ActivityIndicator size="large" color={colors.primary} />
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
  },
});
