import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_CARD_BORDER, PROFILE_SECTION_LABEL } from '../constants';

interface ProfileMenuSectionProps {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}

export function ProfileMenuSection({ title, titleColor, children }: ProfileMenuSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Typography
        variant="label"
        color={titleColor ?? PROFILE_SECTION_LABEL}
        style={styles.sectionLabel}
      >
        {title.toUpperCase()}
      </Typography>
      <View
        style={[styles.card, { backgroundColor: colors.surface, borderColor: PROFILE_CARD_BORDER }]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    fontFamily: 'Inter_600SemiBold',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
