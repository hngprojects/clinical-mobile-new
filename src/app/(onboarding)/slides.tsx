import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { authApi } from '@/features/auth/api/auth.api';
import { getOrCreateGuestDeviceFingerprint, useAuthStore } from '@/features/auth/store/auth.store';
import { OnboardingPager, SLIDES } from '@/features/onboarding';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import { Screen, UploadBottomSheet, UploadedFile, UploadError } from '@/shared/components';

function navigateAfterGuestSession(
  router: ReturnType<typeof useRouter>,
  params: Record<string, string | undefined>,
) {
  setTimeout(() => {
    router.replace({
      pathname: '/(main)/preview-upload',
      params,
    });
  }, 0);
}

export default function SlidesScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const { completeOnboarding } = useOnboardingStore();
  const startGuestSession = useAuthStore((s) => s.startGuestSession);
  const router = useRouter();

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/register');
  };

  const handleContinueAsGuest = () => {
    setShowUploadSheet(true);
  };

  const handleUpload = async (file: UploadedFile) => {
    await completeOnboarding();
    try {
      const deviceFingerprint = await getOrCreateGuestDeviceFingerprint();
      const guestSession = await authApi.createGuestSession(deviceFingerprint);
      const guestSessionId = startGuestSession(guestSession.guestSessionId);
      navigateAfterGuestSession(router, {
        guestSessionId,
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType,
      });
    } catch {
      const guestSessionId = startGuestSession();
      navigateAfterGuestSession(router, {
        guestSessionId,
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType,
      });
    }
  };

  const handleUploadError = async (error: UploadError) => {
    await completeOnboarding();
    try {
      const deviceFingerprint = await getOrCreateGuestDeviceFingerprint();
      const guestSession = await authApi.createGuestSession(deviceFingerprint);
      const guestSessionId = startGuestSession(guestSession.guestSessionId);
      navigateAfterGuestSession(router, { errorType: error.type, guestSessionId });
    } catch {
      const guestSessionId = startGuestSession();
      navigateAfterGuestSession(router, { errorType: error.type, guestSessionId });
    }
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
      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUpload}
        onUploadError={handleUploadError}
      />
    </Screen>
  );
}
