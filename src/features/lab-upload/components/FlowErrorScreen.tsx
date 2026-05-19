import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Screen, Typography } from '@/shared/components';

interface FlowErrorScreenProps {
  title: string;
  message: React.ReactNode;
  icon?: 'warning' | 'network';
  onClose: () => void;
  onRetry: () => void;
  showDisabledAiReview?: boolean;
  footer?: React.ReactNode;
}

export function FlowErrorScreen({
  title,
  message,
  icon = 'warning',
  onClose,
  onRetry,
  showDisabledAiReview = false,
  footer,
}: FlowErrorScreenProps) {
  return (
    <Screen edges={['top', 'bottom']} backgroundColor="#FFFFFF" style={styles.screen}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={onClose}
          style={styles.closeButton}
        >
          <Ionicons name="close-outline" size={24} color="#111827" />
        </Pressable>

        <View style={styles.body}>
          <ErrorHalo icon={icon} />
          <View style={styles.copy}>
            <Typography style={styles.title}>{title}</Typography>
            <Typography style={styles.message}>{message}</Typography>
          </View>
          <View style={styles.actions}>
            <Button
              label="Retry"
              onPress={onRetry}
              style={[styles.retryButton, { backgroundColor: '#FDE1E2' }]}
              textStyle={styles.errorButtonLabel}
              textColor="#F84343"
              leftIcon={<Ionicons name="sync-outline" size={20} color="#F84343" />}
            />
            {showDisabledAiReview ? (
              <Button
                label="Get AI Review"
                disabled
                style={[styles.disabledButton, { backgroundColor: '#F5F5F5' }]}
                textStyle={styles.errorButtonLabel}
                textColor="#767676"
              />
            ) : null}
            {footer}
          </View>
        </View>
      </View>
    </Screen>
  );
}

function ErrorHalo({ icon }: { icon: 'warning' | 'network' }) {
  return (
    <View style={styles.haloOuter}>
      <View style={styles.haloMiddle}>
        <View style={styles.haloInner}>
          <Ionicons
            name={icon === 'network' ? 'cloud-offline-outline' : 'warning'}
            size={48}
            color="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
}

export function FileSizeMessage() {
  return (
    <>
      File size limit exceeded. Please upload a file smaller than{' '}
      <Typography style={styles.messageEmphasis}>10 MB.</Typography>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  screen: {
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    width: 24,
    zIndex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 68,
    paddingBottom: 96,
  },
  haloOuter: {
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: '#FDE1E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloMiddle: {
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: '#F88287',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F84343',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    maxWidth: 335,
  },
  title: {
    color: '#000000',
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 26,
    textAlign: 'center',
  },
  message: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
    textAlign: 'center',
  },
  messageEmphasis: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 32,
  },
  retryButton: {
    borderRadius: 8,
    height: 45,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorButtonLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
  },
  disabledButton: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
