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
          <Typography variant="label" style={styles.label}>
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
              typography.body1,
              {
                color: isSecure ? 'transparent' : colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
                paddingLeft: spacing.md,
                paddingRight: rightIcon ? spacing.xl * 1.5 : spacing.md,
                paddingVertical: spacing.sm + 4,
                borderRadius: spacing.sm,
              },
              style,
            ]}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false} // Disable native dots to use our overlay
            value={value}
            selectionColor={colors.primary}
            {...props}
          />
          {isSecure && value && (
            <View style={styles.maskOverlay} pointerEvents="none">
              <Typography
                variant="body1"
                style={{
                  color: colors.text,
                  paddingLeft: spacing.md,
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
