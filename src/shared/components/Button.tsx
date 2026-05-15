import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export function Button({
  label,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  disabled,
  style,
  textColor: customTextColor,
  ...props
}: ButtonProps) {
  const { colors, spacing } = useTheme();
  const isDisabled = disabled || isLoading;

  const containerStyle = [
    styles.base,
    {
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.sm,
      opacity: isDisabled ? 0.6 : 1,
    },
    variant === 'primary' && { backgroundColor: colors.primary },
    variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    style,
  ];

  const textColor = customTextColor ?? (variant === 'primary' ? '#FFFFFF' : colors.primary);

  return (
    <Pressable
      style={containerStyle}
      disabled={isDisabled}
      android_ripple={{ color: colors.primaryPressed }}
      {...props}
    >
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primary} size="small" />}
        {(isLoading || !isLoading) && (
          <>
            {leftIcon && !isLoading && <View style={styles.iconContainer}>{leftIcon}</View>}
            <Typography
              variant="body1"
              color={textColor}
              style={[
                styles.label,
                variant === 'outline' && { fontWeight: '500', color: colors.textSecondary },
              ]}
            >
              {label}
            </Typography>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconContainer: {
    marginRight: 0,
  },
  label: {
    fontWeight: '600',
  },
});
