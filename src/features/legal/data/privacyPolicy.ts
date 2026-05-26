import type { LegalDocumentItem } from '../types';

export const privacyPolicy: LegalDocumentItem[] = [
  {
    title: '1. Introduction',
    content:
      'This Privacy Policy explains how Clinsight collects, uses, and protects your personal information when you use our platform.',
  },
  {
    title: '2. Data Collection',
    content: 'We collect information to provide and improve our services, including:',
    sections: [
      {
        heading: 'Personal Information',
        bullets: ['Name', 'Email address', 'Phone number', 'Account credentials'],
      },
      {
        heading: 'Health Information',
        bullets: [
          'Lab test results you upload',
          'Medical history you choose to share',
          'Consultation notes and communications',
        ],
      },
      {
        heading: 'Usage Data',
        bullets: [
          'Device type and operating system',
          'App usage patterns',
          'IP address and general location',
        ],
      },
    ],
  },
  {
    title: '3. Uses of Data',
    content: 'We use your data to:',
    bullets: [
      'Analyze and interpret your lab results using AI',
      'Connect you with healthcare professionals for consultations',
      'Improve our services and user experience',
      'Communicate important updates about your account',
      'Ensure platform security and prevent fraud',
    ],
  },
  {
    title: '4. Cookies',
    content: 'We use cookies and similar technologies to:',
    bullets: [
      'Remember your preferences and settings',
      'Analyze how you use our platform',
      'Improve performance and security',
    ],
    subcontent:
      'You can disable cookies in your browser settings, but some features may not work properly.',
  },
  {
    title: '5. Your Rights',
    bulletTop: 'You have the right to:',
    bullets: [
      'Access your personal data',
      'Correct inaccurate information',
      'Request deletion of your data',
      'Export your data in a portable format',
      'Opt out of marketing communications',
    ],
  },
  {
    title: '6. Contact Us',
    content: 'For privacy-related questions or requests, contact us at:',
    bullets: [
      { label: 'Email', value: 'support@clinsight.com' },
      { label: 'Phone', value: '' },
    ],
  },
];
