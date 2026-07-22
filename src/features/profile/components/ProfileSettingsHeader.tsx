import React from 'react';

import { AppScreenHeader } from '@/shared/components';

interface ProfileSettingsHeaderProps {
  title: string;
  onBack: () => void;
}

export function ProfileSettingsHeader(props: ProfileSettingsHeaderProps) {
  return <AppScreenHeader {...props} />;
}
