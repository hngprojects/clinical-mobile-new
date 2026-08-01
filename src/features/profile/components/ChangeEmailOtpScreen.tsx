import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useVerifyEmailChange } from '@/features/auth/hooks/useVerifyEmailChange';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { ApiError } from '@/shared/api/types';
import { Toast, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { AuthSuccessModal } from '../../auth/components/AuthSuccessModal';
import { OtpCodeInput } from '../../auth/components/OtpCodeInput';
import { ProfileSettingsHeader } from './ProfileSettingsHeader';
import { MIN_TOUCH_TARGET, minTouchTargetStyle } from '@/shared/accessibility';

const CODE_LENGTH = 6;

function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  if (local.length === 1) return `*${domain}`;
  if (local.length <= 3) return `${local[0]}*${local[local.length - 1]}${domain}`;
  const stars = '*'.repeat(Math.min(local.length - 3, 3));
  return `${local.slice(0, 2)}${stars}${local[local.length - 1]}${domain}`;
}

function formatTimer(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)
    .toString()
    .padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
}

export function ChangeEmailOtpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { email, expiresInSeconds: expiresParam } = useLocalSearchParams<{
    email: string;
    expiresInSeconds?: string;
  }>();
  const patchUser = useAuthStore((s) => s.patchUser);
  const { mutate: verifyEmailChange, isPending, reset: resetMutation } = useVerifyEmailChange();

  const initialCooldown = expiresParam ? parseInt(expiresParam, 10) : 120;

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(initialCooldown);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState(
    'The code you entered is incorrect. Check again.',
  );
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expiredToastVisible, setExpiredToastVisible] = useState(false);

  const inputRef = useRef<RNTextInput>(null);

  useFocusEffect(
    useCallback(() => {
      setCode('');
      setTimer(initialCooldown);
      setHasOtpError(false);
      setHasNetworkError(false);
      setShowSuccessModal(false);
      setExpiredToastVisible(false);
      setOtpErrorMessage('The code you entered is incorrect. Check again.');
      resetMutation();
    }, [initialCooldown, resetMutation]),
  );

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setExpiredToastVisible(true);
      const t = setTimeout(() => setExpiredToastVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleError = useCallback(
    (error: ApiError | null) => {
      if (!error) return;
      const status = error.status;
      if (status === 400 || status === 401 || status === 422) {
        setOtpErrorMessage(error.message || 'The code you entered is incorrect. Check again.');
        setHasOtpError(true);
        setHasNetworkError(false);
      } else {
        setHasNetworkError(true);
        setHasOtpError(false);
        const t = setTimeout(() => {
          setHasNetworkError(false);
          resetMutation();
        }, 5000);
        return () => clearTimeout(t);
      }
    },
    [resetMutation],
  );

  const handleVerify = () => {
    if (code.length !== CODE_LENGTH) return;
    Keyboard.dismiss();
    verifyEmailChange(
      { token: code },
      {
        onSuccess: () => {
          patchUser({ email: email ?? '' });
          setShowSuccessModal(true);
        },
        onError: (error) => handleError(error),
      },
    );
  };

  const handleTextChange = (clean: string) => {
    setCode(clean);
    if (hasOtpError || hasNetworkError) {
      setHasOtpError(false);
      setHasNetworkError(false);
      setOtpErrorMessage('The code you entered is incorrect. Check again.');
      resetMutation();
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    router.replace('/(main)/profile');
  };

  const isCodeComplete = code.length === CODE_LENGTH;
  const isExpired = timer === 0;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      <ProfileSettingsHeader title="Change Email" onBack={() => router.back()} />

      <Toast
        visible={hasNetworkError}
        message="We couldn't verify the code right now. Please check your connection and try again."
        variant="error"
      />
      <Toast
        visible={expiredToastVisible}
        message="Your code has expired. Go back to request a new one."
        variant="error"
      />

      <View style={styles.content}>
        {/* Main heading */}
        <View style={styles.headingBlock}>
          <Typography style={styles.mainTitle}>Verify Your New Email</Typography>
          <Typography style={styles.description}>
            Enter the 6-digit code we sent to{' '}
            <Typography style={styles.boldEmail}>{maskEmail(email ?? '')}</Typography>
          </Typography>
        </View>

        <OtpCodeInput
          inputRef={inputRef}
          value={code}
          onChangeText={handleTextChange}
          hasError={hasOtpError}
          errorMessage={otpErrorMessage}
          expiredHintMessage={
            isExpired && !hasOtpError
              ? 'This code has expired. Go back to request a new one.'
              : undefined
          }
          label="Verification code"
        />
        <Pressable
          disabled={!isCodeComplete || isPending || isExpired}
          onPress={handleVerify}
          accessibilityRole="button"
          accessibilityLabel="Verify new email address"
          accessibilityState={{
            disabled: !isCodeComplete || isPending || isExpired,
            busy: isPending,
          }}
          style={({ pressed }) => [
            styles.verifyBtn,
            {
              backgroundColor: isPending
                ? '#F5F5F7'
                : isCodeComplete && !isExpired
                  ? '#1565C0'
                  : '#F5F5F7',
              opacity: pressed && isCodeComplete && !isPending && !isExpired ? 0.85 : 1,
            },
          ]}
        >
          {isPending ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#1565C0" />
              <Typography style={styles.loadingText}>Verifying Code</Typography>
            </View>
          ) : (
            <Typography
              style={[
                styles.btnText,
                { color: isCodeComplete && !isExpired ? '#FFFFFF' : '#BDBDBD' },
              ]}
            >
              Verify Email
            </Typography>
          )}
        </Pressable>

        {/* Timer / back-to-resend */}
        <View style={styles.timerContainer}>
          {!isExpired ? (
            <Typography style={styles.timerText}>
              Code expires in <Typography style={styles.boldTimer}>{formatTimer(timer)}</Typography>
            </Typography>
          ) : (
            <View style={styles.resendRow}>
              <Typography style={styles.timerText}>Code expired. </Typography>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back to request a new verification code"
                style={minTouchTargetStyle}
              >
                <View style={styles.resendLinkRow}>
                  <Ionicons name="arrow-back-outline" size={14} color="#1565C0" />
                  <Typography style={styles.resendLink}>Go back to resend</Typography>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <AuthSuccessModal
        visible={showSuccessModal}
        title="Email updated"
        message={`Your email address has been\nsuccessfully changed to\n${email}`}
        actionLabel="Done"
        onAction={handleDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headingBlock: { marginBottom: 28 },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#1B1B1B',
    lineHeight: 39,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#494949',
    lineHeight: 21,
    marginTop: 6,
  },
  boldEmail: {
    fontFamily: 'Inter_700Bold',
    color: '#1B1B1B',
  },
  verifyBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    minHeight: MIN_TOUCH_TARGET,
  },
  btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#767676',
  },
  timerContainer: { alignItems: 'center', marginTop: 20 },
  timerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#494949',
  },
  boldTimer: {
    fontFamily: 'Inter_700Bold',
    color: '#1B1B1B',
  },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resendLink: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
