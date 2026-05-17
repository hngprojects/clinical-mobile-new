import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useHome } from '../hooks/useHome';

export function HomeScreen() {
  const { colors, spacing } = useTheme();
  const { user, logout } = useHome();

  const greeting = user ? `Welcome back, ${user.firstName}!` : 'Welcome!';

  return (
    <Screen>
      <View style={[styles.container, { gap: spacing.xl }]}>
        <View style={styles.center}>
          <Typography variant="h1" align="center">
            {greeting}
          </Typography>
          {user && (
            <Typography variant="body1" color={colors.textSecondary} align="center">
              {user.email}
            </Typography>
          )}
        </View>

        <Button label="Sign Out" variant="outline" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  center: { alignItems: 'center', gap: 8 },
});
