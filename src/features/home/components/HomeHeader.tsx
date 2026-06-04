import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface HomeHeaderProps {
  name?: string;
}

export function HomeHeader({ name = 'User' }: HomeHeaderProps) {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useUnreadCount();
  const hasUnread = unreadCount > 0;

  useFocusEffect(
    useCallback(() => {
      void refetchUnreadCount();
    }, [refetchUnreadCount]),
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: spacing.lg, paddingHorizontal: spacing.md, paddingTop: spacing.md },
      ]}
    >
      <View style={styles.textGroup}>
        <Typography variant="h2">Hello, {name}</Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          Here&apos;s a quick overview of your lab results.
        </Typography>
      </View>
      <Pressable
        onPress={() => router.push('/(main)/notification-inbox')}
        style={[
          styles.bellButton,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
        ]}
        accessibilityLabel={hasUnread ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Ionicons
          name={hasUnread ? 'notifications' : 'notifications-outline'}
          size={22}
          color={hasUnread ? colors.primary : colors.text}
        />
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
