import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';

const checkedIcon = require('../../../../assets/images/Checked.png');

interface PasswordSuccessModalProps {
  visible: boolean;
  message?: string;
  buttonLabel?: string;
  onConfirm: () => void;
}

export function PasswordSuccessModal({
  visible,
  message = 'Your password has successfully\nbeen updated .',
  buttonLabel = 'Back To Profile',
  onConfirm,
}: PasswordSuccessModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onConfirm}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Image
            source={checkedIcon}
            style={styles.icon}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />

          <Typography variant="h3" style={styles.title}>
            Success
          </Typography>

          <Typography variant="body2" color="#555555" style={styles.message}>
            {message}
          </Typography>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
            onPress={onConfirm}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Typography variant="body1" style={styles.buttonLabel}>
              {buttonLabel}
            </Typography>
          </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  icon: {
    width: 96,
    height: 96,
  },
  title: {
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 12,
    paddingVertical: 16,
  },
  buttonLabel: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});
