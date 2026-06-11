import React, { forwardRef, useId } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from 'react-native';

import { MIN_TOUCH_TARGET } from '@/shared/accessibility';
import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<RNTextInput, AppTextInputProps>(
  (
    {
      label,
      error,
      required = false,
      rightIcon,
      style,
      onFocus,
      onBlur,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);
    const internalRef = React.useRef<RNTextInput>(null);
    const errorId = useId();

    React.useImperativeHandle(ref, () => internalRef.current as RNTextInput);

    const handlePress = () => {
      internalRef.current?.focus();
    };

    const resolvedAccessibilityLabel =
      accessibilityLabel ?? (label ? `${label}${required ? ', required' : ''}` : undefined);

    const hintParts = [
      required ? 'Required field' : undefined,
      accessibilityHint,
      error ? `Error: ${error}` : undefined,
    ].filter(Boolean);
    const resolvedAccessibilityHint = hintParts.length > 0 ? hintParts.join('. ') : undefined;

    return (
      <View style={styles.container}>
        {label && (
          <Typography variant="label" style={[styles.label, { color: colors.text }]}>
            {label}
          </Typography>
        )}
        <Pressable
          onPress={handlePress}
          accessible={false}
          importantForAccessibility="no"
          style={[
            styles.inputWrapper,
            {
              borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
              borderWidth: isFocused ? 2 : 1,
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              minHeight: MIN_TOUCH_TARGET,
            },
          ]}
        >
          <RNTextInput
            ref={internalRef}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            style={[
              styles.input,
              {
                flex: 1,
                color: colors.text,
                paddingHorizontal: 20,
                paddingRight: rightIcon ? 48 : 20,
                textAlignVertical: 'center',
              },
              style,
            ]}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor={colors.primary}
            accessibilityLabel={resolvedAccessibilityLabel}
            accessibilityHint={resolvedAccessibilityHint}
            accessibilityState={{ disabled: props.editable === false }}
            {...props}
          />
          {rightIcon && (
            <View style={styles.rightIcon} accessible={false} importantForAccessibility="no">
              {rightIcon}
            </View>
          )}
        </Pressable>
        {error && (
          <Typography
            nativeID={errorId}
            accessibilityLiveRegion="polite"
            variant="label"
            style={{ color: colors.error, marginTop: 4 }}
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
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  rightIcon: {
    position: 'absolute',
    right: 0,
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
