import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

type ToastVariant = 'success' | 'error' | 'neutral';

interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
}

const ICON: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark',
  error: 'close',
  neutral: 'information',
};

export function Toast({ visible, message, variant = 'neutral' }: ToastProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-160)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
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
      ]).start(() => setModalVisible(false));
    }
  }, [visible, slideAnim, opacityAnim]);

  const bgColor =
    variant === 'success'
      ? colors.successSubtle
      : variant === 'error'
        ? colors.errorSubtle
        : '#F5F5F5';

  const iconBgColor =
    variant === 'success' ? colors.success : variant === 'error' ? colors.error : '#767676';

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: bgColor },
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    pointerEvents: 'box-none',
  },
  container: {
    position: 'absolute',
    top: 62,
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
