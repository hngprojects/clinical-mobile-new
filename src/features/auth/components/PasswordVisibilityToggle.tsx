import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

import { minTouchTargetStyle } from '@/shared/accessibility';

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordVisibilityToggle({ visible, onToggle }: PasswordVisibilityToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={minTouchTargetStyle}
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      accessibilityState={{ selected: visible }}
    >
      <Ionicons
        name={visible ? 'eye-outline' : 'eye-off-outline'}
        size={20}
        color="#1B1B1B"
        accessible={false}
      />
    </Pressable>
  );
}
