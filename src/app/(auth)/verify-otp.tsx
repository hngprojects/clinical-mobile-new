import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';

import { useVerifyOtp } from '@/features/auth/hooks/useVerifyOtp';
import { useResendOtp } from '@/features/auth/hooks/useResendOtp';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Screen, Typography } from '@/shared/components';
import type { ApiError } from '@/shared/api/types';

const CODE_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{
    email: string;
  }>();

  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const [code, setCode] = useState('');

  // 30 seconds visual countdown (or matching backend value dynamically if desired)
  const initialCooldown = 30;
  const [timer, setTimer] = useState(initialCooldown);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);

  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Timer countdown logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle mutation error states dynamically
  useEffect(() => {
    if (verifyOtpMutation.isError) {
      const errStatus = (verifyOtpMutation.error as ApiError)?.status;
      const errMsg = verifyOtpMutation.error?.message?.toLowerCase() || '';

      // If it's a 400 error (or validation/incorrect code error)
      if (errStatus === 400 || errMsg.includes('incorrect') || errMsg.includes('invalid')) {
        setHasOtpError(true);
        setHasNetworkError(false);
      } else {
        // General connection/network error or 500 error
        setHasNetworkError(true);
        setHasOtpError(false);
      }
    }
  }, [verifyOtpMutation.isError, verifyOtpMutation.error]);

  useEffect(() => {
    if (verifyOtpMutation.isSuccess) {
      setShowSuccessModal(true);
    }
  }, [verifyOtpMutation.isSuccess]);

  const handleVerify = () => {
    if (code.length !== CODE_LENGTH) return;
    Keyboard.dismiss();
    verifyOtpMutation.mutate({
      email: email || '',
      code,
    });
  };

  const handleResend = () => {
    if (timer > 0 || resendOtpMutation.isPending) return;
    setTimer(initialCooldown);
    setHasOtpError(false);
    setHasNetworkError(false);
    setCode('');
    verifyOtpMutation.reset();
    resendOtpMutation.mutate({
      email: email || '',
    });
  };

  const handleTextChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleanVal);

    // Clear error states as soon as user types
    if (hasOtpError || hasNetworkError) {
      setHasOtpError(false);
      setHasNetworkError(false);
      verifyOtpMutation.reset();
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
  const isLoading = verifyOtpMutation.isPending;

  return (
    <>
      <Stack.Screen options={{ title: 'OTP Verification', headerShown: false }} />

      {/* Network/Connection Error Banner at the absolute top */}
      {hasNetworkError && (
        <View style={styles.networkErrorBanner}>
          <Typography style={styles.networkErrorText}>
            We couldn’t verify you right now. Please check your connection and try again.
          </Typography>
        </View>
      )}

      <Screen padding style={{ backgroundColor: '#FFFFFF' }} keyboardAvoiding>
        {/* Customized Header */}
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
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
            <Typography style={styles.boldEmail}>{email || 'your email'}</Typography>
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
          autoFocus
        />

        {/* Customized Grid of OTP Boxes */}
        <Pressable onPress={handleBoxPress} style={styles.otpGrid}>
          {Array.from({ length: CODE_LENGTH }).map((_, idx) => {
            const char = code[idx] || '';
            const isCurrentFocus = isFocused && idx === Math.min(code.length, CODE_LENGTH - 1);
            const isFilled = idx < code.length;

            let borderStyle = styles.inactiveBox;
            if (hasOtpError) {
              borderStyle = styles.errorBox;
            } else if (isCurrentFocus || isFilled) {
              borderStyle = styles.activeBox;
            }

            return (
              <View key={idx} style={[styles.otpBox, borderStyle]}>
                <Typography style={styles.otpText}>{char}</Typography>
              </View>
            );
          })}
        </Pressable>

        {/* Red Error Message if Code is Incorrect */}
        {hasOtpError && (
          <Typography style={styles.errorText}>
            The code you entered was incorrect, check again.
          </Typography>
        )}

        {/* Verify Button matching all states */}
        <Pressable
          disabled={!isCodeComplete || isLoading}
          onPress={handleVerify}
          style={({ pressed }) => [
            styles.verifyBtn,
            {
              backgroundColor: isLoading ? '#F5F5F7' : isCodeComplete ? '#1565C0' : '#F5F5F7',
              opacity: pressed && isCodeComplete && !isLoading ? 0.85 : 1,
            },
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#1565C0" />
              <Typography style={styles.loadingText}>Verifying Email</Typography>
            </View>
          ) : (
            <Typography style={[styles.btnText, { color: isCodeComplete ? '#FFFFFF' : '#BDBDBD' }]}>
              Verify Email
            </Typography>
          )}
        </Pressable>

        {/* Expiry / Resend Timer */}
        <View style={styles.timerContainer}>
          {timer > 0 ? (
            <Typography style={styles.timerText}>
              Code expires in{' '}
              <Typography style={styles.boldTimer}>
                00:{timer < 10 ? `0${timer}` : timer}
              </Typography>
            </Typography>
          ) : (
            <View style={styles.resendRow}>
              <Typography style={styles.timerText}>Didn&apos;t receive code? </Typography>
              <Pressable onPress={handleResend} disabled={resendOtpMutation.isPending}>
                <Typography style={styles.resendLink}>
                  {resendOtpMutation.isPending ? 'Sending...' : 'Resend code'}
                </Typography>
              </Pressable>
            </View>
          )}
        </View>
      </Screen>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Circle Checkmark Icon */}
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={54} color="#FFFFFF" />
            </View>

            <Typography style={styles.modalTitle}>Sign-up successful</Typography>

            <Typography style={styles.modalSubtitle}>
              Your account has been created.{'\n'}
              You can now proceed to uploading{'\n'}
              your lab results.
            </Typography>

            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [styles.modalBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Typography style={styles.modalBtnText}>Go to Home Page</Typography>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  networkErrorBanner: {
    backgroundColor: '#F5F5F7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  networkErrorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#494949',
    textAlign: 'center',
    lineHeight: 18,
  },
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
    height: 52,
    borderRadius: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1B1B1B',
    marginTop: 24,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#494949',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 12,
  },
  modalBtn: {
    height: 52,
    width: '100%',
    backgroundColor: '#1565C0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  modalBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
