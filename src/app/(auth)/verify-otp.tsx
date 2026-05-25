import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/shared/components';
import { VerifyOtp } from '@/features/auth';

export default function VerifyOtpScreen() {
  const { email, expiresInSeconds, type } = useLocalSearchParams<{
    email?: string;
    expiresInSeconds?: string;
    type?: 'signup' | 'reset-password';
  }>();
  const parsedExpiresInSeconds = Number(expiresInSeconds);
  const countdownSeconds = Number.isFinite(parsedExpiresInSeconds)
    ? parsedExpiresInSeconds
    : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'OTP Verification', headerShown: false }} />
      <Screen
        padding
        backgroundColor="#FFFFFF"
        style={{ backgroundColor: '#FFFFFF' }}
        keyboardAvoiding
      >
        <VerifyOtp email={email} expiresInSeconds={countdownSeconds} type={type} />
      </Screen>
    </>
  );
}
