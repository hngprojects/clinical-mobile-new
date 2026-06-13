import { useEffect } from 'react';

import { useAuthStore } from '../store/auth.store';

export function syncGuestSessionFromParams(guestSessionId?: string) {
  if (typeof guestSessionId !== 'string' || guestSessionId.length === 0) return;

  const { guestSessionId: storedId, isGuest } = useAuthStore.getState();
  if (storedId === guestSessionId && isGuest) return;

  useAuthStore.getState().setGuestSession(true, guestSessionId);
}

export function useSyncGuestSessionFromParams(guestSessionId?: string) {
  const paramId = typeof guestSessionId === 'string' ? guestSessionId : undefined;

  useEffect(() => {
    syncGuestSessionFromParams(paramId);
  }, [paramId]);
}
