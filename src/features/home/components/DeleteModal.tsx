import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { Button, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface DeleteModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ visible, onCancel, onConfirm }: DeleteModalProps) {
  const { colors, spacing } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.lg }]}>
          <View style={{ gap: 6 }}>
            <Typography variant="h2" style={styles.title}>
              Delete this insight?
            </Typography>
            <Typography variant="body1" color={colors.textSecondary}>
              This action cannot be undone.
            </Typography>
          </View>

          <View style={styles.buttons}>
            <View style={styles.btn}>
              <Button
                label="Cancel"
                variant="outline"
                onPress={onCancel}
                style={{ borderColor: colors.border }}
              />
            </View>
            <View style={styles.btn}>
              <Button label="Delete" onPress={onConfirm} style={{ backgroundColor: '#EF4444' }} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
});
