import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
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
  const { data: unreadCount } = useUnreadCount();

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
      <View style={styles.bellWrapper}>
        <Pressable
          onPress={() => router.push('/(main)/notification-inbox')}
          style={[
            styles.bellButton,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
          ]}
        >
          <Ionicons
            name={unreadCount ? 'notifications' : 'notifications-outline'}
            size={22}
            color={colors.text}
          />
        </Pressable>
        {!!unreadCount && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Typography variant="body2" style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : String(unreadCount)}
            </Typography>
          </View>
        )}
      </View>
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
  bellWrapper: {
    position: 'relative',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
});
