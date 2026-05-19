import { useAuthStore } from '../store/auth.store';

export function useAuthSession() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isLoggedIn = accessToken !== null;

  return {
    isLoggedIn,
    isGuest,
    isAuthenticated: isLoggedIn || isGuest,
    user,
    accessToken,
  };
}
