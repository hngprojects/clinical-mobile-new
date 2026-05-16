import { Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useOnboardingLayout() {
  const layoutScale = clamp(Math.min(W / 375, H / 812), 0.7, 1.15);
  const textScale = H < 700 ? 1.1 : clamp(W / 375, 1.0, 1.25);
  const topBalanceOffset = H >= 830 ? Math.min(H * 0.045, 44) : 0;

  return { layoutScale, textScale, topBalanceOffset, W, H };
}
