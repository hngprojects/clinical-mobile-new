import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

import { loadingLabel } from '@/shared/accessibility';
import { useTheme } from '@/shared/theme';

import { Typography } from './Typography';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { colors } = useTheme();
  const accessibilityLabel = message ?? loadingLabel();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      accessibilityViewIsModal
      onRequestClose={() => undefined}
    >
      <View
        style={styles.backdrop}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ busy: true }}
        importantForAccessibility="yes"
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            accessibilityLabel={accessibilityLabel}
          />
          {message && (
            <Typography variant="body2" style={styles.message}>
              {message}
            </Typography>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    minWidth: 120,
  },
  message: { textAlign: 'center' },
});
