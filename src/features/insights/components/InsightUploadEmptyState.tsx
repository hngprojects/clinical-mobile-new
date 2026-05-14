import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { INSIGHT_CARD_RADIUS, INSIGHT_RENAME_ACTIVE_BLUE } from '../api/constants';
import type { InsightUploadEmptyStateProps } from '../api/types';

const folderIllustration = require('../../../../assets/images/Folder.png');

export function InsightUploadEmptyState({ onUploadPress }: InsightUploadEmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.root, { paddingTop: spacing.xl }]}>
      <Image source={folderIllustration} style={styles.illustration} resizeMode="contain" />
      <Typography
        variant="body1"
        color={colors.textSecondary}
        align="center"
        style={styles.headline}
      >
        Upload your first lab report to get started
      </Typography>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Upload result"
        onPress={onUploadPress}
        style={({ pressed }) => [
          styles.uploadButton,
          {
            backgroundColor: INSIGHT_RENAME_ACTIVE_BLUE,
            paddingVertical: spacing.sm + 4,
            paddingHorizontal: spacing.lg,
            borderRadius: INSIGHT_CARD_RADIUS,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
        <Typography variant="body1" style={styles.uploadLabel}>
          Upload Result
        </Typography>
      </Pressable>
      <Typography
        variant="body2"
        color={colors.textSecondary}
        align="center"
        style={[styles.footer, { marginTop: spacing.md }]}
      >
        JPEG, PDF and PNG formats up to 10MB
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
    width: 220,
    height: 220,
    marginBottom: 8,
  },
  headline: {
    maxWidth: 320,
    marginBottom: 24,
    lineHeight: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 360,
  },
  uploadLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    maxWidth: 320,
    lineHeight: 20,
  },
});
