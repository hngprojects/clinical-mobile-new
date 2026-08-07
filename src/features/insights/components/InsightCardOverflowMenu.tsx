import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import {
  INSIGHT_CARD_RADIUS,
  INSIGHT_MENU_ESTIMATED_HEIGHT,
  INSIGHT_MENU_WIDTH,
} from '../api/constants';
import type { InsightMenuAnchor } from '../api/types';

interface InsightCardOverflowMenuProps {
  visible: boolean;
  anchor: InsightMenuAnchor | null;
  onClose: () => void;
  onRename?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export function InsightCardOverflowMenu({
  visible,
  anchor,
  onClose,
  onRename,
  onView,
  onDelete,
}: InsightCardOverflowMenuProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const position = useMemo(() => {
    if (!anchor) return null;
    const { width: sw, height: sh } = Dimensions.get('window');
    const margin = 16;
    const gap = 6;
    let top = anchor.y + anchor.height + gap;
    const left = Math.min(
      Math.max(margin, anchor.x + anchor.width - INSIGHT_MENU_WIDTH),
      sw - INSIGHT_MENU_WIDTH - margin,
    );

    if (top + INSIGHT_MENU_ESTIMATED_HEIGHT > sh - insets.bottom - margin) {
      top = anchor.y - INSIGHT_MENU_ESTIMATED_HEIGHT - gap;
    }
    if (top < insets.top + margin) {
      top = insets.top + margin;
    }

    return { top, left };
  }, [anchor, insets.bottom, insets.top]);

  const run = (fn?: () => void) => {
    onClose();
    fn?.();
  };

  if (!visible || !anchor || !position) {
    return null;
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss menu"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          style={[
            styles.menu,
            {
              top: position.top,
              left: position.left,
              width: INSIGHT_MENU_WIDTH,
              backgroundColor: colors.surface,
              borderRadius: INSIGHT_CARD_RADIUS,
            },
          ]}
        >
          <Pressable
            accessibilityRole="menuitem"
            style={({ pressed }) => [
              styles.row,
              { paddingHorizontal: spacing.lg },
              pressed && styles.pressed,
            ]}
            onPress={() => run(onRename)}
          >
            <Typography variant="body1">Rename</Typography>
            <Ionicons name="pencil-outline" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <Pressable
            accessibilityRole="menuitem"
            style={({ pressed }) => [
              styles.row,
              { paddingHorizontal: spacing.lg },
              pressed && styles.pressed,
            ]}
            onPress={() => run(onView)}
          >
            <Typography variant="body1">View</Typography>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.text} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <Pressable
            accessibilityRole="menuitem"
            style={({ pressed }) => [
              styles.row,
              { paddingHorizontal: spacing.lg },
              pressed && styles.pressed,
            ]}
            onPress={() => run(onDelete)}
          >
            <Typography variant="body1" color={colors.error}>
              Delete
            </Typography>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.65,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
});
