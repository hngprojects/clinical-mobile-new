import { router } from 'expo-router';

import { UploadedFile, UploadError } from '@/shared/components';

import { authApi } from '../api/auth.api';
import { getOrCreateGuestDeviceFingerprint, useAuthStore } from '../store/auth.store';

// setTimeout(..., 0) defers navigation until after the Zustand set() call has propagated,
// preventing the next screen from reading stale store state.
function navigateAfterGuestSession(params: Record<string, string | undefined>) {
  setTimeout(() => {
    router.replace({
      pathname: '/(main)/preview-upload',
      params,
    });
  }, 0);
}

export function useGuestUploadSession() {
  const startGuestSession = useAuthStore((s) => s.startGuestSession);

  const handleUpload = async (file: UploadedFile) => {
    try {
      const deviceFingerprint = await getOrCreateGuestDeviceFingerprint();
      const guestSession = await authApi.createGuestSession(deviceFingerprint);
      const guestSessionId = startGuestSession(guestSession.guestSessionId);
      navigateAfterGuestSession({
        guestSessionId,
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType,
      });
    } catch {
      const guestSessionId = startGuestSession();
      navigateAfterGuestSession({
        guestSessionId,
        name: file.name,
        size: file.size,
        uri: file.uri,
        mimeType: file.mimeType,
      });
    }
  };

  const handleUploadError = async (error: UploadError) => {
    try {
      const deviceFingerprint = await getOrCreateGuestDeviceFingerprint();
      const guestSession = await authApi.createGuestSession(deviceFingerprint);
      const guestSessionId = startGuestSession(guestSession.guestSessionId);
      navigateAfterGuestSession({ errorType: error.type, guestSessionId });
    } catch {
      const guestSessionId = startGuestSession();
      navigateAfterGuestSession({ errorType: error.type, guestSessionId });
    }
  };

  return { handleUpload, handleUploadError };
}
