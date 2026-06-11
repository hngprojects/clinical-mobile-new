import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_TARGET } from '@/shared/accessibility';
import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_DANGER, PROFILE_DIVIDER_INSET } from '../constants';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface ProfileMenuRowProps {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  danger?: boolean;
}

export function ProfileMenuRow({ icon, label, onPress, isLast, danger }: ProfileMenuRowProps) {
  const { colors } = useTheme();
  const iconColor = danger ? PROFILE_DANGER : colors.text;
  const textColor = danger ? PROFILE_DANGER : colors.text;

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { opacity: pressed ? 0.6 : 1, minHeight: MIN_TOUCH_TARGET },
        ]}
        android_ripple={{ color: colors.border }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.rowLeft}>
          <Ionicons name={icon} size={20} color={iconColor} accessible={false} />
          <Typography variant="body1" color={textColor} style={styles.rowLabel}>
            {label}
          </Typography>
        </View>
        <Ionicons name="chevron-forward" size={18} color={iconColor} accessible={false} />
      </Pressable>
      {!isLast && (
        <View
          style={[
            styles.divider,
            { backgroundColor: colors.borderSubtle, marginLeft: PROFILE_DIVIDER_INSET },
          ]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
