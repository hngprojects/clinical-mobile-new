import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReducedMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReducedMotion(false);
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}

export function useAnnounce(message: string | undefined, enabled: boolean): void {
  const announcedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !message || announcedRef.current === message) return;

    announcedRef.current = message;

    if (Platform.OS === 'web') return;

    AccessibilityInfo.announceForAccessibility(message);
  }, [enabled, message]);
}
