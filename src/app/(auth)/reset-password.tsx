import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ResetPasswordForm } from '@/features/auth';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { Screen, Toast, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function ResetPasswordScreen() {
  const { colors, spacing } = useTheme();
  const resetPasswordMutation = useResetPassword();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'neutral'>('neutral');

  useEffect(() => {
    if (resetPasswordMutation.error) {
      setToastMessage('We could not send an OTP. Please try again.');
      setToastVariant('error');
      setToastVisible(true);
      const t = setTimeout(() => setToastVisible(false), 5000);
      return () => clearTimeout(t);
    }
    if (resetPasswordMutation.isSuccess) {
      setToastMessage('If an account exists for this email, an OTP has been sent.');
      setToastVariant('success');
      setToastVisible(true);
      const t = setTimeout(() => {
        setToastVisible(false);
        router.replace({
          pathname: '/(auth)/verify-otp',
          params: {
            email: resetPasswordMutation.variables?.email || '',
            type: 'reset-password',
          },
        });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [
    resetPasswordMutation.error,
    resetPasswordMutation.isSuccess,
    resetPasswordMutation.variables,
  ]);

  return (
    <>
      <Stack.Screen options={{ title: 'Forgot Password', headerShown: false }} />

      <Toast visible={toastVisible} message={toastMessage} variant={toastVariant} />

      <Screen
        scrollable
        padding
        backgroundColor="#FFFFFF"
        style={{ backgroundColor: '#FFFFFF' }}
        keyboardAvoiding
      >
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1B1B1B" />
          </Pressable>
          <Typography style={styles.headerTitle}>Forgot Password</Typography>
          <View style={{ width: 24 }} />
        </View>

        <View style={{ marginTop: 28, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700', marginBottom: 4 }}>
            Forgot Password
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Enter your email and we will send you an OTP.
          </Typography>
        </View>

        <ResetPasswordForm mutation={resetPasswordMutation} />

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
