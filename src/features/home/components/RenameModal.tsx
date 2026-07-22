import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';

import { Button, TextInput, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

const MAX_LENGTH = 50;

interface RenameModalProps {
  visible: boolean;
  currentTitle: string;
  onCancel: () => void;
  onConfirm: (newTitle: string) => void;
}

export function RenameModal({ visible, currentTitle, onCancel, onConfirm }: RenameModalProps) {
  const { colors, spacing } = useTheme();
  const [value, setValue] = useState(currentTitle);

  useEffect(() => {
    if (visible) setValue(currentTitle);
  }, [visible, currentTitle]);

  const isOverLimit = value.length > MAX_LENGTH;
  const isEmpty = value.trim().length === 0;
  const canRename = !isOverLimit && !isEmpty;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing.lg }]}>
            <Typography variant="h2" style={styles.title}>
              Rename Insight
            </Typography>

            <View style={{ gap: 4 }}>
              <TextInput
                value={value}
                onChangeText={setValue}
                autoFocus
                error={isOverLimit ? `${value.length}/${MAX_LENGTH} characters` : undefined}
              />
              {!isOverLimit && (
                <Typography variant="label" color={colors.textSecondary} align="right">
                  {value.length}/{MAX_LENGTH} characters
                </Typography>
              )}
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
                <Button
                  label="Rename"
                  variant="primary"
                  disabled={!canRename}
                  onPress={() => onConfirm(value.trim())}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
