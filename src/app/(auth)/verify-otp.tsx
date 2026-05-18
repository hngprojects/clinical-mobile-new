import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/shared/components';
import { VerifyOtp } from '@/features/auth';

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'OTP Verification', headerShown: false }} />

      <Screen padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        <VerifyOtp email={email} />
      </Screen>
    </>
  );
}
