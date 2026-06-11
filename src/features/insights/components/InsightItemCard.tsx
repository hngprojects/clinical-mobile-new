import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { DeleteModal } from '@/features/home/components/DeleteModal';
import { RenameModal } from '@/features/home/components/RenameModal';
import {
  a11yRoles,
  expandHitSlop,
  MIN_TOUCH_TARGET,
  minTouchTargetStyle,
} from '@/shared/accessibility';
import { Typography } from '@/shared/components';
import { ChevronRightIcon } from '@/shared/components/icons/ChevronRightIcon';
import { DeleteIcon } from '@/shared/components/icons/DeleteIcon';
import { RenameIcon } from '@/shared/components/icons/RenameIcon';
import { useTheme } from '@/shared/theme';

import type { InsightItemCardProps } from '../api/types';

const MENU_GAP = 4;
const MENU_ITEM_HEIGHT = 52;
const MENU_MARGIN = 16;
const MENU_WIDTH = 180;

function getInsightAccessibilityLabel(title: string, timestamp: string) {
  return `Lab insight: ${title}. Created ${timestamp}. Double tap to open result details.`;
}

export function InsightItemCard({
  insight,
  onPress,
  onRename,
  onView,
  onDelete,
  onExportPdf,
}: InsightItemCardProps) {
  const { colors, spacing } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef<View>(null);

  const openMenu = (event: GestureResponderEvent) => {
    event.stopPropagation();
    menuButtonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
      const itemCount = onExportPdf ? 4 : 3;
      const menuHeight = itemCount * MENU_ITEM_HEIGHT + (itemCount - 1) * StyleSheet.hairlineWidth;
      const belowTop = pageY + height + MENU_GAP;
      const aboveTop = pageY - menuHeight - MENU_GAP;
      const top =
        belowTop + menuHeight <= screenHeight - MENU_MARGIN
          ? belowTop
          : Math.max(MENU_MARGIN, aboveTop);
      const buttonRight = screenWidth - pageX - width;

      setMenuPos({
        top,
        right: Math.min(Math.max(MENU_MARGIN, buttonRight), screenWidth - MENU_WIDTH - MENU_MARGIN),
      });
      setMenuVisible(true);
    });
  };

  const closeMenu = () => setMenuVisible(false);

  const handleRename = () => {
    closeMenu();
    setRenameVisible(true);
  };

  const handleView = () => {
    closeMenu();
    onView?.(insight.id);
  };

  const handleDelete = () => {
    closeMenu();
    setDeleteVisible(true);
  };

  const handleExportPdf = () => {
    closeMenu();
    onExportPdf?.(insight.id);
  };

  const handleDeleteConfirm = () => {
    setDeleteVisible(false);
    onDelete?.(insight.id);
  };

  const handleRenameConfirm = (newTitle: string) => {
    setRenameVisible(false);
    onRename?.(insight.id, newTitle);
  };

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            padding: spacing.md,
          },
        ]}
      >
        <View style={styles.row}>
          <Pressable
            accessibilityRole={onPress ? a11yRoles.button : undefined}
            accessibilityLabel={
              onPress ? getInsightAccessibilityLabel(insight.title, insight.timestamp) : undefined
            }
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.cardBody, { opacity: onPress && pressed ? 0.92 : 1 }]}
          >
            <View style={styles.textGroup}>
              <Typography variant="body1" style={styles.title}>
                {insight.title}
              </Typography>
              <Typography variant="body2" color={colors.textSecondary}>
                {insight.timestamp}
              </Typography>
            </View>
          </Pressable>
          <Pressable
            ref={menuButtonRef}
            accessibilityRole={a11yRoles.button}
            accessibilityLabel={`Options for lab insight ${insight.title}`}
            accessibilityHint={
              onExportPdf
                ? 'Opens rename, view, export, and delete actions.'
                : 'Opens rename, view, and delete actions.'
            }
            onPress={openMenu}
            hitSlop={expandHitSlop(18)}
            style={[styles.menuButton, minTouchTargetStyle]}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={colors.textSecondary}
              accessible={false}
            />
          </Pressable>
        </View>
      </View>

      {/* Three-dot dropdown menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        accessibilityViewIsModal
        onRequestClose={closeMenu}
      >
        <Pressable
          style={styles.backdrop}
          onPress={closeMenu}
          accessibilityRole={a11yRoles.button}
          accessibilityLabel="Close insight actions menu"
        >
          <Pressable
            accessibilityViewIsModal
            style={[
              styles.menuCard,
              { top: menuPos.top, right: menuPos.right, backgroundColor: colors.surface },
            ]}
            accessibilityRole="menu"
          >
            <Pressable
              style={styles.menuItem}
              onPress={handleRename}
              accessibilityRole={a11yRoles.menuitem}
              accessibilityLabel={`Rename ${insight.title}`}
            >
              <Typography variant="body1">Rename</Typography>
              <RenameIcon size={18} color={colors.text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Pressable
              style={styles.menuItem}
              onPress={handleView}
              accessibilityRole={a11yRoles.menuitem}
              accessibilityLabel={`View ${insight.title} details`}
            >
              <Typography variant="body1">View</Typography>
              <ChevronRightIcon size={18} color={colors.text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {onExportPdf ? (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={handleExportPdf}
                  accessibilityRole={a11yRoles.menuitem}
                  accessibilityLabel={`Export ${insight.title} as PDF`}
                >
                  <Typography variant="body1">Export as PDF</Typography>
                  <Ionicons name="document-text-outline" size={18} color={colors.text} />
                </Pressable>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </>
            ) : null}

            <Pressable
              style={styles.menuItem}
              onPress={handleDelete}
              accessibilityRole={a11yRoles.menuitem}
              accessibilityLabel={`Delete ${insight.title}`}
              accessibilityHint="Destructive action"
            >
              <Typography variant="body1" color="#EF4444">
                Delete
              </Typography>
              <DeleteIcon size={18} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rename modal */}
      <RenameModal
        visible={renameVisible}
        currentTitle={insight.title}
        onCancel={() => setRenameVisible(false)}
        onConfirm={handleRenameConfirm}
      />

      {/* Delete confirmation modal */}
      <DeleteModal
        visible={deleteVisible}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '500',
  },
  menuButton: {
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
  },
  menuCard: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: MIN_TOUCH_TARGET,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
