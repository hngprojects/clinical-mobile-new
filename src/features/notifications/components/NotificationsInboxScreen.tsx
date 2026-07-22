import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Toast, Typography } from '@/shared/components';
import { useNotificationStream } from '@/shared/hooks/useNotificationStream';
import { useTheme } from '@/shared/theme';

import { notificationsApi } from '../api/notifications.api';
import type { Notification } from '../api/notifications.types';
import {
  NOTIFICATIONS_KEY,
  UNREAD_COUNT_KEY,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '../hooks/useNotifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sectionKey(iso: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return 'Older';

  const now = new Date();
  const notificationDate = new Date(ms);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const notificationDay = Date.UTC(
    notificationDate.getFullYear(),
    notificationDate.getMonth(),
    notificationDate.getDate(),
  );
  const days = Math.round((today - notificationDay) / 86_400_000);

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days <= 7) return 'This Week';
  if (days <= 14) return 'Last Week';
  return 'Older';
}

const SECTION_ORDER = ['Today', 'Yesterday', 'This Week', 'Last Week', 'Older'];

function groupIntoSections(list: Notification[]): { title: string; data: Notification[] }[] {
  const map = new Map<string, Notification[]>();
  for (const n of list) {
    const key = sectionKey(n.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return SECTION_ORDER.filter((k) => map.has(k)).map((k) => ({ title: k, data: map.get(k)! }));
}

function notificationDescription(n: Notification): string {
  if (n.message && typeof n.message.text === 'string') return n.message.text;
  if (n.type === 'interpretation_ready')
    return 'Your lab results have been analysed and are ready to view.';
  if (n.type === 'interpretation_failed')
    return 'We were unable to process your lab results. Please try again.';
  return '';
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyRoot}>
      <Image
        source={require('../../../../assets/images/empty-notifications.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Typography variant="h3" style={styles.emptyTitle}>
        No Notifications Yet!
      </Typography>
      <Typography variant="body2" color={colors.textSecondary} style={styles.emptySubtitle}>
        We&apos;ll notify you when there&apos;s something new to review.
      </Typography>
    </View>
  );
}

// ─── Notification item ────────────────────────────────────────────────────────

function NotificationItem({ item }: { item: Notification }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { mutate: markRead } = useMarkRead();
  const canViewResult = item.type === 'interpretation_ready' && Boolean(item.medicalCaseId);

  const handlePress = () => {
    if (!item.isRead) markRead(item.id);
    if (canViewResult && item.medicalCaseId) {
      router.push({
        pathname: '/(main)/chat-review',
        params: { caseId: item.medicalCaseId, returnTo: 'notifications' },
      });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.item, { backgroundColor: colors.surfaceMuted }]}
      accessibilityRole={canViewResult ? 'button' : undefined}
    >
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      <View style={styles.itemContent}>
        <Typography variant="body1" numberOfLines={1} style={styles.itemTitle}>
          {item.title}
        </Typography>
        <Typography variant="body2" numberOfLines={2} style={styles.itemMessage}>
          {notificationDescription(item)}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} style={styles.itemTime}>
          {relativeTime(item.createdAt)}
        </Typography>
        {canViewResult && (
          <>
            <View style={styles.itemDivider} />
            <View style={styles.itemActionRow}>
              <Typography variant="body2" color={colors.primary} style={styles.viewResult}>
                View result
              </Typography>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NotificationsInboxScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError, refetch } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [showToast, setShowToast] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const list = notifications ?? [];
  const hasUnread = unreadCount > 0 || list.some((notification) => !notification.isRead);
  const sections = groupIntoSections(list);

  // Refresh list in real-time when new notifications arrive via SSE
  useNotificationStream({
    onEvent: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleMarkAllRead = async () => {
    const unread = list.filter((n) => !n.isRead);
    if (!hasUnread) return;

    setMarkingAll(true);
    try {
      const result = await notificationsApi.markAllRead(
        unread.map((notification) => notification.id),
      );

      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });

      if (result.markedCount > 0 && result.failedCount === 0) {
        setShowToast(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setShowToast(false), 3000);
      }
    } finally {
      setMarkingAll(false);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const isEmpty = !isLoading && !isError && list.length === 0;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      <Toast
        visible={showToast}
        message="Your notifications are now up to date. All previous alerts have been marked as read."
        variant="success"
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Typography variant="body1" style={styles.headerTitle}>
          Notifications
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.loader}>
          <Typography variant="body2" color={colors.textSecondary}>
            Failed to load notifications. Pull down to retry.
          </Typography>
        </View>
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
              <Typography variant="body1" style={styles.sectionLabel}>
                {section.title}
              </Typography>
              {section.title === sections[0]?.title && hasUnread && (
                <Pressable onPress={handleMarkAllRead} hitSlop={8} disabled={markingAll}>
                  <Typography variant="body2" color={colors.primary} style={styles.markReadText}>
                    {markingAll ? 'Marking...' : 'Mark all as read'}
                  </Typography>
                </Pressable>
              )}
            </View>
          )}
          renderItem={({ item }) => <NotificationItem item={item} />}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshing={isRefreshing}
          onRefresh={() => {
            void handleRefresh();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '500' },
  headerSpacer: { width: 32 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.12,
    lineHeight: 18,
  },
  markReadText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 24,
  },

  item: {
    borderRadius: 12,
    marginBottom: 12,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 28,
    right: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
    gap: 10,
  },
  itemTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
    paddingRight: 42,
  },
  itemMessage: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
  },
  viewResult: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
  },

  // Empty state
  emptyRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyImage: {
    width: 200,
    height: 180,
    marginBottom: 8,
  },
  emptyTitle: { fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { textAlign: 'center', lineHeight: 22 },
});
