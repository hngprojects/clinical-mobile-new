import { Link, Stack } from 'expo-router';
import React from 'react';

import { Screen, Typography } from '@/shared/components';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <Screen>
        <Typography variant="h2" align="center">
          {"This screen doesn't exist."}
        </Typography>
        <Link href="/">
          <Typography variant="body1" align="center">
            Go home
          </Typography>
        </Link>
      </Screen>
    </>
  );
}
