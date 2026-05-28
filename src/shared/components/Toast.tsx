import { Ionicons } from '@expo/vector-icons';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

type ToastVariant = 'success' | 'error' | 'neutral';

interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
}

interface ToastEntry {
  id: string;
  message: string;
  variant: ToastVariant;
  visible: boolean;
}

interface ToastHostContextValue {
  dismissToast: (id: string) => void;
  updateToast: (entry: ToastEntry) => void;
}

const ICON: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark',
  error: 'close',
  neutral: 'information',
};

const ToastHostContext = createContext<ToastHostContextValue | null>(null);
let nextToastId = 0;

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);

  const updateToast = useCallback((entry: ToastEntry) => {
    setEntries((current) => {
      const existingIndex = current.findIndex((item) => item.id === entry.id);
      if (existingIndex === -1) return [...current, entry];

      const next = [...current];
      next[existingIndex] = entry;
      return next;
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, visible: false } : entry)),
    );
  }, []);

  const removeToast = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const contextValue = useMemo(
    () => ({
      dismissToast,
      updateToast,
    }),
    [dismissToast, updateToast],
  );

  return (
    <ToastHostContext.Provider value={contextValue}>
      <View style={styles.hostRoot}>
        {children}
        <View style={styles.hostOverlay} pointerEvents="none">
          {entries.map((entry, index) => (
            <ToastCard
              key={entry.id}
              id={entry.id}
              message={entry.message}
              onExitComplete={removeToast}
              stackIndex={index}
              variant={entry.variant}
              visible={entry.visible}
            />
          ))}
        </View>
      </View>
    </ToastHostContext.Provider>
  );
}

export function Toast({ visible, message, variant = 'neutral' }: ToastProps) {
  const host = useContext(ToastHostContext);
  const idRef = useRef<string | null>(null);

  if (idRef.current === null) {
    nextToastId += 1;
    idRef.current = `toast-${nextToastId}`;
  }

  useEffect(() => {
    if (!host) return undefined;

    const id = idRef.current;
    if (!id) return undefined;

    if (visible && message) {
      host.updateToast({ id, message, variant, visible: true });
    } else {
      host.dismissToast(id);
    }

    return undefined;
  }, [host, message, variant, visible]);

  useEffect(() => {
    if (!host) return undefined;

    const id = idRef.current;
    return () => {
      if (id) host.dismissToast(id);
    };
  }, [host]);

  if (host) return null;

  return <ToastCard message={message} variant={variant} visible={visible} />;
}

function ToastCard({
  id,
  message,
  onExitComplete,
  stackIndex = 0,
  variant = 'neutral',
  visible,
}: ToastProps & {
  id?: string;
  onExitComplete?: (id: string) => void;
  stackIndex?: number;
}) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-160)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const animationRunRef = useRef(0);
  const [renderVisible, setRenderVisible] = useState(visible);

  useEffect(() => {
    animationRunRef.current += 1;
    const animationRun = animationRunRef.current;
    slideAnim.stopAnimation();
    opacityAnim.stopAnimation();

    if (visible) {
      setRenderVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 14,
        }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -160, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        if (animationRunRef.current !== animationRun) return;

        setRenderVisible(false);
        if (id) onExitComplete?.(id);
      });
    }
  }, [id, visible, slideAnim, opacityAnim, onExitComplete]);

  const bgColor =
    variant === 'success'
      ? colors.successSubtle
      : variant === 'error'
        ? colors.errorSubtle
        : colors.surfaceMuted;

  const iconBgColor =
    variant === 'success' ? colors.success : variant === 'error' ? colors.error : colors.primary;

  if (!renderVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, top: 62 + stackIndex * 92 },
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <Ionicons name={ICON[variant]} size={16} color="#FFFFFF" />
      </View>
      <Typography variant="body2" style={styles.message}>
        {message}
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hostRoot: {
    flex: 1,
  },
  hostOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 82,
    borderRadius: 20,
    padding: 20,
    gap: 17,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      android: { elevation: 10 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  message: { flex: 1 },
});
