import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ResetPasswordForm } from '@/features/auth';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function ResetPasswordScreen() {
  const { colors, spacing } = useTheme();
  const resetPasswordMutation = useResetPassword();
  const bannerY = useSharedValue(-100);

  useEffect(() => {
    if (resetPasswordMutation.error || resetPasswordMutation.isSuccess) {
      bannerY.value = withTiming(0, { duration: 300 });
      const timeout = setTimeout(() => {
        bannerY.value = withTiming(-100, { duration: 300 });
      }, 5000);
      return () => clearTimeout(timeout);
    }

    bannerY.value = withTiming(-100, { duration: 300 });
  }, [resetPasswordMutation.error, resetPasswordMutation.isSuccess, bannerY]);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bannerY.value }],
    opacity: withTiming(bannerY.value === 0 ? 1 : 0),
  }));

  const notificationMessage =
    resetPasswordMutation.error?.message ||
    resetPasswordMutation.data?.message ||
    'If an account exists for this email, reset instructions have been sent.';

  return (
    <>
      <Stack.Screen options={{ title: 'Reset Password', headerShown: false }} />

      <View style={styles.bannerContainer}>
        <Animated.View style={[styles.notificationBanner, animatedBannerStyle]}>
          <Typography
            style={{
              color: '#494949',
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 18,
              textAlign: 'center',
            }}
          >
            {notificationMessage}
          </Typography>
        </Animated.View>
      </View>

      <Screen scrollable padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700', marginBottom: 4 }}>
            Reset Password
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Enter your email and we will send password reset instructions.
          </Typography>
        </View>

        <ResetPasswordForm mutation={resetPasswordMutation} />

        <View style={styles.footer}>
          <Typography
            style={{
              color: colors.textSecondary,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              lineHeight: 21,
              letterSpacing: -0.14,
            }}
          >
            Remember your password?{' '}
          </Typography>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Typography
              style={{
                color: colors.primary,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                letterSpacing: -0.14,
                textDecorationLine: 'underline',
              }}
            >
              Log In
            </Typography>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  notificationBanner: {
    height: 56,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
});
