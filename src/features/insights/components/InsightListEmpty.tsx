import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { InsightUploadEmptyState } from './InsightUploadEmptyState';

interface InsightListEmptyProps {
  hasAnyItems: boolean;
  onUploadPress: () => void;
}

export function InsightListEmpty({ hasAnyItems, onUploadPress }: InsightListEmptyProps) {
  const { colors, spacing } = useTheme();

  if (!hasAnyItems) {
    return <InsightUploadEmptyState onUploadPress={onUploadPress} />;
  }

  return (
    <View style={[styles.searchEmpty, { paddingHorizontal: spacing.md }]}>
      <Typography variant="body2" color={colors.textSecondary} align="center">
        No insights match your search.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  searchEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
});
