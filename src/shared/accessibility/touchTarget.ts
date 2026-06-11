import { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET } from './constants';

export const minTouchTargetStyle: ViewStyle = {
  minWidth: MIN_TOUCH_TARGET,
  minHeight: MIN_TOUCH_TARGET,
  alignItems: 'center',
  justifyContent: 'center',
};

export type HitSlop = { top: number; bottom: number; left: number; right: number };

/**
 * Expands hitSlop so a visually smaller control meets the platform minimum touch target.
 */
export function expandHitSlop(currentSize: number): HitSlop {
  const deficit = Math.max(0, Math.ceil((MIN_TOUCH_TARGET - currentSize) / 2));
  return {
    top: deficit,
    bottom: deficit,
    left: deficit,
    right: deficit,
  };
}

export function mergeHitSlop(base: HitSlop, extra: Partial<HitSlop> = {}): HitSlop {
  return { ...base, ...extra };
}
