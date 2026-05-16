import React, { useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { brand } from '@/shared/theme/brand';

import { OnboardingSlideData } from '../data/slides';
import { OnboardingDots } from './OnboardingDots';
import { OnboardingSlide } from './OnboardingSlide';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_ADVANCE_MS = 5000;

const BTN_FONT = {
  fontFamily: 'Inter_400Regular',
  fontSize: 14,
  lineHeight: 14 * 1.5,
  letterSpacing: 14 * -0.01,
} as const;

interface OnboardingPagerProps {
  slides: OnboardingSlideData[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onGetStarted: () => void;
  onContinueAsGuest: () => void;
  onLogin: () => void;
}

export function OnboardingPager({
  slides,
  currentSlide,
  onSlideChange,
  onGetStarted,
  onContinueAsGuest,
  onLogin,
}: OnboardingPagerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      const next = index % slides.length;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      onSlideChange(next);
    },
    [onSlideChange, slides.length],
  );

  // Auto-advance — resets whenever currentSlide changes (including manual swipe)
  useEffect(() => {
    timerRef.current = setTimeout(() => goToSlide(currentSlide + 1), AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, goToSlide]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentSlide) onSlideChange(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.fill}
      >
        {slides.map((slide) => (
          <OnboardingSlide key={slide.id} slide={slide} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <OnboardingDots total={slides.length} current={currentSlide} accentColor={brand.accent} />

        <Pressable
          onPress={onGetStarted}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryBtnText}>Get started</Text>
        </Pressable>

        <Pressable
          onPress={onContinueAsGuest}
          style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.75 }]}
        >
          <Text style={styles.guestBtnText}>Continue as guest</Text>
        </Pressable>

        <Pressable onPress={onLogin} hitSlop={8} style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <Text style={styles.loginLink}> Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fill: { flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 0,
    gap: 12,
    alignItems: 'center',
  },
  primaryBtn: {
    width: 343,
    height: 45,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // (20px total: footer gap 12 + margin 8 = 20)
  },
  primaryBtnText: {
    ...BTN_FONT,
    color: '#FFFFFF',
  },
  guestBtn: {
    width: 343,
    height: 45,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    ...BTN_FONT,
    color: '#5E5E5E',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginText: {
    ...BTN_FONT,
    color: '#6B7280',
    textAlign: 'center',
  },
  loginLink: {
    ...BTN_FONT,
    color: brand.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
