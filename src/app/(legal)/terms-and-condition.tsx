import { Stack, router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Screen, Typography } from '@/shared/components';
import { TermsAndConditions } from '@/features/legal';

const HEADER_TEXT_COLOR = '#FFFFFF';

export default function TermsAndCondition() {
  return (
    <>
      <Stack.Screen options={{ title: 'Terms and Conditions', headerShown: false }} />
      <Screen padding={false} backgroundColor="#FFFFFF">
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 6L9 12L15 18"
                stroke="#141B34"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <Typography style={styles.navTitle}>Terms</Typography>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <Image
            source={require('@/../assets/images/Circle.png')}
            style={styles.heroPattern}
            resizeMode="cover"
          />
          <Typography style={styles.title}>Terms and Conditions</Typography>
          <Typography style={styles.subtitle}>Last Updated, May 2026</Typography>
        </View>

        <TermsAndConditions />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 74,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  navTitle: {
    color: '#000000',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
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
    bottom: 0,
    height: 74,
    left: 0,
    opacity: 0.42,
    position: 'absolute',
    width: '105%',
  },
  title: {
    color: HEADER_TEXT_COLOR,
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 26,
    textAlign: 'center',
  },
  subtitle: {
    color: HEADER_TEXT_COLOR,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
});
