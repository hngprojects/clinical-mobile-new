import { useRouter } from 'expo-router';
import React from 'react';

import { SplashSequenceScreen } from '@/features/onboarding/components/SplashSequenceScreen';

export default function SplashScreen() {
  const router = useRouter();
  return <SplashSequenceScreen onComplete={() => router.replace('/(onboarding)/slides')} />;
}
