import { act, renderHook } from '@testing-library/react-native';

import {
  syncGuestSessionFromParams,
  useSyncGuestSessionFromParams,
} from '@/features/auth/hooks/useSyncGuestSessionFromParams';
import { useAuthStore } from '@/features/auth/store/auth.store';

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    user: null,
    isGuest: false,
    guestSessionId: null,
  });
});

describe('syncGuestSessionFromParams', () => {
  it('writes guest session when param differs from store', () => {
    syncGuestSessionFromParams('guest-abc');

    expect(useAuthStore.getState()).toMatchObject({
      isGuest: true,
      guestSessionId: 'guest-abc',
    });
  });

  it('does not write again when store already matches param', () => {
    useAuthStore.getState().setGuestSession(true, 'guest-abc');
    const setGuestSession = jest.spyOn(useAuthStore.getState(), 'setGuestSession');

    syncGuestSessionFromParams('guest-abc');

    expect(setGuestSession).not.toHaveBeenCalled();
    setGuestSession.mockRestore();
  });

  it('ignores empty param', () => {
    syncGuestSessionFromParams('');
    syncGuestSessionFromParams(undefined);

    expect(useAuthStore.getState().isGuest).toBe(false);
    expect(useAuthStore.getState().guestSessionId).toBeNull();
  });
});

describe('useSyncGuestSessionFromParams', () => {
  it('mounts twice with same paramId and store is written at most once', () => {
    const setGuestSession = jest.spyOn(useAuthStore.getState(), 'setGuestSession');
    const paramId = 'guest-xyz';

    const { rerender } = renderHook(
      ({ id }: { id?: string }) => useSyncGuestSessionFromParams(id),
      { initialProps: { id: paramId } },
    );

    act(() => rerender({ id: paramId }));

    expect(setGuestSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({
      isGuest: true,
      guestSessionId: paramId,
    });

    setGuestSession.mockRestore();
  });
});
