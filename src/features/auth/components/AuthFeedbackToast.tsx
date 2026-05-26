import React, { useEffect, useState } from 'react';

import { Toast } from '@/shared/components';

import { useAuthFeedbackStore } from '../store/authFeedback.store';

export function AuthFeedbackToast() {
  const successMessage = useAuthFeedbackStore((state) => state.successMessage);
  const clearSuccessMessage = useAuthFeedbackStore((state) => state.clearSuccessMessage);
  const errorMessage = useAuthFeedbackStore((state) => state.errorMessage);
  const clearErrorMessage = useAuthFeedbackStore((state) => state.clearErrorMessage);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    if (!successMessage) return undefined;
    setSuccessVisible(true);
    const timer = setTimeout(() => {
      setSuccessVisible(false);
      clearSuccessMessage();
    }, 3500);
    return () => clearTimeout(timer);
  }, [clearSuccessMessage, successMessage]);

  useEffect(() => {
    if (!errorMessage) return undefined;
    setErrorVisible(true);
    const timer = setTimeout(() => {
      setErrorVisible(false);
      clearErrorMessage();
    }, 4000);
    return () => clearTimeout(timer);
  }, [clearErrorMessage, errorMessage]);

  return (
    <>
      <Toast visible={successVisible} message={successMessage ?? ''} variant="success" />
      <Toast visible={errorVisible} message={errorMessage ?? ''} variant="error" />
    </>
  );
}
