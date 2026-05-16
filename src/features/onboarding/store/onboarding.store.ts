import { STORAGE_KEYS } from '@/shared/constants/keys';
import { shouldPersistOnboarding } from '@/shared/constants/env';
import { asyncStorage } from '@/shared/storage/asyncStorage';
import { createStore } from '@/shared/store/factory';

interface OnboardingState {
  hasCompleted: boolean;
  isLoading: boolean;
}

interface OnboardingActions {
  loadFromStorage: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = createStore<OnboardingState & OnboardingActions>((set) => ({
  hasCompleted: false,
  isLoading: true,

  loadFromStorage: async () => {
    if (!shouldPersistOnboarding) {
      set({ hasCompleted: false, isLoading: false });
      return;
    }

    const value = await asyncStorage.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
    set({ hasCompleted: value === true, isLoading: false });
  },

  completeOnboarding: async () => {
    set({ hasCompleted: true });
    if (!shouldPersistOnboarding) return;

    await asyncStorage.setItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
  },
}));
