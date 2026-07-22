import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthSuccessModal, CompletePasswordResetForm } from '@/features/auth';
import { useCompletePasswordReset } from '@/features/auth/hooks/useCompletePasswordReset';
import { Screen, Toast, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

function getPasswordResetErrorMessage(error: { message?: string; status?: number } | null): string {
  if (!error) return '';
  const msg = error.message?.trim();
  if (error.status === 0 || msg?.toLowerCase().includes('network')) {
    return 'Connection failed. Please check your network and try again.';
  }
  if (msg && (error.status === 400 || error.status === 422)) {
    return msg;
  }
  return 'We could not reset your password. Please request a new code and try again.';
}

export default function NewPasswordScreen() {
  const { colors, spacing } = useTheme();
  const { token } = useLocalSearchParams<{ token?: string | string[] }>();
  const completeResetMutation = useCompletePasswordReset();
  const resetToken = (Array.isArray(token) ? (token[0] ?? '') : (token ?? '')).trim();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      router.replace('/(auth)/reset-password');
    }
  }, [resetToken]);

  useEffect(() => {
    if (completeResetMutation.error) {
      setToastMessage(getPasswordResetErrorMessage(completeResetMutation.error));
      setToastVisible(true);
      const t = setTimeout(() => setToastVisible(false), 5000);
      return () => clearTimeout(t);
    }
    if (completeResetMutation.isSuccess) {
      setToastVisible(false);
      setShowSuccessModal(true);
    }
  }, [completeResetMutation.error, completeResetMutation.isSuccess]);

  if (!resetToken) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'New Password', headerShown: false }} />

      <Toast visible={toastVisible} message={toastMessage} variant="error" />
      <AuthSuccessModal
        visible={showSuccessModal}
        title="Password Updated"
        message="Your password has been changed successfully. Use your new password to log in."
        actionLabel="Log In"
        onAction={() => {
          setShowSuccessModal(false);
          router.replace('/(auth)/login');
        }}
      />

      <Screen
        scrollable
        padding
        backgroundColor="#FFFFFF"
        style={{ backgroundColor: '#FFFFFF' }}
        keyboardAvoiding
      >
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => router.replace('/(auth)/reset-password')}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#1B1B1B" />
          </Pressable>
          <Typography style={styles.headerTitle}>Create New Password</Typography>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ marginTop: 28, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700', marginBottom: 4 }}>
            Create New Password
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Choose a new password for your Clinsight account.
          </Typography>
        </View>

        <CompletePasswordResetForm mutation={completeResetMutation} resetToken={resetToken} />

        <View style={styles.footer}>
          <Typography
            style={{
              color: colors.textSecondary,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: -0.14,
            }}
          >
            Remember your password?{' '}
          </Typography>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Typography
              style={{
                color: colors.primary,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                letterSpacing: -0.14,
                textDecorationLine: 'underline',
              }}
            >
              Log In
            </Typography>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: '#000000',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});
