import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Typography } from '@/shared/components';

interface GuestLimitModalProps {
  visible: boolean;
  caseId: string;
  guestSessionId: string;
  onDismiss: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function GuestLimitModal({
  visible,
  caseId,
  guestSessionId,
  onDismiss,
}: GuestLimitModalProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const handleActiveAnim = useRef(new Animated.Value(0)).current;

  const handleColor = handleActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#C7C7C7', '#9CA3AF'],
  });

  const springSheetBack = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.timing(handleActiveAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }).start();
        slideAnim.stopAnimation();
        slideAnim.setValue(0);
      },
      onPanResponderMove: (_, { dy }) => {
        slideAnim.setValue(Math.max(dy, 0));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        Animated.timing(handleActiveAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }).start();
        if (dy > 100 || vy > 0.4) {
          handleDismiss();
        } else {
          springSheetBack();
        }
      },
      onPanResponderTerminate: () => {
        Animated.timing(handleActiveAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }).start();
        springSheetBack();
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, slideAnim]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  const handleGetStarted = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
      router.push({
        pathname: '/(auth)/register',
        params: { caseId, guestSessionId },
      });
    });
  };

  const handleLogin = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
      router.push('/(auth)/login');
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [0, SCREEN_HEIGHT],
    extrapolateLeft: 'clamp',
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Drag handle — PanResponder attached here only */}
          <View {...panResponder.panHandlers} style={styles.handleGrabArea}>
            <Animated.View style={[styles.sheetHandle, { backgroundColor: handleColor }]} />
          </View>

          {/* Icon */}
          <Image
            source={require('../../../../../assets/images/speak.png')}
            style={styles.icon}
            resizeMode="contain"
          />

          {/* Title — 24px below icon */}
          <Typography style={styles.title}>Continue your conversation</Typography>

          {/* Subtitle — 6px below title */}
          <Typography style={styles.subtitle}>
            Create an account to keep chatting with Flo and save your health insights securely.
          </Typography>

          {/* Get Started — 40px below subtitle */}
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Typography style={styles.primaryLabel}>Get started</Typography>
          </Pressable>

          {/* Login — 16px below button */}
          <View style={styles.loginRow}>
            <Typography style={styles.loginText}>Already have an account? </Typography>
            <Pressable onPress={handleLogin}>
              <Typography style={styles.loginLink}>Login</Typography>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 48,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  handleGrabArea: {
    width: 120,
    height: 37,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 64,
    height: 5,
    borderRadius: 999,
  },
  icon: {
    height: 120,
    width: 120,
  },
  title: {
    color: '#111827',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    letterSpacing: -0.48,
    lineHeight: 31.2,
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    letterSpacing: -0.12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#1565C0',
    borderRadius: 12,
    marginTop: 40,
    paddingVertical: 16,
  },
  primaryButtonPressed: {
    backgroundColor: '#0F4C92',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  loginLink: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
    textDecorationLine: 'underline',
  },
});
