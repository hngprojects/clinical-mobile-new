import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { AuthFeedbackToast } from '@/features/auth';
import { queryClient } from '@/shared/api/queryClient';
import { ToastHost } from '@/shared/components';
import { ThemeProvider } from '@/shared/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastHost>
          {children}
          <AuthFeedbackToast />
        </ToastHost>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
