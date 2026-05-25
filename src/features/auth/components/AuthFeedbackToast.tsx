import React, { useEffect, useState } from 'react';

import { Toast } from '@/shared/components';

import { useAuthFeedbackStore } from '../store/authFeedback.store';

export function AuthFeedbackToast() {
  const successMessage = useAuthFeedbackStore((state) => state.successMessage);
  const clearSuccessMessage = useAuthFeedbackStore((state) => state.clearSuccessMessage);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!successMessage) return undefined;

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      clearSuccessMessage();
    }, 3500);

    return () => clearTimeout(timer);
  }, [clearSuccessMessage, successMessage]);

  return <Toast visible={visible} message={successMessage ?? ''} variant="success" />;
}
