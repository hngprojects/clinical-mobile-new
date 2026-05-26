import { createStore } from '@/shared/store/factory';

interface AuthFeedbackState {
  successMessage: string | null;
  errorMessage: string | null;
}

interface AuthFeedbackActions {
  clearSuccessMessage: () => void;
  setSuccessMessage: (message: string) => void;
  clearErrorMessage: () => void;
  setErrorMessage: (message: string) => void;
}

export const useAuthFeedbackStore = createStore<AuthFeedbackState & AuthFeedbackActions>((set) => ({
  successMessage: null,
  errorMessage: null,

  clearSuccessMessage: () => set({ successMessage: null }),
  setSuccessMessage: (successMessage) => set({ successMessage }),
  clearErrorMessage: () => set({ errorMessage: null }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
}));
