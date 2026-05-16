import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { OnboardingPager, SLIDES } from '@/features/onboarding';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import { Screen } from '@/shared/components';

export default function SlidesScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useOnboardingStore();
  const router = useRouter();

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/register');
  };

  const handleContinueAsGuest = () => {
    Alert.alert('Coming soon', 'Guest access will be available in a future update.');
  };

  const handleLogin = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <Screen padding={false} edges={['top', 'bottom']}>
      <OnboardingPager
        slides={SLIDES}
        currentSlide={currentSlide}
        onSlideChange={setCurrentSlide}
        onGetStarted={handleGetStarted}
        onContinueAsGuest={handleContinueAsGuest}
        onLogin={handleLogin}
      />
    </Screen>
  );
}
