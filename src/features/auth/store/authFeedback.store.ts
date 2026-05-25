import { createStore } from '@/shared/store/factory';

interface AuthFeedbackState {
  successMessage: string | null;
}

interface AuthFeedbackActions {
  clearSuccessMessage: () => void;
  setSuccessMessage: (message: string) => void;
}

export const useAuthFeedbackStore = createStore<AuthFeedbackState & AuthFeedbackActions>((set) => ({
  successMessage: null,

  clearSuccessMessage: () => set({ successMessage: null }),
  setSuccessMessage: (successMessage) => set({ successMessage }),
}));
