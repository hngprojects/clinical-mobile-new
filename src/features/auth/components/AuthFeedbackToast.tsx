import React, { useEffect, useState } from 'react';

import { Toast } from '@/shared/components';

import { useAuthFeedbackStore } from '../store/authFeedback.store';

const TOAST_EXIT_ANIMATION_MS = 250;

export function AuthFeedbackToast() {
  const successMessage = useAuthFeedbackStore((state) => state.successMessage);
  const clearSuccessMessage = useAuthFeedbackStore((state) => state.clearSuccessMessage);
  const errorMessage = useAuthFeedbackStore((state) => state.errorMessage);
  const clearErrorMessage = useAuthFeedbackStore((state) => state.clearErrorMessage);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    if (!successMessage) {
      setSuccessVisible(false);
      return undefined;
    }

    setSuccessVisible(true);
    const hideTimer = setTimeout(() => setSuccessVisible(false), 3500);
    const clearTimer = setTimeout(clearSuccessMessage, 3500 + TOAST_EXIT_ANIMATION_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [clearSuccessMessage, successMessage]);

  useEffect(() => {
    if (!errorMessage) {
      setErrorVisible(false);
      return undefined;
    }

    setErrorVisible(true);
    const hideTimer = setTimeout(() => setErrorVisible(false), 4000);
    const clearTimer = setTimeout(clearErrorMessage, 4000 + TOAST_EXIT_ANIMATION_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [clearErrorMessage, errorMessage]);

  return (
    <>
      <Toast visible={successVisible} message={successMessage ?? ''} variant="success" />
      <Toast visible={errorVisible} message={errorMessage ?? ''} variant="error" />
    </>
  );
}
