import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { LoginForm } from '@/features/auth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Screen, Typography, UploadBottomSheet } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function LoginScreen() {
  const { spacing, colors } = useTheme();
  const loginMutation = useLogin();
  const startGuestSession = useAuthStore((s) => s.startGuestSession);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const bannerY = useSharedValue(-100);

  const handleContinueAsGuest = () => {
    setShowUploadSheet(true);
  };

  const handleUpload = (fileName: string, fileSize: string) => {
    startGuestSession();
    router.replace({
      pathname: '/(main)/preview-upload',
      params: { name: fileName, size: fileSize },
    });
  };

  useEffect(() => {
    if (loginMutation.error) {
      bannerY.value = withTiming(0, { duration: 300 });
      const timeout = setTimeout(() => {
        bannerY.value = withTiming(-100, { duration: 300 });
      }, 5000);
      return () => clearTimeout(timeout);
    }

    bannerY.value = withTiming(-100, { duration: 300 });
  }, [loginMutation.error, bannerY]);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bannerY.value }],
    opacity: withTiming(bannerY.value === 0 ? 1 : 0),
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />

      <View style={styles.bannerContainer}>
        <Animated.View style={[styles.errorBanner, animatedBannerStyle]}>
          <Typography
            style={{
              color: '#494949',
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              lineHeight: 18,
              textAlign: 'center',
            }}
          >
            {loginMutation.error?.message || 'Something went wrong. Please check your credentials.'}
          </Typography>
        </Animated.View>
      </View>

      <Screen scrollable padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Insert your details to login to Clinsight
          </Typography>
        </View>

        <LoginForm
          mutation={loginMutation}
          onContinueAsGuest={handleContinueAsGuest}
          onInteract={() => loginMutation.reset()}
        />

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
            Don&apos;t have an account?{' '}
          </Typography>
          <Pressable onPress={() => router.push('/(auth)/register')}>
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
              Sign Up
            </Typography>
          </Pressable>
        </View>
      </Screen>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUpload}
      />
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
  errorBanner: {
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
