import { Href, router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LoginForm, useGuestUploadSession } from '@/features/auth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Screen, Toast, Typography, UploadBottomSheet } from '@/shared/components';
import { useTheme } from '@/shared/theme';

const RESET_PASSWORD_ROUTE = '/(auth)/reset-password' as Href;

function getLoginErrorMessage(error: { message?: string; status?: number } | null): string {
  if (!error) return '';
  const msg = error.message?.toLowerCase() ?? '';
  if (error.status === 0 || msg.includes('timeout') || msg.includes('network')) {
    return 'Connection failed. Please check your network and try again.';
  }
  if (msg.includes('disabled')) {
    return 'Your account has been disabled. Please contact support.';
  }
  return error.message || 'Invalid email or password.';
}

export default function LoginScreen() {
  const { spacing, colors } = useTheme();
  const loginMutation = useLogin();
  const { handleUpload, handleUploadError } = useGuestUploadSession();
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleContinueAsGuest = () => {
    setShowUploadSheet(true);
  };

  useEffect(() => {
    if (loginMutation.error) {
      setToastVisible(true);
      const t = setTimeout(() => setToastVisible(false), 5000);
      return () => clearTimeout(t);
    }
    setToastVisible(false);
  }, [loginMutation.error]);

  const errorMessage = getLoginErrorMessage(loginMutation.error);

  return (
    <>
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />

      <Toast visible={toastVisible} message={errorMessage} variant="error" />

      <Screen
        scrollable
        padding
        backgroundColor="#FFFFFF"
        style={{ backgroundColor: '#FFFFFF' }}
        keyboardAvoiding
      >
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Insert your details to login to Clinsight
          </Typography>
        </View>

        <LoginForm
          mutation={loginMutation}
          onContinueAsGuest={handleContinueAsGuest}
          onForgotPassword={() => router.push(RESET_PASSWORD_ROUTE)}
          onInteract={() => {
            loginMutation.reset();
            setToastVisible(false);
          }}
        />

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
            Don&apos;t have an account?{' '}
          </Typography>
          <Pressable onPress={() => router.push('/(auth)/register')}>
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
              Sign Up
            </Typography>
          </Pressable>
        </View>
      </Screen>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUpload}
        onUploadError={handleUploadError}
      />
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});
