import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuRowProps {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

function MenuRow({ icon, label, onPress, isLast }: MenuRowProps) {
  const { colors } = useTheme();

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
        android_ripple={{ color: colors.border }}
      >
        <View style={styles.rowLeft}>
          <Ionicons name={icon} size={20} color={colors.textSecondary} />
          <Typography variant="body1">{label}</Typography>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
      {!isLast && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
    </>
  );
}

interface SectionProps {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}

function Section({ title, titleColor, children }: SectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Typography
        variant="label"
        color={titleColor ?? colors.textSecondary}
        style={styles.sectionLabel}
      >
        {title.toUpperCase()}
      </Typography>
      <View
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
      >
        {children}
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const email = user?.email ?? '';
  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : 'G';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => clearSession() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Typography variant="body1" style={styles.headerTitle}>
          Account Settings
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primarySubtle }]}>
            <Typography variant="h3" color={colors.primary}>
              {initials}
            </Typography>
          </View>
          <View style={styles.userInfo}>
            <Typography variant="h3">{displayName}</Typography>
            <Typography variant="body2" color={colors.textSecondary}>
              {email}
            </Typography>
          </View>
        </View>

        <Section title="Account">
          <MenuRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
          <MenuRow icon="lock-closed-outline" label="Change Password" onPress={() => {}} />
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push('/(main)/notifications' as never)}
          />
          <MenuRow icon="log-out-outline" label="Logout" onPress={handleLogout} isLast />
        </Section>

        <Section title="Support and Legal">
          <MenuRow icon="shield-outline" label="Privacy Policy" onPress={() => {}} />
          <MenuRow
            icon="document-text-outline"
            label="Terms"
            onPress={() => router.push('/(legal)/terms-and-condition')}
          />
          <MenuRow icon="help-circle-outline" label="Support" onPress={() => {}} isLast />
        </Section>

        <Section title="Danger" titleColor={colors.error}>
          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Typography variant="body1" color={colors.error} style={styles.deleteLabel}>
              Delete Account
            </Typography>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const HORIZONTAL_PADDING = 16;

const styles = StyleSheet.create({
  fill: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  headerSpacer: { width: 32 },

  scrollContent: {
    gap: 20,
    paddingVertical: 20,
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },

  section: {
    gap: 6,
  },
  sectionLabel: {
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    backgroundColor: '#FEF2F2',
  },
  deleteLabel: {
    fontWeight: '500',
  },
});
