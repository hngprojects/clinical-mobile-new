import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';

import { DeleteModal } from '@/features/home/components/DeleteModal';
import { RenameModal } from '@/features/home/components/RenameModal';
import { Typography } from '@/shared/components';
import { ChevronRightIcon } from '@/shared/components/icons/ChevronRightIcon';
import { DeleteIcon } from '@/shared/components/icons/DeleteIcon';
import { RenameIcon } from '@/shared/components/icons/RenameIcon';
import { useTheme } from '@/shared/theme';

import type { InsightItemCardProps } from '../api/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function InsightItemCard({ insight, onRename, onView, onDelete }: InsightItemCardProps) {
  const { colors, spacing } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef<View>(null);

  const openMenu = () => {
    menuButtonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setMenuPos({
        top: pageY + height + 4,
        right: SCREEN_WIDTH - pageX - width,
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
          <View style={styles.textGroup}>
            <Typography variant="body1" style={styles.title}>
              {insight.title}
            </Typography>
            <Typography variant="body2" color={colors.textSecondary}>
              {insight.timestamp}
            </Typography>
          </View>
          <Pressable ref={menuButtonRef} onPress={openMenu} hitSlop={8} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Three-dot dropdown menu */}
      <Modal visible={menuVisible} transparent animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menuCard,
              { top: menuPos.top, right: menuPos.right, backgroundColor: colors.surface },
            ]}
          >
            <Pressable style={styles.menuItem} onPress={handleRename}>
              <Typography variant="body1">Rename</Typography>
              <RenameIcon size={18} color={colors.text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Pressable style={styles.menuItem} onPress={handleView}>
              <Typography variant="body1">View</Typography>
              <ChevronRightIcon size={18} color={colors.text} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Pressable style={styles.menuItem} onPress={handleDelete}>
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
    paddingLeft: 8,
  },
  backdrop: {
    flex: 1,
  },
  menuCard: {
    position: 'absolute',
    minWidth: 180,
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
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
