import { router, Stack } from 'expo-router';
import React from 'react';
import { View, Pressable } from 'react-native';

import { RegisterForm } from '@/features/auth';
import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function RegisterScreen() {
  const { spacing, colors } = useTheme();

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

        <RegisterForm />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            marginBottom: 20,
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
      </Screen>
    </>
  );
}
