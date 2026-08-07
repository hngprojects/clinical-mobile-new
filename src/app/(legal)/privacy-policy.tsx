import { Stack } from 'expo-router';

import { PrivacyPolicyScreen } from '@/features/legal';

export default function PrivacyPolicy() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PrivacyPolicyScreen />
    </>
  );
}
