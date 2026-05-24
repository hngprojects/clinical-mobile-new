import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { useChangePassword } from '@/features/auth/hooks/useChangePassword';
import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_HORIZONTAL_PADDING } from '../constants';

import { ProfileSettingsHeader } from './ProfileSettingsHeader';

export function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const changePasswordMutation = useChangePassword();

  const handleSuccess = () => {
    Alert.alert('Password updated', 'Your password has been changed successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleError = (message: string) => {
    Alert.alert(
      'Could not change password',
      message || 'Please check your current password and try again.',
    );
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      <ProfileSettingsHeader title="Change Password" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={[styles.fill, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleBlock}>
            <Typography variant="h1" style={styles.pageTitle}>
              Create New Password
            </Typography>
            <Typography variant="body1" color={colors.textSecondary}>
              Choose a new password for your account.
            </Typography>
          </View>

          <ChangePasswordForm
            mutation={changePasswordMutation}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: PROFILE_HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 32,
  },
  titleBlock: {
    marginBottom: 28,
    gap: 4,
  },
  pageTitle: {
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
