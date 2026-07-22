import { useState } from 'react';

import { SLIDES } from '../data/slides';
import { useOnboardingStore } from '../store/onboarding.store';

export function useOnboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { hasCompleted, completeOnboarding } = useOnboardingStore();

  const isLastSlide = currentSlide === SLIDES.length - 1;

  const goToNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      setCurrentSlide((i) => i + 1);
    }
  };

  const goToPrevious = () => {
    setCurrentSlide((i) => Math.max(0, i - 1));
  };

  const skip = () => {
    completeOnboarding();
  };

  return {
    hasCompleted,
    currentSlide,
    isLastSlide,
    slides: SLIDES,
    goToNext,
    goToPrevious,
    skip,
  };
}
