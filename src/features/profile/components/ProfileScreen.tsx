import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTheme } from '@/shared/theme';

import { PROFILE_HORIZONTAL_PADDING } from '../constants';
import { useDeleteAccount } from '../hooks/useDeleteAccount';

import { DeleteAccountConfirmModal } from './DeleteAccountConfirmModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';
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

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    clearSession();
    router.replace('/(auth)/login');
  };

  const handleConfirmDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        setDeleteModalVisible(false);
        router.replace('/(auth)/login');
      },
      onError: (error) => {
        Alert.alert(
          'Could not delete account',
          error.message || 'Something went wrong. Please try again.',
        );
      },
    });
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
            onPress={() => setLogoutModalVisible(true)}
            isLast
            danger
          />
        </ProfileMenuSection>

        <ProfileMenuSection title="Support and Legal">
          <ProfileMenuRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => router.push('/(legal)/privacy-policy')}
          />
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

        <ProfileDangerZone onDeleteAccount={() => setDeleteModalVisible(true)} />
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />

      <DeleteAccountConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDeleteAccount}
        isLoading={deleteAccountMutation.isPending}
      />
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
