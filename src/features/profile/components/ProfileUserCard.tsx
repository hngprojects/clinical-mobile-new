import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { PROFILE_CARD_BORDER } from '../constants';

interface ProfileUserCardProps {
  displayName: string;
  email: string;
  initials: string;
  avatarUrl?: string | null;
}

export function ProfileUserCard({ displayName, email, initials, avatarUrl }: ProfileUserCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.userCard,
        { backgroundColor: colors.surface, borderColor: PROFILE_CARD_BORDER },
      ]}
      accessible
      accessibilityLabel={`${displayName}, ${email}`}
    >
      <View
        style={[styles.avatar, { backgroundColor: colors.primarySubtle }]}
        accessible={false}
        importantForAccessibility="no"
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Typography variant="body1" color={colors.primary} style={styles.avatarInitials}>
            {initials}
          </Typography>
        )}
      </View>
      <View style={styles.userInfo}>
        <Typography variant="body1" style={styles.userName}>
          {displayName}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          {email}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
  },
  avatarInitials: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
});
