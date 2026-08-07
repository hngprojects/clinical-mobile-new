import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { ClinsightLogo } from '@/shared/components';

const patternBg = require('../../../../assets/images/splash-bg-pattern.png');

interface SplashSequenceScreenProps {
  onComplete: () => void;
}

export function SplashSequenceScreen({ onComplete }: SplashSequenceScreenProps) {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={patternBg} style={styles.patternBg} fadeDuration={0} />
      <View style={styles.center}>
        <ClinsightLogo width={48.5} height={60} />
        <Text style={styles.wordmark}>Clinsight</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
  wordmark: {
    fontFamily: 'Inter_400Regular',
    fontSize: 30,
    color: '#0D6DDB',
    letterSpacing: -0.6,
  },
});
