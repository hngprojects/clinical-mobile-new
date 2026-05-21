import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'AI Analysis Complete',
    description: 'Your lab results have been simplified and are ready to view.',
    time: '12m ago',
    read: false,
  },
  {
    id: '2',
    title: 'Processing Your Report',
    description: 'AI is currently analyzing your lab results.',
    time: '12m ago',
    read: false,
  },
  {
    id: '3',
    title: 'Report Uploaded',
    description: 'Your lab report has been uploaded successfully.',
    time: '12m ago',
    read: false,
  },
];

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
        Your notifications is now up to date. All previous alerts have been marked as read.
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

function NotificationItem({ item }: { item: AppNotification }) {
  const { colors } = useTheme();
  return (
    <View style={styles.item}>
      <Typography variant="body1" style={styles.itemTitle}>
        {item.title}
      </Typography>
      <Typography variant="body2" color={colors.textSecondary}>
        {item.description}
      </Typography>
      <Typography variant="body2" color={colors.textSecondary} style={styles.itemTime}>
        {item.time}
      </Typography>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NotificationsInboxScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasUnread = notifications.some((n) => !n.read);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const isEmpty = notifications.length === 0;

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

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <ReadToast visible={showToast} />

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Typography variant="body1" style={styles.todayLabel}>
                  Today
                </Typography>
                {hasUnread && (
                  <Pressable onPress={handleMarkAllRead} hitSlop={8}>
                    <Typography variant="body2" color={colors.textSecondary}>
                      Mark as read
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
    paddingVertical: 18,
    gap: 4,
  },
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
