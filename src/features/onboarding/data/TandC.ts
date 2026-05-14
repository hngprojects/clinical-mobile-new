interface Term {
  title: string;
  content: string;
  subcontent?: string;
  bulletTop?: string;
  bullets?: (string | { label: string; value: string })[];
}

export const terms: Term[] = [
  {
    title: '1. Introduction',
    content:
      'These Terms and Conditions govern your access to and use of our platform. By using our services, you agree to comply with these terms.',
  },
  {
    title: '2. Use of the Service',
    content:
      'Our platform provides AI-assisted interpretation of lab results and access to doctor consultations for second opinion.',
    bulletTop: 'You agree to:',
    bullets: [
      'Provide accurate information',
      'Use the platform only for lawful purposes',
      'Not misuse or attempt to disrupt the system',
    ],
  },
  {
    title: '3. Medical Disclaimer',
    content:
      'Our platform provides AI-assisted guidance only and is not a substitute for professional medical diagnosis or treatment.',
    bullets: [
      'The AI results are for informational purposes',
      'Doctors provide guidance based on available information',
      'Always seek in-person medical care for emergencies',
    ],
  },
  {
    title: '4. User Responsibilities',
    content: 'You are responsible for',
    bullets: [
      'Ensuring the accuracy of the information you provide',
      'Using the platform responsibly',
    ],
  },
  {
    title: '5. Payments',
    content: 'Some features (e.g., doctor consultations) require payment.',
    bullets: [
      'Payments are processed through secure third-party providers',
      'Fees are clearly displayed before payment',
      'Refund policies (if any) will be communicated within the platform',
    ],
  },
  {
    title: '6. Limitation of Liability',
    content: 'We are not liable for:',
    bullets: [
      'Outcomes of doctor consultations',
      'Decisions made based on AI interpretations',
      'Refund policies (if any) will be communicated within the platform',
    ],
  },
  {
    title: '7. Termination',
    content: 'We reserve the right to suspend or terminate access if:',
    bullets: ['You violate these terms', 'You misuse the platform'],
  },
  {
    title: '8. Changes to Terms',
    content: 'We may update these Terms of Use from time to time.',
    subcontent: 'Continued use of the platform means you accept any updates.',
  },
  {
    title: '9. Contact Us',
    content: 'If you have any questions or concerns about these Terms, you can reach us at:',
    bullets: [
      { label: 'Email', value: 'support@clinsight.com' },
      { label: 'Phone', value: '' },
    ],
  },
];
