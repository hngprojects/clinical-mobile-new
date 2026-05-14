import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';
import { TermsAndConditions } from '@/features/legal';

export default function TermsAndCondition() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Terms and Conditions', headerShown: false }} />
      <Screen padding={false} style={{ backgroundColor: '#FFFFFF' }}>
        <View style={styles.container}>
          <Image
            source={require('@/../assets/images/Circle.png')}
            style={{ width: '105%', height: 74, position: 'absolute', bottom: 0, left: 0 }}
            resizeMode="cover"
          />
          <Typography
            variant="h1"
            style={{ color: colors.text, textAlign: 'center', ...styles.title }}
          >
            Terms and Conditions
          </Typography>
          <Typography
            variant="body1"
            style={{ color: colors.text, textAlign: 'center', ...styles.subtitle }}
          >
            Last Updated, May 2026
          </Typography>
        </View>
        <TermsAndConditions />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#11519A',
    position: 'relative',
    paddingVertical: 6,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
});
