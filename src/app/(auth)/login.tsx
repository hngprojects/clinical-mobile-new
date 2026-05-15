import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { LoginForm } from '@/features/auth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Screen, Typography, PatternBackground, ClinsightLogo } from '@/shared/components';
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
            {loginMutation.error?.message || "Something went wrong. Please check your credentials."}
          </Typography>
        </Animated.View>
      </View>

      <Screen scrollable padding backgroundColor="#FFFFFF" keyboardAvoiding>
        <View style={{ marginTop: spacing.xxl }}>
          <Typography variant="h1" style={{ fontWeight: '700', marginBottom: 4 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary }}>
            Insert your details to login to Clinsight
          </Typography>
        </View>

        <View style={{ marginTop: 40 }}>
          <LoginForm 
            mutation={loginMutation} 
            onInteract={() => loginMutation.reset()} 
          />
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/(auth)/register')} style={{ flexDirection: 'row' }}>
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
              Don&apos;t have an account? Sign Up
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
    marginTop: 16,
    marginBottom: 20,
  },
});
