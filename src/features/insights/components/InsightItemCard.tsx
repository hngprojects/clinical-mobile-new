import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { INSIGHT_CARD_RADIUS } from '../api/constants';
import type { InsightItemCardProps, InsightMenuAnchor } from '../api/types';

import { InsightCardOverflowMenu } from './InsightCardOverflowMenu';

export function InsightItemCard({
  title,
  subtitle,
  onPress,
  style,
  onRename,
  onView,
  onDelete,
}: InsightItemCardProps) {
  const { colors, spacing } = useTheme();
  const anchorRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchor, setAnchor] = useState<InsightMenuAnchor | null>(null);

  const openMenu = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setAnchor(null);
  }, []);

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: spacing.lg,
      borderRadius: INSIGHT_CARD_RADIUS,
    },
    style,
  ];

  const menuTrigger = (
    <View ref={anchorRef} collapsable={false} style={styles.menuAnchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hitSlop={12}
        onPress={openMenu}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuPressed]}
      >
        <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
      </Pressable>
    </View>
  );

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
      {menuTrigger}
    </View>
  );

  const menu = (
    <InsightCardOverflowMenu
      visible={menuOpen}
      anchor={anchor}
      onClose={closeMenu}
      onRename={onRename}
      onView={onView}
      onDelete={onDelete}
    />
  );

  if (onPress) {
    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [cardStyle, pressed && styles.cardPressed]}
        >
          {content}
        </Pressable>
        {menu}
      </>
    );
  }

  return (
    <>
      <View style={cardStyle}>{content}</View>
      {menu}
    </>
  );
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
  menuAnchor: {
    flexShrink: 0,
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
