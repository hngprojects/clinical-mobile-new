import { Redirect, Stack } from 'expo-router';

import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';

export default function OnboardingLayout() {
  const hasCompleted = useOnboardingStore((s) => s.hasCompleted);

  if (hasCompleted) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="slides" />
    </Stack>
  );
}
