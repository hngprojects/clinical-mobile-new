import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import type { InsightItemCardProps } from '../api/types';

const INSIGHT_ITEM_CARD_RADIUS = 12;

export function InsightItemCard({
  title,
  subtitle,
  onMenuPress,
  onPress,
  style,
}: InsightItemCardProps) {
  const { colors, spacing } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      borderRadius: INSIGHT_ITEM_CARD_RADIUS,
    },
    style,
  ];

  const content = (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Typography variant="h3" numberOfLines={2} style={styles.title}>
          {title}
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} numberOfLines={1}>
          {subtitle}
        </Typography>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hitSlop={12}
        onPress={() => onMenuPress?.()}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuPressed]}
      >
        <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.text} />
      </Pressable>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.cardPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.92,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontWeight: '700',
  },
  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  menuPressed: {
    opacity: 0.6,
  },
});
