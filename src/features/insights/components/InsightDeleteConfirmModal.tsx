import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import {
  INSIGHT_CARD_RADIUS,
  INSIGHT_DELETE_BUTTON_FILL,
  INSIGHT_MENU_RADIUS,
} from '../api/constants';
import type { InsightDeleteConfirmModalProps } from '../api/types';

export function InsightDeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
}: InsightDeleteConfirmModalProps) {
  const { colors, spacing } = useTheme();

  const confirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderRadius: INSIGHT_MENU_RADIUS,
              padding: spacing.lg,
            },
          ]}
        >
          <Typography variant="h3" style={styles.title}>
            Delete this insight?
          </Typography>
          <Typography variant="body2" color={colors.textSecondary} style={styles.subtitle}>
            This action cannot be undone.
          </Typography>
          <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.lg }]}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  paddingVertical: spacing.sm + 4,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Typography variant="body1" color={colors.textSecondary}>
                Cancel
              </Typography>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm delete"
              onPress={confirm}
              style={({ pressed }) => [
                styles.btn,
                styles.dangerBtn,
                {
                  backgroundColor: INSIGHT_DELETE_BUTTON_FILL,
                  paddingVertical: spacing.sm + 4,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Typography variant="body1" style={styles.deleteLabel}>
                Delete
              </Typography>
            </Pressable>
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
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: INSIGHT_CARD_RADIUS,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  dangerBtn: {
    borderWidth: 0,
  },
  deleteLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
