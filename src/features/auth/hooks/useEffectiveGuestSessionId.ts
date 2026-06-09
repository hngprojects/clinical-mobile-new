import { useEffect } from 'react';

import { useAuthStore } from '../store/auth.store';

export function useEffectiveGuestSessionId(guestSessionId?: string) {
  const paramId = typeof guestSessionId === 'string' ? guestSessionId : undefined;

  useEffect(() => {
    if (!paramId) return;

    const { guestSessionId: storedId, isGuest } = useAuthStore.getState();
    if (storedId === paramId && isGuest) return;

    useAuthStore.getState().setGuestSession(true, paramId);
  }, [paramId]);

  const storedGuestSessionId = useAuthStore((state) => state.guestSessionId);
  return paramId ?? storedGuestSessionId ?? undefined;
}
