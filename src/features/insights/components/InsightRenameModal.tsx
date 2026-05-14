import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import {
  INSIGHT_CARD_RADIUS,
  INSIGHT_MENU_RADIUS,
  INSIGHT_RENAME_ACTIVE_BLUE,
  INSIGHT_RENAME_MAX_LENGTH,
} from '../api/constants';
import type { InsightRenameModalProps } from '../api/types';

export function InsightRenameModal({
  visible,
  initialValue,
  onClose,
  onSubmit,
}: InsightRenameModalProps) {
  const { colors, spacing, typography } = useTheme();
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setDraft(initialValue);
    }
  }, [visible, initialValue]);

  const len = draft.length;
  const trimmed = draft.trim();
  const isOver = len > INSIGHT_RENAME_MAX_LENGTH;
  const canSubmit = trimmed.length >= 1 && len <= INSIGHT_RENAME_MAX_LENGTH;

  const inputBorderColor = useMemo(() => {
    if (isOver) return colors.error;
    if (len === 0) return colors.border;
    return INSIGHT_RENAME_ACTIVE_BLUE;
  }, [colors.border, colors.error, isOver, len]);

  const apply = () => {
    if (!canSubmit) return;
    onSubmit(trimmed);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
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
            accessibilityViewIsModal
          >
            <Typography variant="h3" style={styles.title}>
              Rename Insight
            </Typography>
            <TextInput
              accessibilityLabel="New insight title"
              value={draft}
              onChangeText={setDraft}
              style={[
                typography.body1,
                styles.input,
                {
                  color: colors.text,
                  borderColor: inputBorderColor,
                  borderRadius: INSIGHT_CARD_RADIUS,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm + 4,
                },
              ]}
              autoFocus
              autoCorrect
              underlineColorAndroid="transparent"
            />
            <Typography variant="label" color={colors.textSecondary} style={styles.counter}>
              {len}/{INSIGHT_RENAME_MAX_LENGTH} characters
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
                accessibilityState={{ disabled: !canSubmit }}
                disabled={!canSubmit}
                onPress={apply}
                style={({ pressed }) => [
                  styles.btn,
                  styles.primaryBtn,
                  {
                    backgroundColor: canSubmit ? INSIGHT_RENAME_ACTIVE_BLUE : '#E5E7EB',
                    paddingVertical: spacing.sm + 4,
                    opacity: pressed && canSubmit ? 0.9 : 1,
                  },
                ]}
              >
                <Typography
                  variant="body1"
                  style={{ fontWeight: '600', color: canSubmit ? '#FFFFFF' : '#9CA3AF' }}
                >
                  Rename
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
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
    marginBottom: 16,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1.5,
    width: '100%',
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: 6,
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
    backgroundColor: 'transparent',
  },
  primaryBtn: {
    borderWidth: 0,
  },
});
