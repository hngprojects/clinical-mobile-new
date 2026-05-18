import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';

import { RegisterForm } from '@/features/auth';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Screen, Typography, UploadBottomSheet } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function RegisterScreen() {
  const { spacing, colors } = useTheme();
  const startGuestSession = useAuthStore((s) => s.startGuestSession);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  const handleContinueAsGuest = () => {
    setShowUploadSheet(true);
  };

  const handleUpload = (fileName: string, fileSize: string) => {
    startGuestSession();
    router.replace({
      pathname: '/(main)/preview-upload',
      params: { name: fileName, size: fileSize },
    });
  };


  return (
    <>
      <Stack.Screen options={{ title: 'Create Account', headerShown: false }} />

      <Screen scrollable padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700', marginBottom: 4 }}>
            Create Account
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Join Clinsight and start managing your clinics
          </Typography>
        </View>

        <RegisterForm onContinueAsGuest={handleContinueAsGuest} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            marginBottom: 40,
          }}
        >
          <Typography
            style={{
              color: colors.textSecondary,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: -0.14,
            }}
          >
            Already have an account?{' '}
          </Typography>
          <Pressable onPress={() => router.push('/(auth)/login')}>
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

        <View
          style={{
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          <Typography
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: -0.14,
            }}
          >
            By continuing, you have read and agreed to ClinSight&apos;s.{' '}
          </Typography>
          <Pressable
            onPress={() => router.push('/(legal)/terms-and-condition')}
            accessibilityRole="link"
          >
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
              Terms and Conditions
            </Typography>
          </Pressable>
        </View>
      </Screen>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUpload}
      />
    </>
  );
}

