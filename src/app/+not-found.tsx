import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function NotFoundScreen() {
  useEffect(() => {
    router.replace('/');
  }, []);

  return <Stack.Screen options={{ headerShown: false }} />;
}
