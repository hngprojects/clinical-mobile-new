import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  TextInput as RNTextInput,
  StyleSheet,
  View,
} from 'react-native';

import { useResendOtp } from '@/features/auth/hooks/useResendOtp';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { useVerifyOtp } from '@/features/auth/hooks/useVerifyOtp';
import { useVerifyResetOtp } from '@/features/auth/hooks/useVerifyResetOtp';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { ApiError } from '@/shared/api/types';
import { Toast, Typography } from '@/shared/components';

import { AuthSuccessModal } from './AuthSuccessModal';

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
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function VerifyOtp({
  email,
  expiresInSeconds,
  type = 'signup',
}: {
  email?: string;
  expiresInSeconds?: number;
  type?: 'signup' | 'reset-password';
}) {
  const verifyOtpMutation = useVerifyOtp();
  const { reset: resetVerifyOtp } = verifyOtpMutation;
  const verifyResetOtpMutation = useVerifyResetOtp();
  const resendOtpMutation = useResendOtp();
  const resetPasswordMutation = useResetPassword();

  const [code, setCode] = useState('');

  const initialCooldown = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : 30;
  const [timer, setTimer] = useState(initialCooldown);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState(
    'The code you entered is incorrect. Check again.',
  );
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [resendToastVisible, setResendToastVisible] = useState(false);
  const [resendToastMessage, setResendToastMessage] = useState('');
  const [resendToastVariant, setResendToastVariant] = useState<'success' | 'error'>('error');
  const [expiredToastVisible, setExpiredToastVisible] = useState(false);

  const inputRef = useRef<RNTextInput>(null);
  const resendToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setTimer(initialCooldown);
  }, [initialCooldown]);

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

  useEffect(() => {
    const activeError =
      type === 'reset-password' ? verifyResetOtpMutation.isError : verifyOtpMutation.isError;
    const activeErr =
      type === 'reset-password' ? verifyResetOtpMutation.error : verifyOtpMutation.error;

    if (activeError) {
      const errStatus = (activeErr as ApiError)?.status;
      const rawMsg = activeErr?.message || '';

      if (errStatus === 400 || errStatus === 401) {
        setOtpErrorMessage(rawMsg || 'The code you entered is incorrect. Check again.');
        setHasOtpError(true);
        setHasNetworkError(false);
      } else {
        setHasNetworkError(true);
        setHasOtpError(false);
        const t = setTimeout(() => {
          setHasNetworkError(false);
          resetVerifyOtp();
          verifyResetOtpMutation.reset();
        }, 5000);
        return () => clearTimeout(t);
      }
    }
  }, [
    type,
    verifyOtpMutation.isError,
    verifyOtpMutation.error,
    verifyResetOtpMutation.isError,
    verifyResetOtpMutation.error,
    resetVerifyOtp,
    verifyResetOtpMutation.reset,
  ]);

  useEffect(() => {
    if (verifyOtpMutation.isSuccess && type !== 'reset-password') {
      setShowSuccessModal(true);
    }
  }, [verifyOtpMutation.isSuccess, type]);

  useEffect(() => {
    if (verifyResetOtpMutation.isSuccess && type === 'reset-password') {
      router.replace({
        pathname: '/(auth)/new-password',
        params: { token: verifyResetOtpMutation.data.resetToken },
      });
    }
  }, [verifyResetOtpMutation.isSuccess, verifyResetOtpMutation.data, type]);

  useEffect(
    () => () => {
      if (resendToastTimerRef.current !== null) {
        clearTimeout(resendToastTimerRef.current);
      }
    },
    [],
  );

  const showResendToast = useCallback((message: string, variant: 'success' | 'error') => {
    setResendToastMessage(message);
    setResendToastVariant(variant);
    setResendToastVisible(true);

    if (resendToastTimerRef.current !== null) {
      clearTimeout(resendToastTimerRef.current);
    }

    resendToastTimerRef.current = setTimeout(() => {
      setResendToastVisible(false);
      resendToastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    if (resendOtpMutation.isError || resetPasswordMutation.isError) {
      showResendToast("Couldn't resend the code. Please try again.", 'error');
    }
  }, [resendOtpMutation.isError, resetPasswordMutation.isError, showResendToast]);

  useEffect(() => {
    if (resendOtpMutation.isSuccess || resetPasswordMutation.isSuccess) {
      showResendToast('A new code has been sent to your email.', 'success');
    }
  }, [resendOtpMutation.isSuccess, resetPasswordMutation.isSuccess, showResendToast]);

  const handleVerify = () => {
    if (code.length !== CODE_LENGTH) return;
    Keyboard.dismiss();
    if (type === 'reset-password') {
      verifyResetOtpMutation.mutate({ email: email || '', code });
      return;
    }
    verifyOtpMutation.mutate({ email: email || '', code });
  };

  const handleResend = () => {
    if (timer > 0 || resendOtpMutation.isPending || resetPasswordMutation.isPending) return;
    setTimer(initialCooldown);
    setHasOtpError(false);
    setHasNetworkError(false);
    setExpiredToastVisible(false);
    setCode('');
    resetVerifyOtp();
    verifyResetOtpMutation.reset();
    if (type === 'reset-password') {
      resetPasswordMutation.mutate({ email: email || '' });
    } else {
      resendOtpMutation.mutate({ email: email || '' });
    }
  };

  const handleTextChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleanVal);

    if (hasOtpError || hasNetworkError) {
      setHasOtpError(false);
      setHasNetworkError(false);
      setOtpErrorMessage('The code you entered is incorrect. Check again.');
      resetVerifyOtp();
      verifyResetOtpMutation.reset();
    }
  };

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  const handleContinue = () => {
    const result = verifyOtpMutation.data;
    if (!result) return;

    setShowSuccessModal(false);
    useAuthStore.getState().setSession(result.tokens, result.user);
    router.replace('/(main)');
  };

  const isCodeComplete = code.length === CODE_LENGTH;
  const isExpired = timer === 0;
  const isLoading =
    type === 'reset-password' ? verifyResetOtpMutation.isPending : verifyOtpMutation.isPending;

  return (
    <>
      <Toast
        visible={hasNetworkError}
        message="We couldn't verify you right now. Please check your connection and try again."
        variant="error"
      />
      <Toast
        visible={resendToastVisible}
        message={resendToastMessage}
        variant={resendToastVariant}
      />
      <Toast
        visible={expiredToastVisible}
        message="Your code has expired. Please request a new one."
        variant="error"
      />

      {/* Customized Header */}
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() =>
            type === 'reset-password' ? router.replace('/(auth)/reset-password') : router.back()
          }
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#1B1B1B" />
        </Pressable>
        <Typography style={styles.headerTitle}>OTP Verification</Typography>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <View style={{ marginTop: 24 }}>
        <Typography style={styles.mainTitle}>Verify Your Email</Typography>
        <Typography style={styles.description}>
          Enter the 6 digit code we sent to{' '}
          <Typography style={styles.boldEmail}>
            {email ? maskEmail(email) : 'your email'}
          </Typography>
        </Typography>
      </View>

      {/* Label */}
      <Typography style={styles.otpLabel}>OTP</Typography>

      {/* Hidden Native TextInput */}
      <RNTextInput
        ref={inputRef}
        value={code}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        importantForAutofill="yes"
        autoFocus
      />

      {/* Customized Grid of OTP Boxes */}
      <Pressable onPress={handleBoxPress} style={styles.otpGrid}>
        {Array.from({ length: CODE_LENGTH }).map((_, idx) => {
          const char = code[idx] || '';
          const isCurrentFocus = isFocused && idx === Math.min(code.length, CODE_LENGTH - 1);
          const isFilled = idx < code.length;

          let borderStyle = styles.inactiveBox;
          if (hasOtpError) borderStyle = styles.errorBox;
          else if (isCurrentFocus || isFilled) borderStyle = styles.activeBox;

          return (
            <View key={idx} style={[styles.otpBox, borderStyle]}>
              <Typography style={styles.otpText}>{char}</Typography>
            </View>
          );
        })}
      </Pressable>

      {/* Red Error Message if Code is Incorrect */}
      {hasOtpError && <Typography style={styles.errorText}>{otpErrorMessage}</Typography>}

      {/* Verify Button matching all states */}
      <Pressable
        disabled={!isCodeComplete || isLoading || isExpired}
        onPress={handleVerify}
        style={({ pressed }) => [
          styles.verifyBtn,
          {
            backgroundColor: isLoading
              ? '#F5F5F7'
              : isCodeComplete && !isExpired
                ? '#1565C0'
                : '#F5F5F7',
            opacity: pressed && isCodeComplete && !isLoading && !isExpired ? 0.85 : 1,
          },
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#1565C0" />
            <Typography style={styles.loadingText}>
              {type === 'reset-password' ? 'Verifying Code' : 'Verifying Email'}
            </Typography>
          </View>
        ) : (
          <Typography
            style={[
              styles.btnText,
              { color: isCodeComplete && !isExpired ? '#FFFFFF' : '#BDBDBD' },
            ]}
          >
            {type === 'reset-password' ? 'Continue' : 'Verify Email'}
          </Typography>
        )}
      </Pressable>

      {/* Expiry / Resend Timer */}
      <View style={styles.timerContainer}>
        {timer > 0 ? (
          <Typography style={styles.timerText}>
            Code expires in <Typography style={styles.boldTimer}>{formatTimer(timer)}</Typography>
          </Typography>
        ) : (
          <View style={styles.resendRow}>
            <Typography style={styles.timerText}>Didn&apos;t receive code? </Typography>
            <Pressable
              onPress={handleResend}
              disabled={resendOtpMutation.isPending || resetPasswordMutation.isPending}
            >
              <Typography style={styles.resendLink}>
                {resendOtpMutation.isPending || resetPasswordMutation.isPending
                  ? 'Sending...'
                  : 'Resend code'}
              </Typography>
            </Pressable>
          </View>
        )}
      </View>

      <AuthSuccessModal
        visible={showSuccessModal}
        title="Sign-up successful"
        message={`Your account has been created.\nYou can now proceed to uploading\nyour lab results.`}
        actionLabel="Go to Home Page"
        onAction={handleContinue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: '#000000',
    textAlign: 'center',
  },
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
  otpLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 32,
    marginBottom: 8,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveBox: {
    borderColor: '#E5E7EB',
  },
  activeBox: {
    borderColor: '#1565C0',
    borderWidth: 1.5,
  },
  errorBox: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  otpText: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#1B1B1B',
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 8,
  },
  verifyBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
  },
  btnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
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
  timerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#494949',
  },
  boldTimer: {
    fontFamily: 'Inter_700Bold',
    color: '#1B1B1B',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLink: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
});
