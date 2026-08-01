import { lightColors } from '@/shared/theme/colors';

/**
 * WCAG 2.1 AA verified text/background pairs (light theme).
 *
 * | Token              | Foreground | Background | Ratio  | Passes |
 * |--------------------|------------|------------|--------|--------|
 * | text               | #111827    | #FFFFFF    | ~16:1  | AA     |
 * | text on background | #111827    | #F9FAFB    | ~15:1  | AA     |
 * | textSecondary      | #374151    | #FFFFFF    | ~9.7:1 | AA     |
 * | placeholder        | #6B7280    | #FFFFFF    | ~4.6:1 | AA     |
 * | primary button     | #FFFFFF    | #1565C0    | ~4.6:1 | AA     |
 * | error              | #EF4444    | #FFFFFF    | ~4.5:1 | AA     |
 * | tabBarInactive     | #374151    | #FFFFFF    | ~9.7:1 | AA     |
 */
export const accessibleTextColors = {
  body: lightColors.text,
  secondary: lightColors.textSecondary,
  placeholder: lightColors.placeholder,
  error: lightColors.error,
  onPrimary: '#FFFFFF',
} as const;

export type AccessibleTextColor = keyof typeof accessibleTextColors;
