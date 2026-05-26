import { StyleSheet } from 'react-native';

export const LEGAL_HERO_COLOR = '#155AA0';

export const legalHeroStyles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor: LEGAL_HERO_COLOR,
    height: 74,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
    position: 'relative',
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: -0.12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
});
