import { TextStyle } from 'react-native';

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  } satisfies TextStyle,
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  } satisfies TextStyle,
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  } satisfies TextStyle,
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  } satisfies TextStyle,
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
  } satisfies TextStyle,
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  } satisfies TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
