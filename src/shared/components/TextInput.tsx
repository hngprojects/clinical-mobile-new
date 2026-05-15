import React, { forwardRef } from 'react';
import { StyleSheet, TextInput as RNTextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<RNTextInput, AppTextInputProps>(
  ({ label, error, rightIcon, style, secureTextEntry, value, ...props }, ref) => {
    const { colors, spacing, typography } = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);

    const isSecure = secureTextEntry;
    const displayValue = isSecure && value ? '*'.repeat(value.length) : value;

    return (
      <View style={styles.container}>
        {label && (
          <Typography
            variant="label"
            style={[
              styles.label,
              {
                color: '#1B1B1B',
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                letterSpacing: -0.14,
              },
            ]}
          >
            {label}
          </Typography>
        )}
        <View style={styles.inputWrapper}>
          <RNTextInput
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            style={[
              styles.input,
              {
                height: 52,
                color: '#1B1B1B',
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                letterSpacing: -0.14,
                backgroundColor: colors.inputBackground,
                borderColor: error ? colors.error : isFocused ? colors.primary : '#D0D0D0',
                paddingHorizontal: 20,
                borderRadius: 12,
                borderWidth: 1,
              },
              isSecure && { color: 'transparent' },
              style,
            ]}
            placeholderTextColor="#767676"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
            value={value}
            selectionColor={colors.primary}
            {...props}
          />
          {isSecure && value && (
            <View style={styles.maskOverlay} pointerEvents="none">
              <Typography
                style={{
                  color: '#1B1B1B',
                  paddingLeft: 20,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  lineHeight: 21,
                  letterSpacing: 2,
                }}
              >
                {displayValue}
              </Typography>
            </View>
          )}
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
        {error && (
          <Typography variant="label" color={colors.error} style={styles.error}>
            {error}
          </Typography>
        )}
      </View>
    );
  },
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: { gap: 4 },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  label: { marginBottom: 2 },
  input: { borderWidth: 1.5 },
  maskOverlay: {
    position: 'absolute',
    left: 0,
    right: 48, // Room for rightIcon
    justifyContent: 'center',
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: { marginTop: 2 },
});
