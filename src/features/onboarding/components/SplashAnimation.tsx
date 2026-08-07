import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { ClinsightLogo } from '@/shared/components';

const patternBg = require('../../../../assets/images/splash-bg-pattern.png');

interface SplashAnimationProps {
  onComplete: () => void;
}

export function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(2600),
      Animated.timing(containerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current();
      }
    });

    return () => {
      animation.stop();
    };
  }, [containerOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Image source={patternBg} style={styles.patternBg} fadeDuration={0} />
      <View style={styles.center}>
        <ClinsightLogo width={48.5} height={60} />
        <Text style={styles.brandText}>Clinsight</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  patternBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  brandText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 30,
    color: '#0D6DDB',
    letterSpacing: -0.6,
  },
});
