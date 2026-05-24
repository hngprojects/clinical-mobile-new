import React from 'react';

import { terms } from '../data/terms';

import { LegalDocumentScreen } from './LegalDocumentScreen';

export function TermsAndConditionScreen() {
  return (
    <LegalDocumentScreen
      navTitle="Terms"
      heroTitle="Terms and Conditions"
      heroSubtitle="Last Updated, May 2026"
      items={terms}
    />
  );
}
