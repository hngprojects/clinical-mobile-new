import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';

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
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Image
            source={require('../../../../assets/images/auth/Checked.png')}
            style={styles.successCheckImage}
          />

          <Typography style={styles.modalTitle}>{title}</Typography>
          <Typography style={styles.modalSubtitle}>{message}</Typography>

          <Pressable
            onPress={onAction}
            style={({ pressed }) => [styles.modalBtn, { opacity: pressed ? 0.85 : 1 }]}
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
    backgroundColor: '#FFFFFF',
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
    color: '#1B1B1B',
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    marginTop: 24,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  modalBtn: {
    alignItems: 'center',
    backgroundColor: '#1565C0',
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
