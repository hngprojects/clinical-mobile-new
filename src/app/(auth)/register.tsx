import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RegisterForm, useGuestUploadSession } from '@/features/auth';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Screen, Toast, Typography, UploadBottomSheet } from '@/shared/components';
import { useTheme } from '@/shared/theme';

function getRegisterErrorMessage(error: { message?: string; status?: number } | null): string {
  if (!error) return '';
  const msg = error.message?.toLowerCase() ?? '';
  if (error.status === 0 || msg.includes('timeout') || msg.includes('network')) {
    return 'Connection failed. Please check your network and try again.';
  }
  if (msg.includes('already exists') || msg.includes('already registered') || msg.includes('email taken')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('too short'))) {
    return 'Your password is too weak. Please choose a stronger password.';
  }
  return error.message || 'Something went wrong. Please check your details and try again.';
}

export default function RegisterScreen() {
  const { spacing, colors } = useTheme();
  const registerMutation = useRegister();
  const { handleUpload, handleUploadError } = useGuestUploadSession();
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleContinueAsGuest = () => {
    setShowUploadSheet(true);
  };

  useEffect(() => {
    if (registerMutation.error) {
      setToastVisible(true);
      const t = setTimeout(() => setToastVisible(false), 5000);
      return () => clearTimeout(t);
    }
    setToastVisible(false);
  }, [registerMutation.error]);

  const errorMessage = getRegisterErrorMessage(registerMutation.error);

  return (
    <>
      <Stack.Screen options={{ title: 'Create Account', headerShown: false }} />

      <Toast visible={toastVisible} message={errorMessage} variant="error" />

      <Screen
        scrollable
        padding
        backgroundColor="#FFFFFF"
        style={{ backgroundColor: '#FFFFFF' }}
        keyboardAvoiding
      >
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700' }}>
            Create Account
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Insert your details to create your account in minutes
          </Typography>
        </View>

        <RegisterForm mutation={registerMutation} onContinueAsGuest={handleContinueAsGuest} />

        <View style={styles.footer}>
          <Typography style={styles.footerText}>Already have an account? </Typography>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Typography style={[styles.footerText, { color: colors.primary }, styles.footerLink]}>
              Login
            </Typography>
          </Pressable>
        </View>

        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By continuing, you have read and agreed to ClinSight&apos;s{' '}
            <Text
              style={styles.legalLink}
              onPress={() => router.push('/(legal)/terms-and-condition')}
              accessibilityRole="link"
            >
              Terms and Conditions.
            </Text>
          </Text>
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  footerText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 21,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
  legalContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  legalText: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 21,
    textAlign: 'center',
  },
  legalLink: {
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
});
