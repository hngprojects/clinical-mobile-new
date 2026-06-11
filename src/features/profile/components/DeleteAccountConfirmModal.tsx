import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { TextInput, Typography } from '@/shared/components';
import { MIN_TOUCH_TARGET } from '@/shared/accessibility';
import { useTheme } from '@/shared/theme';

import { DELETE_ACCOUNT_BUTTON_FILL, DELETE_ACCOUNT_ICON_RING } from '../constants';

const CONFIRM_PHRASE = 'Delete';

type DeleteAccountStep = 'warning' | 'confirm';

interface DeleteAccountConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteAccountConfirmModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteAccountConfirmModalProps) {
  const { colors } = useTheme();
  const [step, setStep] = useState<DeleteAccountStep>('warning');
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!visible) {
      setStep('warning');
      setConfirmText('');
    }
  }, [visible]);

  const handleClose = () => {
    setStep('warning');
    setConfirmText('');
    onClose();
  };

  const isConfirmPhraseMatch = confirmText.trim() === CONFIRM_PHRASE;
  const canSubmitDelete = isConfirmPhraseMatch && !isLoading;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {step === 'warning' ? (
            <>
              <View style={[styles.iconRing, { backgroundColor: DELETE_ACCOUNT_ICON_RING }]}>
                <Ionicons name="warning" size={36} color={DELETE_ACCOUNT_BUTTON_FILL} />
              </View>

              <Typography variant="h3" style={styles.title}>
                Delete Account
              </Typography>

              <Typography variant="body2" color={colors.textSecondary} style={styles.message}>
                Deleting your account will permanently erase your medical insights, history, and
                saved records. This action cannot be undone
              </Typography>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue to delete account"
                onPress={() => setStep('confirm')}
                style={({ pressed }) => [
                  styles.confirmButton,
                  {
                    backgroundColor: DELETE_ACCOUNT_BUTTON_FILL,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Typography variant="body1" style={styles.confirmLabel}>
                  Delete Account
                </Typography>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.iconRing, { backgroundColor: DELETE_ACCOUNT_ICON_RING }]}>
                <Ionicons name="warning" size={36} color={DELETE_ACCOUNT_BUTTON_FILL} />
              </View>

              <Typography variant="h3" style={styles.title}>
                Are You Sure?
              </Typography>

              <Typography variant="body2" color={colors.textSecondary} style={styles.message}>
                You&apos;re about to permanently delete your account and all associated medical
                insights.
              </Typography>

              <View style={styles.inputBlock}>
                <Text style={styles.inputHint}>
                  Type <Text style={styles.inputHintBold}>{CONFIRM_PHRASE}</Text> to confirm
                </Text>
                <TextInput
                  label="Type Delete to confirm"
                  required
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder={CONFIRM_PHRASE}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  accessibilityHint={`Type the word ${CONFIRM_PHRASE} exactly to enable account deletion`}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm delete account"
                accessibilityState={{ disabled: !canSubmitDelete, busy: isLoading }}
                disabled={!canSubmitDelete}
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.confirmButton,
                  {
                    backgroundColor: canSubmitDelete ? DELETE_ACCOUNT_BUTTON_FILL : '#F5F5F5',
                    opacity: pressed && canSubmitDelete ? 0.85 : 1,
                  },
                ]}
              >
                <Typography
                  variant="body1"
                  style={[styles.confirmLabel, !canSubmitDelete && styles.confirmLabelDisabled]}
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </Typography>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel delete account"
                onPress={handleClose}
                disabled={isLoading}
                style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Typography variant="body1" color={colors.textSecondary} style={styles.cancelLabel}>
                  Cancel
                </Typography>
              </Pressable>
            </>
          )}
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
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  inputBlock: {
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  inputHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: '#767676',
    letterSpacing: -0.14,
  },
  inputHintBold: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#1B1B1B',
  },
  confirmButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: MIN_TOUCH_TARGET,
  },
  confirmLabel: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  confirmLabelDisabled: {
    color: '#767676',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  cancelLabel: {
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
});
