import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AuthSuccessModal,
  RegisterForm,
  type AuthResponse,
  useAuthStore,
  useGuestUploadSession,
} from '@/features/auth';
import { useSyncGuestSessionFromParams } from '@/features/auth/hooks/useSyncGuestSessionFromParams';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Screen, Toast, Typography, UploadBottomSheet } from '@/shared/components';
import { useTheme } from '@/shared/theme';

function getRegisterErrorMessage(error: { message?: string; status?: number } | null): string {
  if (!error) return '';
  const msg = error.message?.toLowerCase() ?? '';
  if (error.status === 0 || msg.includes('timeout') || msg.includes('network')) {
    return 'Connection failed. Please check your network and try again.';
  }
  if (
    msg.includes('already exists') ||
    msg.includes('already registered') ||
    msg.includes('email taken')
  ) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('too short'))) {
    return 'Your password is too weak. Please choose a stronger password.';
  }
  return error.message || 'Something went wrong. Please check your details and try again.';
}

export default function RegisterScreen() {
  const { spacing, colors } = useTheme();
  const { caseId, guestSessionId } = useLocalSearchParams<{
    caseId?: string;
    guestSessionId?: string;
  }>();
  const paramGuestSessionId = typeof guestSessionId === 'string' ? guestSessionId : undefined;
  useSyncGuestSessionFromParams(paramGuestSessionId);
  const storedGuestSessionId = useAuthStore((state) => state.guestSessionId);
  const guestSessionIdForNav = paramGuestSessionId ?? storedGuestSessionId ?? undefined;
  const registerMutation = useRegister({ caseId, guestSessionId: paramGuestSessionId });
  const { handleUpload, handleUploadError } = useGuestUploadSession();
  const setSession = useAuthStore((state) => state.setSession);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<AuthResponse | null>(null);

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

  const handleGoogleSuccess = (auth: AuthResponse) => {
    setPendingAuth(auth);
    setShowSuccessModal(true);
  };

  const handleSuccessModalAction = () => {
    if (!pendingAuth) return;

    setShowSuccessModal(false);
    setSession(pendingAuth.tokens, pendingAuth.user);

    if (caseId) {
      router.replace({ pathname: '/(main)/chat-review', params: { caseId } });
    } else {
      router.replace('/(main)');
    }
  };

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
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700', letterSpacing: -0.6 }}>
            Create Account
          </Typography>
          <Typography
            variant="body1"
            style={{ color: '#475569', marginTop: 4, letterSpacing: -0.15, lineHeight: 22 }}
          >
            Create your account to get started in minutes
          </Typography>
        </View>

        <RegisterForm
          mutation={registerMutation}
          onContinueAsGuest={handleContinueAsGuest}
          onGoogleSuccess={handleGoogleSuccess}
        />

        <View style={styles.footer}>
          <Typography style={styles.footerText}>Already have an account? </Typography>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(auth)/login',
                params: {
                  ...(caseId ? { caseId } : {}),
                  ...(guestSessionIdForNav ? { guestSessionId: guestSessionIdForNav } : {}),
                },
              })
            }
          >
            <Typography style={[{ color: colors.primary }, styles.footerLink]}>Login</Typography>
          </Pressable>
        </View>

        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By continuing, you have read and agreed to Clinsight&apos;s{' '}
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

      <AuthSuccessModal
        visible={showSuccessModal}
        title="Sign-up successful"
        message={`Your account has been created.\nYou can now proceed to uploading\nyour lab results.`}
        actionLabel="Go to Home Page"
        onAction={handleSuccessModalAction}
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
    color: '#475569',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 21,
  },
  footerLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 21,
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
