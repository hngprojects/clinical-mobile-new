import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

const folderIllustration = require('../../../../assets/images/Folder.png');

export function InsightSearchEmptyState() {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.root, { paddingTop: spacing.lg }]}>
      <Image source={folderIllustration} style={styles.illustration} resizeMode="contain" />
      <Typography variant="h3" align="center" style={styles.title}>
        No matching insights
      </Typography>
      <Typography
        variant="body2"
        color={colors.textSecondary}
        align="center"
        style={styles.subtitle}
      >
        Try another keyword or upload a new result.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },
  title: {
    maxWidth: 320,
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 22,
  },
});
