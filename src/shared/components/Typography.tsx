import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { useTheme } from '@/shared/theme';
import { TypographyVariant } from '@/shared/theme/typography';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function Typography({ variant = 'body1', color, align, style, ...props }: TypographyProps) {
  const { colors, typography } = useTheme();

  return (
    <Text
      style={[typography[variant], { color: color ?? colors.text, textAlign: align }, style]}
      {...props}
    />
  );
}
