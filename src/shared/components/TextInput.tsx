import React, { forwardRef } from 'react';
import { StyleSheet, TextInput as RNTextInput, TextInputProps, View, Pressable } from 'react-native';

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
        <Pressable 
          onPress={() => (ref as any)?.current?.focus()}
          style={[
            styles.inputWrapper,
            {
              borderColor: error ? colors.error : isFocused ? colors.primary : '#D0D0D0',
              borderWidth: isFocused ? 2 : 1,
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              height: 52,
            }
          ]}
        >
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
                flex: 1,
                color: '#1B1B1B',
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                letterSpacing: -0.14,
                paddingHorizontal: 20,
                textAlignVertical: 'center',
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
                  textAlignVertical: 'center',
                }}
              >
                {displayValue}
              </Typography>
            </View>
          )}
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </Pressable>
        {error && (
          <Typography
            style={{
              color: colors.error,
              fontSize: 12,
              marginTop: 4,
              fontFamily: 'Inter_400Regular',
            }}
          >
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
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  label: { marginBottom: 2 },
  input: { 
    height: '100%',
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  maskOverlay: {
    position: 'absolute',
    left: 0,
    right: 48, // Room for rightIcon
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
