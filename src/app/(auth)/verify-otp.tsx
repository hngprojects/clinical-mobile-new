import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/shared/components';
import { VerifyOtp } from '@/features/auth';

export default function VerifyOtpScreen() {
  const { email, expiresInSeconds } = useLocalSearchParams<{
    email?: string;
    expiresInSeconds?: string;
  }>();
  const parsedExpiresInSeconds = Number(expiresInSeconds);
  const countdownSeconds = Number.isFinite(parsedExpiresInSeconds)
    ? parsedExpiresInSeconds
    : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'OTP Verification', headerShown: false }} />
      <Screen padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        <VerifyOtp email={email} expiresInSeconds={countdownSeconds} />
      </Screen>
    </>
  );
}
