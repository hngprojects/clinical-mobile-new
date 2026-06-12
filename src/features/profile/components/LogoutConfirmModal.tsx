import React from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { DELETE_ACCOUNT_BUTTON_FILL, PROFILE_CARD_BORDER } from '../constants';

const exitIllustration = require('../../../../assets/images/exit.png');

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={[styles.card, { backgroundColor: colors.surface }]} accessibilityViewIsModal>
          <Image
            source={exitIllustration}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessible={false}
            importantForAccessibility="no"
          />

          <Typography variant="h3" style={styles.title} accessibilityRole="header">
            Logout From Clinsight?
          </Typography>

          <Typography variant="body2" color={colors.textSecondary} style={styles.message}>
            Sign in again anytime to continue accessing your reports and consultations.
          </Typography>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm logout"
              disabled={isLoading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.actionButton,
                styles.logoutButton,
                { opacity: pressed || isLoading ? 0.85 : 1 },
              ]}
            >
              <Typography variant="body1" style={styles.logoutLabel}>
                {isLoading ? 'Logging out...' : 'Logout'}
              </Typography>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel logout"
              disabled={isLoading}
              onPress={onClose}
              style={({ pressed }) => [
                styles.actionButton,
                styles.cancelButton,
                { borderColor: PROFILE_CARD_BORDER, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Typography variant="body1" style={styles.cancelLabel}>
                Cancel
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
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: 200,
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
    marginBottom: 28,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButton: {
    backgroundColor: DELETE_ACCOUNT_BUTTON_FILL,
  },
  logoutLabel: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  cancelLabel: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: '#1B1B1B',
  },
});
