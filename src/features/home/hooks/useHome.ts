import { useAuthStore } from '@/features/auth/store/auth.store';

export function useHome() {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const clearSession = useAuthStore((s) => s.clearSession);

  const logout = () => clearSession();

  return { user, isGuest, logout };
}
