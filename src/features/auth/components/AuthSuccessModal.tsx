import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/shared/accessibility';
import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface AuthSuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function AuthSuccessModal({
  visible,
  title,
  message,
  actionLabel,
  onAction,
}: AuthSuccessModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      accessibilityViewIsModal
      onRequestClose={onAction}
    >
      <View style={styles.modalOverlay} accessibilityLabel={`${title}. ${message}`}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Image
            source={require('../../../../assets/images/auth/Checked.png')}
            style={styles.successCheckImage}
            accessible={false}
          />

          <Typography variant="h2" style={[styles.modalTitle, { color: colors.text }]}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            style={[styles.modalSubtitle, { color: colors.textSecondary }]}
          >
            {message}
          </Typography>

          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={({ pressed }) => [
              styles.modalBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Typography variant="buttonLabel" style={styles.modalBtnText}>
              {actionLabel}
            </Typography>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: '88%',
  },
  successCheckImage: {
    height: 96,
    width: 96,
  },
  modalTitle: {
    fontSize: 22,
    marginTop: 24,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  modalBtn: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
    paddingVertical: 15,
    width: '100%',
    minHeight: MIN_TOUCH_TARGET,
  },
  modalBtnText: {
    color: '#FFFFFF',
  },
});
