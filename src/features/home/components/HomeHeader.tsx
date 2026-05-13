import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface HomeHeaderProps {
  name?: string;
}

export function HomeHeader({ name = 'User' }: HomeHeaderProps) {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  return (
    <View
      style={[styles.container, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}
    >
      <View style={styles.textGroup}>
        <Typography variant="h2">Hello, {name}</Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          Here&apos;s a quick overview of your lab results.
        </Typography>
      </View>
      <Pressable
        onPress={() => router.push('/(main)/notifications' as never)}
        style={[styles.bellButton, { backgroundColor: colors.cardBackground }]}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
