import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';

interface ChatStateMessageProps {
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function ChatStateMessage({ message, actionLabel, onAction }: ChatStateMessageProps) {
  return (
    <View style={styles.stateCard}>
      <Typography style={styles.stateText}>{message}</Typography>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.stateAction}>
          <Typography style={styles.stateActionText}>{actionLabel}</Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateAction: {
    borderColor: '#1565C0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  stateActionText: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  stateCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  stateText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
