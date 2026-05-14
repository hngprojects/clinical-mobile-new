import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { LoginForm } from '@/features/auth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function LoginScreen() {
  const { spacing, colors } = useTheme();
  const loginMutation = useLogin();
  const bannerY = useSharedValue(-100);

  useEffect(() => {
    if (loginMutation.error) {
      bannerY.value = withTiming(0, { duration: 300 });
      // Automatically hide after 5 seconds
      const timeout = setTimeout(() => {
        bannerY.value = withTiming(-100, { duration: 300 });
      }, 5000);
      return () => clearTimeout(timeout);
    } else {
      bannerY.value = withTiming(-100, { duration: 300 });
    }
  }, [loginMutation.error]);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bannerY.value }],
    opacity: withTiming(bannerY.value === 0 ? 1 : 0),
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />
      <View style={styles.bannerContainer}>
        <Animated.View style={[styles.errorBanner, animatedBannerStyle]}>
          <Typography variant="body2" color={colors.textSecondary} align="center">
            We couldn't sign you up right now. Please check your connection and try again.
          </Typography>
        </Animated.View>
      </View>

      <Screen scrollable padding>
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Insert your details to login to Clinsight
          </Typography>
        </View>

        <LoginForm mutation={loginMutation} />

        <View style={styles.footer}>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Don't have an account?{' '}
          </Typography>
          <Typography
            variant="body1"
            color="primary"
            style={{ textDecorationLine: 'underline', fontWeight: '500' }}
            onPress={() => router.push('/(auth)/register')}
          >
            Sign Up
          </Typography>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 50, // Below the safe area / notch
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  errorBanner: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});
