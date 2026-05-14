import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { ClinsightLogo } from '@/shared/components';

import { OnboardingSlideData } from '../data/slides';
import { useOnboardingLayout } from '../hooks/useOnboardingLayout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlideProps {
  slide: OnboardingSlideData;
}

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      <View style={styles.illustrationWrapper}>
        <SlideIllustration id={slide.id} />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
    </View>
  );
}

function SlideIllustration({ id }: { id: OnboardingSlideData['id'] }) {
  if (id === 'lab-results') return <LabResultsIllustration />;
  if (id === 'no-guessing') return <NoGuessingIllustration />;
  return <DoctorOpinionIllustration />;
}

// ─── Slide 1: Feature Cards — asset assessment-cards.png ────────────────────

function LabResultsIllustration() {
  const { layoutScale } = useOnboardingLayout();
  const imgWidth = Math.min(320 * layoutScale, SCREEN_WIDTH - 48);
  const imgHeight = imgWidth * 0.65; 

  return (
    <Image
      source={require('../../../../assets/images/onboarding/assessment-cards.png')}
      style={{ width: imgWidth, height: imgHeight }}
      resizeMode="contain"
    />
  );
}

// ─── Slide 2: Before/After — asset before-after.png ──────────────────────────

function NoGuessingIllustration() {
  const { layoutScale } = useOnboardingLayout();
  const imgWidth = Math.min(320 * layoutScale, SCREEN_WIDTH - 40);
  const imgHeight = imgWidth * 1.2; 

  return (
    <Image
      source={require('../../../../assets/images/onboarding/before-after.png')}
      style={{ width: imgWidth, height: imgHeight }}
      resizeMode="contain"
    />
  );
}

// ─── Slide 3: Doctor Orbit — asset doctor-orbit.png ──────────────────────────

function DoctorOpinionIllustration() {
  const { layoutScale } = useOnboardingLayout();
  const size = Math.min(335 * layoutScale, SCREEN_WIDTH - 32);

  return (
    <Image
      source={require('../../../../assets/images/onboarding/doctor-orbit.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  illustrationWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textSection: {
    width: '100%',
    paddingHorizontal: 28,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 24 * 1.3,
    letterSpacing: 24 * -0.02,
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 12 * 1.5,
    letterSpacing: 12 * -0.01,
    textAlign: 'center',
    color: '#6B7280',
  },
});
