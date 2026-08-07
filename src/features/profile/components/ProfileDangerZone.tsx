import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/shared/accessibility';
import { Typography } from '@/shared/components';

import { PROFILE_DANGER, PROFILE_DANGER_BG } from '../constants';

interface ProfileDangerZoneProps {
  onDeleteAccount: () => void;
}

export function ProfileDangerZone({ onDeleteAccount }: ProfileDangerZoneProps) {
  return (
    <View style={styles.section}>
      <Typography
        variant="label"
        color={PROFILE_DANGER}
        style={styles.sectionLabel}
        accessibilityRole="header"
      >
        DANGER ZONE
      </Typography>
      <Pressable
        onPress={onDeleteAccount}
        style={({ pressed }) => [
          styles.deleteButton,
          { backgroundColor: PROFILE_DANGER_BG, opacity: pressed ? 0.7 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Delete account"
      >
        <Ionicons name="trash-outline" size={20} color={PROFILE_DANGER} accessible={false} />
        <Typography variant="body1" color={PROFILE_DANGER} style={styles.deleteLabel}>
          Delete Account
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 12,
    minHeight: MIN_TOUCH_TARGET,
  },
  deleteLabel: {
    fontWeight: '500',
  },
});
