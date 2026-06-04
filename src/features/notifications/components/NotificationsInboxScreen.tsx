import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { notificationsApi } from '../api/notifications.api';
import type { Notification } from '../api/notifications.types';
import {
  NOTIFICATIONS_KEY,
  UNREAD_COUNT_KEY,
  useMarkRead,
  useNotifications,
} from '../hooks/useNotifications';

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

function sectionLabel(iso: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return 'Recent';
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function notificationDescription(n: Notification): string {
  if (n.message && typeof n.message.text === 'string') return n.message.text;
  if (n.type === 'interpretation_ready')
    return 'Your lab results have been simplified and are ready to view.';
  if (n.type === 'interpretation_failed')
    return 'We were unable to process your lab results. Please try again.';
  return '';
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ReadToast({ visible }: { visible: boolean }) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -120, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  return (
    <Animated.View
      style={[styles.toast, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
    >
      <View style={styles.toastIcon}>
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      </View>
      <Typography variant="body2" style={styles.toastText}>
        Your notifications are now up to date. All previous alerts have been marked as read.
      </Typography>
    </Animated.View>
  );
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
  const { mutate: markRead } = useMarkRead();

  const handlePress = () => {
    if (!item.isRead) markRead(item.id);
  };

  return (
    <Pressable onPress={handlePress} style={styles.item}>
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      <View style={styles.itemContent}>
        <Typography variant="body1" style={styles.itemTitle}>
          {item.title}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          {notificationDescription(item)}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} style={styles.itemTime}>
          {relativeTime(item.createdAt)}
        </Typography>
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NotificationsInboxScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError } = useNotifications();
  const [showToast, setShowToast] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const list = notifications ?? [];
  const hasUnread = list.some((n) => !n.isRead);

  const handleMarkAllRead = async () => {
    const unread = list.filter((n) => !n.isRead);
    if (!unread.length) return;

    setMarkingAll(true);
    const results = await Promise.allSettled(unread.map((n) => notificationsApi.markRead(n.id)));
    setMarkingAll(false);

    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });

    const anySucceeded = results.some((r) => r.status === 'fulfilled');
    if (anySucceeded) {
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const isEmpty = !isLoading && !isError && list.length === 0;
  const headerLabel = list[0] ? sectionLabel(list[0].createdAt) : 'Recent';

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
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
        <>
          <ReadToast visible={showToast} />

          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Typography variant="body1" style={styles.todayLabel}>
                  {headerLabel}
                </Typography>
                {hasUnread && (
                  <Pressable onPress={handleMarkAllRead} hitSlop={8} disabled={markingAll}>
                    <Typography variant="body2" color={colors.textSecondary}>
                      {markingAll ? 'Marking…' : 'Mark as read'}
                    </Typography>
                  </Pressable>
                )}
              </View>
            }
            renderItem={({ item }) => <NotificationItem item={item} />}
            showsVerticalScrollIndicator={false}
          />
        </>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '500' },
  headerSpacer: { width: 32 },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Toast
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
  },
  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toastText: { flex: 1 },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 8,
  },
  todayLabel: { fontWeight: '700' },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 18,
    gap: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  itemContent: { flex: 1, gap: 4 },
  itemTitle: { fontWeight: '700' },
  itemTime: { marginTop: 2 },

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
