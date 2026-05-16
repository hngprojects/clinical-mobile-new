import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';

beforeEach(() => {
  useOnboardingStore.setState({ hasCompleted: false, isLoading: true });
});

describe('useOnboardingStore', () => {
  it('starts with hasCompleted false', () => {
    expect(useOnboardingStore.getState().hasCompleted).toBe(false);
  });

  it('completeOnboarding sets hasCompleted true', async () => {
    await useOnboardingStore.getState().completeOnboarding();
    expect(useOnboardingStore.getState().hasCompleted).toBe(true);
  });

  it('loadFromStorage sets isLoading false', async () => {
    await useOnboardingStore.getState().loadFromStorage();
    expect(useOnboardingStore.getState().isLoading).toBe(false);
  });

  it('loadFromStorage ignores persisted value outside production', async () => {
    await useOnboardingStore.getState().completeOnboarding();
    useOnboardingStore.setState({ hasCompleted: false });
    await useOnboardingStore.getState().loadFromStorage();
    expect(useOnboardingStore.getState().hasCompleted).toBe(false);
  });
});
