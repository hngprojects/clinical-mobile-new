import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_CARD_BORDER, PROFILE_HORIZONTAL_PADDING } from '../constants';

interface ProfileSettingsHeaderProps {
  title: string;
  onBack: () => void;
}

export function ProfileSettingsHeader({ title, onBack }: ProfileSettingsHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.surface, borderBottomColor: PROFILE_CARD_BORDER },
      ]}
    >
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Typography variant="body1" style={styles.headerTitle}>
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
    paddingHorizontal: PROFILE_HORIZONTAL_PADDING,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: '',
  },
  headerSpacer: { width: 32 },
});
