export function getAnimationDuration(reducedMotion: boolean, normalMs: number): number {
  return reducedMotion ? 0 : normalMs;
}

export function shouldAnimate(reducedMotion: boolean): boolean {
  return !reducedMotion;
}
