import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScreenHeader, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { TermsAndConditions } from './TermsAndConditions';

const heroPattern = require('../../../../assets/images/Circle.png');

export function TermsAndConditionScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      <AppScreenHeader title="Terms" onBack={() => router.back()} />

      <View style={[styles.fill, { backgroundColor: colors.background }]} pointerEvents="box-none">
        <View style={styles.hero} pointerEvents="none">
          <Image source={heroPattern} style={styles.heroPattern} resizeMode="cover" />
          <Typography style={styles.heroTitle}>Terms and Conditions</Typography>
          <Typography style={styles.heroSubtitle}>Last Updated, May 2026</Typography>
        </View>

        <TermsAndConditions />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hero: {
    alignItems: 'center',
    backgroundColor: '#155AA0',
    height: 74,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
    position: 'relative',
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
});
