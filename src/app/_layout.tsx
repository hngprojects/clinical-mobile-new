import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import { AppProviders } from '@/providers/AppProviders';
import { useAppReady } from '@/shared/hooks/useAppReady';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Reloading the app might cause this to fail, ignore */
});

function RootLayoutNav() {
  const { isReady: isAppReady } = useAppReady();
  const { isLoggedIn } = useAuthSession();
  const hasCompleted = useOnboardingStore((s) => s.hasCompleted);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_500Medium,
  });

  const isReady = isAppReady && fontsLoaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {
        /* Ignore */
      });
    }
  }, [isReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {hasCompleted && isLoggedIn ? (
        <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
      ) : hasCompleted && !isLoggedIn ? (
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      ) : (
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
