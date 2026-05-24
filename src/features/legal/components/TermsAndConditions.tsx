import React from 'react';

import { terms } from '../data/terms';

import { LegalAccordionList } from './LegalAccordionList';

/** @deprecated Use TermsAndConditionScreen or LegalAccordionList directly */
export function TermsAndConditions() {
  return <LegalAccordionList items={terms} />;
}
