import { Redirect, Stack } from 'expo-router';

import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import { useTheme } from '@/shared/theme';

export default function AuthLayout() {
  const { colors } = useTheme();
  const hasCompleted = useOnboardingStore((s) => s.hasCompleted);
  const { isLoggedIn } = useAuthSession();

  if (!hasCompleted) return <Redirect href="/(onboarding)" />;
  if (isLoggedIn) return <Redirect href="/(main)" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
