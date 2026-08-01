import { expandHitSlop, minTouchTargetStyle } from '../touchTarget';
import { MIN_TOUCH_TARGET } from '../constants';

describe('expandHitSlop', () => {
  it('returns zero slop when size already meets minimum', () => {
    expect(expandHitSlop(MIN_TOUCH_TARGET)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it('expands slop symmetrically for smaller controls', () => {
    const slop = expandHitSlop(24);
    expect(slop.top).toBeGreaterThan(0);
    expect(slop.top).toBe(slop.bottom);
    expect(slop.left).toBe(slop.right);
  });
});

describe('minTouchTargetStyle', () => {
  it('uses the platform minimum touch target dimensions', () => {
    expect(minTouchTargetStyle.minWidth).toBe(MIN_TOUCH_TARGET);
    expect(minTouchTargetStyle.minHeight).toBe(MIN_TOUCH_TARGET);
  });
});
