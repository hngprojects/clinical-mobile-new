import { act, renderHook } from '@testing-library/react-native';

import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import { SLIDES } from '@/features/onboarding/data/slides';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';

beforeEach(() => {
  useOnboardingStore.setState({ hasCompleted: false, isLoading: true });
});

describe('useOnboarding', () => {
  it('starts on first slide', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentSlide).toBe(0);
  });

  it('exposes all slides', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.slides).toHaveLength(SLIDES.length);
  });

  it('isLastSlide false on first slide', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.isLastSlide).toBe(false);
  });

  it('goToNext advances slide', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => result.current.goToNext());
    expect(result.current.currentSlide).toBe(1);
  });

  it('goToNext on last slide completes onboarding', async () => {
    const { result } = renderHook(() => useOnboarding());
    for (let i = 0; i < SLIDES.length - 1; i++) {
      act(() => result.current.goToNext());
    }
    await act(async () => result.current.goToNext());
    expect(useOnboardingStore.getState().hasCompleted).toBe(true);
  });

  it('skip completes onboarding from any slide', async () => {
    const { result } = renderHook(() => useOnboarding());
    await act(async () => result.current.skip());
    expect(useOnboardingStore.getState().hasCompleted).toBe(true);
  });
});
