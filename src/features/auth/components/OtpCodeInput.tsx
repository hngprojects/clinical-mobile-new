import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput as RNTextInput, View } from 'react-native';

import { MIN_TOUCH_TARGET, useAnnounce } from '@/shared/accessibility';
import { Typography } from '@/shared/components';

const DEFAULT_LENGTH = 6;

interface OtpCodeInputProps {
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
  hasError?: boolean;
  errorMessage?: string;
  label?: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<RNTextInput | null>;
}

export function OtpCodeInput({
  value,
  onChangeText,
  length = DEFAULT_LENGTH,
  hasError = false,
  errorMessage,
  label = 'Verification code',
  autoFocus = true,
  inputRef: externalRef,
}: OtpCodeInputProps) {
  const internalRef = useRef<RNTextInput>(null);
  const inputRef = externalRef ?? internalRef;
  const [isFocused, setIsFocused] = useState(false);

  useAnnounce(errorMessage, Boolean(hasError && errorMessage));

  const handleChange = (raw: string) => {
    onChangeText(raw.replace(/[^0-9]/g, '').slice(0, length));
  };

  const digitsEnteredLabel =
    value.length === 0
      ? `Enter ${length}-digit code`
      : `${value.length} of ${length} digits entered`;

  const accessibilityLabel = `${label}, required. ${digitsEnteredLabel}`;

  return (
    <View>
      <Typography style={styles.fieldLabel} accessibilityRole="text">
        {label}
      </Typography>

      <RNTextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        importantForAutofill="yes"
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={
          hasError && errorMessage ? `Error: ${errorMessage}` : 'Required verification code'
        }
        accessibilityState={{ disabled: false }}
      />

      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${digitsEnteredLabel}`}
        accessibilityHint="Double tap to enter verification code"
        style={styles.otpGrid}
      >
        {Array.from({ length }).map((_, idx) => {
          const char = value[idx] ?? '';
          const isCurrentFocus = isFocused && idx === Math.min(value.length, length - 1);
          const isFilled = idx < value.length;

          let borderStyle = styles.inactiveBox;
          if (hasError) borderStyle = styles.errorBox;
          else if (isCurrentFocus || isFilled) borderStyle = styles.activeBox;

          return (
            <View
              key={idx}
              style={[styles.otpBox, borderStyle]}
              accessible={false}
              importantForAccessibility="no"
            >
              <Typography style={styles.otpText}>{char}</Typography>
            </View>
          );
        })}
      </Pressable>

      {hasError && errorMessage ? (
        <Typography
          style={styles.errorText}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {errorMessage}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
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
    minHeight: MIN_TOUCH_TARGET,
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
});
