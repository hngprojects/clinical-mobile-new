import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
    paddingHorizontal: 16,
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
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  headerSpacer: { width: 32 },
});
