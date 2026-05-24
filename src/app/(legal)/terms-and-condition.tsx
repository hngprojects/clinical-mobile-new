import { Stack } from 'expo-router';

import { TermsAndConditionScreen } from '@/features/legal';

export default function TermsAndCondition() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TermsAndConditionScreen />
    </>
  );
}
