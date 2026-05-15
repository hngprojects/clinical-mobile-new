import { router, Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { RegisterForm } from '@/features/auth';
import { Screen, Typography, PatternBackground, ClinsightLogo } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function RegisterScreen() {
  const { spacing, colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Create Account', headerShown: false }} />
      <PatternBackground opacity={0.06} />

      <Screen scrollable padding backgroundColor="transparent">
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl, alignItems: 'center' }}>
          <ClinsightLogo size={80} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700', marginBottom: 4 }}>
            Create Account
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Join Clinsight and start managing your clinics
          </Typography>
        </View>

        <RegisterForm />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 20 }}>
          <Typography variant="body2" style={{ color: colors.textSecondary }}>
            Already have an account?{' '}
          </Typography>
          <Typography
            variant="body2"
            color={colors.primary}
            style={{
              fontWeight: '400',
              textDecorationLine: 'underline',
              lineHeight: 21,
              letterSpacing: -0.14,
            }}
            onPress={() => router.push('/(auth)/login')}
          >
            Log In
          </Typography>
        </View>
      </Screen>
    </>
  );
}
