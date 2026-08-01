import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

interface OnboardingDotsProps {
  total: number;
  current: number;
  accentColor?: string;
}

export function OnboardingDots({ total, current, accentColor }: OnboardingDotsProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.xs }]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === current ? (accentColor ?? colors.primary) : colors.border,
              width: i === current ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
