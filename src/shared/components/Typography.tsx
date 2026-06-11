import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { MAX_FONT_SIZE_MULTIPLIER } from '@/shared/accessibility';
import { useTheme } from '@/shared/theme';
import { TypographyVariant } from '@/shared/theme/typography';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
}

export function Typography({
  variant = 'body1',
  color,
  align,
  style,
  allowFontScaling = true,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  ...props
}: TypographyProps) {
  const { colors, typography } = useTheme();

  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[typography[variant], { color: color ?? colors.text, textAlign: align }, style]}
      {...props}
    />
  );
}
