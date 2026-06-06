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
import * as Updates from 'expo-updates';
import React, { useEffect } from 'react';

import { AppProviders } from '@/providers/AppProviders';
import { useAppReady } from '@/shared/hooks/useAppReady';

import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Reloading the app might cause this to fail, ignore */
});

function RootLayoutNav() {
  const { isReady: isAppReady } = useAppReady();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_500Medium,
  });

  const isReady = isAppReady && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {
        /* Ignore */
      });
    }
  }, [isReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(profile)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(legal)" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function useOTAUpdates() {
  useEffect(() => {
    if (__DEV__) return;

    async function check() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {}
    }

    check();
  }, []);
}

export default function RootLayout() {
  useOTAUpdates();

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
