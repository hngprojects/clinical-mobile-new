import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface UploadCardProps {
  onUpload?: () => void;
}

export function UploadCard({ onUpload }: UploadCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          marginHorizontal: spacing.md,
          padding: spacing.xl,
          borderRadius: 16,
          gap: spacing.md,
          borderWidth: 1,
          borderColor: '#F0F0F0',
        },
      ]}
    >
      <View style={styles.textGroup}>
        <Typography variant="h2" align="center">
          Upload your result
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} align="center">
          Upload your lab report to get started
        </Typography>
      </View>

      <TouchableOpacity onPress={onUpload} activeOpacity={0.8} style={styles.uploadButton}>
        <Ionicons name="arrow-up-circle-outline" size={20} color="#FFFFFF" />
        <Typography variant="body1" color="#FFFFFF" style={styles.buttonLabel}>
          Upload Result
        </Typography>
      </TouchableOpacity>

      <Typography variant="label" color={colors.textSecondary} align="center">
        JPEG, PDF and PNG formats up to 10MB
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  textGroup: {
    alignItems: 'center',
    gap: 6,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonLabel: {
    fontWeight: '600',
  },
});
