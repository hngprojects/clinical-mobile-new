import React from 'react';

import { privacyPolicy } from '../data/privacyPolicy';

import { LegalDocumentScreen } from './LegalDocumentScreen';

export function PrivacyPolicyScreen() {
  return (
    <LegalDocumentScreen
      navTitle="Privacy Policy"
      heroTitle="Privacy Policy"
      heroSubtitle="Last Updated, May 2026"
      items={privacyPolicy}
    />
  );
}
