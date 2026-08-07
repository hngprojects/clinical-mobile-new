export interface OnboardingSlideData {
  id: 'lab-results' | 'no-guessing' | 'doctor-opinion';
  title: string;
  subtitle: string;
}

export const SLIDES: OnboardingSlideData[] = [
  {
    id: 'lab-results',
    title: 'Understand your lab results',
    subtitle: 'Upload your lab report and get a clear, simple explanation in seconds',
  },
  {
    id: 'no-guessing',
    title: 'No more guessing your results',
    subtitle: "Get clear explanations for every value and understand what's happening in your body",
  },
  {
    id: 'doctor-opinion',
    title: "Get a doctor's second opinion",
    subtitle: 'You can request a verified doctor to review your results for an additional fee.',
  },
];
