import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { RegisterForm, useGuestUploadSession } from '@/features/auth';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Screen, Typography, UploadBottomSheet } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export default function RegisterScreen() {
  const { spacing, colors } = useTheme();
  const { caseId } = useLocalSearchParams<{ caseId?: string }>();
  const registerMutation = useRegister({ caseId });
  const { handleUpload, handleUploadError } = useGuestUploadSession();
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const bannerY = useSharedValue(-100);

  const handleContinueAsGuest = () => {
    setShowUploadSheet(true);
  };

  useEffect(() => {
    if (registerMutation.error) {
      bannerY.value = withTiming(0, { duration: 300 });
      const timeout = setTimeout(() => {
        bannerY.value = withTiming(-100, { duration: 300 });
      }, 5000);
      return () => clearTimeout(timeout);
    }

    bannerY.value = withTiming(-100, { duration: 300 });
  }, [registerMutation.error, bannerY]);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bannerY.value }],
    opacity: withTiming(bannerY.value === 0 ? 1 : 0),
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Create Account', headerShown: false }} />

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
            {registerMutation.error?.message ||
              'Something went wrong. Please check your details and try again.'}
          </Typography>
        </Animated.View>
      </View>

      <Screen scrollable padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        <View style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Typography variant="h1" style={{ fontWeight: '700' }}>
            Create Account
          </Typography>
          <Typography variant="body1" style={{ color: colors.textSecondary, marginTop: 4 }}>
            Insert your details to create your account in minutes
          </Typography>
        </View>

        <RegisterForm mutation={registerMutation} onContinueAsGuest={handleContinueAsGuest} />

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
            Already have an account?{' '}
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
              Login
            </Typography>
          </Pressable>
        </View>

        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By continuing, you have read and agreed to ClinSight&apos;s{' '}
            <Text
              style={styles.legalLink}
              onPress={() => router.push('/(legal)/terms-and-condition')}
              accessibilityRole="link"
            >
              Terms and Conditions.
            </Text>
          </Text>
        </View>
      </Screen>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUpload}
        onUploadError={handleUploadError}
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
  legalContainer: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  legalText: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.14,
    textAlign: 'center',
  },
  legalLink: {
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
});
