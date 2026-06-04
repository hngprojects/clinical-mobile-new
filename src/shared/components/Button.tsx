import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

import { Typography } from './Typography';

/** Hardcoded — avoids theme/Pressable issues on Android release builds. */
const BLUE = '#1565C0';
const GRAY_BG = '#F5F5F5';
const GRAY_TEXT = '#767676';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
  loadingIndicatorColor?: string;
  leftIcon?: React.ReactNode;
  /** Override fill color (e.g. delete red). */
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  label,
  variant = 'primary',
  isLoading = false,
  loadingLabel,
  loadingIndicatorColor,
  leftIcon,
  disabled,
  backgroundColor,
  textColor,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isInactive = Boolean(disabled || isLoading);

  const fill =
    backgroundColor ?? (variant === 'primary' ? (isInactive ? GRAY_BG : BLUE) : 'transparent');

  const labelColor =
    textColor ??
    (variant === 'primary' ? (isInactive && !backgroundColor ? GRAY_TEXT : '#FFFFFF') : BLUE);

  return (
    <TouchableOpacity activeOpacity={0.85} disabled={isInactive} style={style} {...props}>
      <View
        style={[
          styles.inner,
          variant === 'primary' && { backgroundColor: fill },
          variant === 'outline' && styles.outline,
          variant === 'ghost' && styles.ghost,
        ]}
      >
        {isLoading ? (
          <View style={styles.content}>
            <ActivityIndicator color={loadingIndicatorColor ?? BLUE} size="small" />
            {loadingLabel ? (
              <Typography variant="body1" color={labelColor} style={styles.label}>
                {loadingLabel}
              </Typography>
            ) : null}
          </View>
        ) : (
          <View style={styles.content}>
            {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
            <Typography
              variant="body1"
              color={labelColor}
              style={[styles.label, variant === 'outline' && styles.outlineLabel, textStyle]}
            >
              {label}
            </Typography>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    maxWidth: '100%',
  },
  iconContainer: {
    marginRight: 0,
  },
  label: {
    flexShrink: 1,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineLabel: {
    fontWeight: '500',
  },
});
