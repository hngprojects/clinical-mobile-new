import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

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
      onRequestClose={onAction}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Image
            source={require('../../../../assets/images/auth/Checked.png')}
            style={styles.successCheckImage}
          />

          <Typography style={[styles.modalTitle, { color: colors.text }]}>{title}</Typography>
          <Typography style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {message}
          </Typography>

          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.modalBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Typography style={styles.modalBtnText}>{actionLabel}</Typography>
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
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    marginTop: 24,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
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
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
