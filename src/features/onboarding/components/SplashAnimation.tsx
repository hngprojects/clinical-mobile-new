import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

import { ClinsightLogo } from '@/shared/components';

import { Svg, Path } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');
const SPLASH_BG = '#FFFFFF';

const PATTERN_COLS = 3; // Even larger for more impact
const CELL_SIZE = W / PATTERN_COLS;
const PATTERN_ROWS = Math.ceil(H / CELL_SIZE) + 1;

interface SplashAnimationProps {
  onComplete: () => void;
}

export function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(iconOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.delay(180),
      Animated.timing(textOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(containerOpacity, { toValue: 0, duration: 340, useNativeDriver: true }),
    ]).start(() => onComplete());
  }, [containerOpacity, iconOpacity, iconScale, onComplete, textOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <PatternBackground />
      <View style={styles.center}>
        <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
          <ClinsightLogo size={60} color="#0D6DDB" />
        </Animated.View>
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.brandText}>Clinsight</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function PatternBackground() {
  return (
    <View style={styles.patternContainer} pointerEvents="none">
      {Array.from({ length: PATTERN_ROWS }).map((_, row) => (
        <View key={row} style={[styles.patternRow, { height: CELL_SIZE }]}>
          {Array.from({ length: PATTERN_COLS + 1 }).map((_, col) => (
            <View key={col} style={[styles.patternCell, { width: CELL_SIZE, height: CELL_SIZE }]}>
              <TightLogo size={CELL_SIZE * 1.05} color="#0D6DDB" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function TightLogo({ size, color }: { size: number; color: string }) {
  // Tight crop (34.5-74.5 on x-axis) and (0-40 on y-axis) to ensure no border artifacts
  return (
    <Svg width={size} height={size} viewBox="34.5 0.5 40 40">
      <Path
        d="M54.6781 0C64.7862 0 73.1999 7.19023 75 16.6929L71.403 16.7238C71.2582 15.8856 70.74 14.6454 69.1834 12.5379C67.6268 10.4303 65.5029 8.79969 63.0552 7.83277C60.6074 6.86588 57.9344 6.60159 55.3423 7.07035C52.7501 7.53914 50.3434 8.72205 48.3976 10.4835C46.7452 11.9795 45.4775 13.8456 44.7004 15.9261C43.9234 18.0066 43.6596 20.2411 43.9308 22.4433C44.202 24.6454 45.0006 26.7512 46.2597 28.5852C47.5188 30.4192 49.2019 31.9282 51.1689 32.9861C53.1359 34.044 55.3297 34.62 57.567 34.6665C59.8042 34.7129 62.0203 34.2284 64.0302 33.2532C66.0401 32.2779 67.7857 30.8401 69.1213 29.06C70.4567 27.2799 71.134 25.9737 71.3669 25.1351L74.8285 25.1219C72.7143 34.2178 64.4952 41 54.6781 41C43.2579 41 34 31.8218 34 20.5C34 9.17816 43.2579 0 54.6781 0Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50.624 12.901C52.7259 10.9984 55.504 10.0016 58.3472 10.1297C61.1904 10.2578 63.8659 11.5004 65.785 13.5841C67.7041 15.6679 68.7096 18.4223 68.5804 21.241C68.4511 24.0597 67.1977 26.7122 65.0959 28.6147C62.994 30.5172 60.2159 31.5139 57.3727 31.3858C54.5294 31.2577 51.854 30.0151 49.9349 27.9313C48.0158 25.8476 47.0103 23.0934 47.1395 20.2746C47.2688 17.4559 48.5222 14.8035 50.624 12.901ZM58.2724 11.7648C55.8666 11.6564 53.5158 12.4999 51.7373 14.1097C49.9588 15.7195 48.8982 17.964 48.7888 20.3491C48.6795 22.7341 49.5303 25.0647 51.1541 26.8279C52.7779 28.591 55.0417 29.6425 57.4475 29.7509C59.8533 29.8593 62.2041 29.0156 63.9826 27.4058C65.7611 25.7959 66.8217 23.5517 66.9311 21.1666C67.0404 18.7815 66.1896 16.451 64.5658 14.6878C62.9419 12.9247 60.6782 11.8732 58.2724 11.7648Z"
        fill={color}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.05, // Lowered for larger elements
  },
  center: {
    alignItems: 'center',
    zIndex: 10,
  },
  brandText: {
    marginTop: 14,
    fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#0D6DDB',
    letterSpacing: 0.5,
  },
  patternRow: {
    flexDirection: 'row',
  },
  patternCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderColor: '#0D6DDB',
    opacity: 0.35, // Individual circle border opacity
  },
});
