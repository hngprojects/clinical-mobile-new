import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  backButtonLabel,
  expandHitSlop,
  minTouchTargetStyle,
  MIN_TOUCH_TARGET,
} from '@/shared/accessibility';
import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

interface AppScreenHeaderProps {
  title: string;
  onBack: () => void;
}

export function AppScreenHeader({ title, onBack }: AppScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={[styles.backButton, minTouchTargetStyle]}
        hitSlop={expandHitSlop(24)}
        accessibilityRole="button"
        accessibilityLabel={backButtonLabel(title)}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} accessible={false} />
      </Pressable>
      <Typography variant="body1" style={styles.headerTitle} accessibilityRole="header">
        {title}
      </Typography>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  headerSpacer: { width: MIN_TOUCH_TARGET },
});
