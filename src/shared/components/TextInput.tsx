import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<RNTextInput, AppTextInputProps>(
  ({ label, error, rightIcon, style, onFocus, onBlur, ...props }, ref) => {
    const { colors, typography } = useTheme();
    const [isFocused, setIsFocused] = React.useState(false);
    const internalRef = React.useRef<RNTextInput>(null);

    React.useImperativeHandle(ref, () => internalRef.current as RNTextInput);

    const handlePress = () => {
      internalRef.current?.focus();
    };

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
          onPress={handlePress}
          style={[
            styles.inputWrapper,
            {
              borderColor: error ? colors.error : isFocused ? '#1565C0' : '#D0D0D0',
              borderWidth: isFocused ? 2 : 1,
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              height: 52,
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
              typography.body1,
              {
                flex: 1,
                color: '#1B1B1B',
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                lineHeight: 21,
                letterSpacing: -0.14,
                paddingHorizontal: 20,
                paddingRight: rightIcon ? 48 : 20,
                textAlignVertical: 'center',
              },
              style,
            ]}
            placeholderTextColor="#767676"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#1565C0"
            {...props}
          />
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
  rightIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: { marginTop: 2 },
});
