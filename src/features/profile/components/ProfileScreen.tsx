import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTheme } from '@/shared/theme';

import { PROFILE_HORIZONTAL_PADDING } from '../constants';

import { ProfileDangerZone } from './ProfileDangerZone';
import { ProfileMenuRow } from './ProfileMenuRow';
import { ProfileMenuSection } from './ProfileMenuSection';
import { ProfileSettingsHeader } from './ProfileSettingsHeader';
import { ProfileUserCard } from './ProfileUserCard';

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
    <SafeAreaView style={[styles.fill, { backgroundColor: '#FFFFFE' }]} edges={['top']}>
      <ProfileSettingsHeader title="Account Settings" onBack={() => router.back()} />

      <ScrollView
        style={[styles.fill, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileUserCard displayName={displayName} email={email} initials={initials} />

        <ProfileMenuSection title="Account">
          <ProfileMenuRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push('/(main)/edit-profile')}
          />
          <ProfileMenuRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => router.push('/(main)/change-password')}
          />
          <ProfileMenuRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push('/(main)/notifications')}
          />
          <ProfileMenuRow
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
            isLast
            danger
          />
        </ProfileMenuSection>

        <ProfileMenuSection title="Support and Legal">
          <ProfileMenuRow icon="shield-outline" label="Privacy Policy" onPress={() => {}} />
          <ProfileMenuRow
            icon="document-text-outline"
            label="Terms"
            onPress={() => router.push('/(legal)/terms-and-condition')}
          />
          <ProfileMenuRow
            icon="chatbubble-ellipses-outline"
            label="Support"
            onPress={() => {}}
            isLast
          />
        </ProfileMenuSection>

        <ProfileDangerZone onDeleteAccount={handleDeleteAccount} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    gap: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: PROFILE_HORIZONTAL_PADDING,
  },
});
