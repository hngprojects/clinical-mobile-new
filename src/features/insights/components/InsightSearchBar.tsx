import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/shared/theme';

import {
  INSIGHT_CARD_RADIUS,
  INSIGHT_SEARCH_BACKGROUND,
  INSIGHT_SEARCH_BORDER,
} from '../api/constants';
import type { InsightSearchBarProps } from '../api/types';

const DEFAULT_PLACEHOLDER = 'Search Insights';

const ICON_SIZE = 22;
const ICON_GAP = 8;
const TRAILING_SLOT = 40;

export function InsightSearchBar({
  value,
  onChangeText,
  placeholder = DEFAULT_PLACEHOLDER,
  containerStyle,
  style: textInputStyleFromProps,
  ...inputProps
}: InsightSearchBarProps) {
  const { colors, spacing, typography } = useTheme();

  const leftPad = spacing.md + ICON_SIZE + ICON_GAP;

  const showClear = value.length > 0;
  const rightPad = useMemo(() => {
    let extra = spacing.md;
    if (showClear) extra += TRAILING_SLOT;
    return extra;
  }, [showClear, spacing.md]);

  const clear = () => onChangeText('');

  return (
    <View style={[styles.wrap, containerStyle]} collapsable={false}>
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[
          typography.body1,
          styles.inputField,
          {
            color: colors.text,
            backgroundColor: INSIGHT_SEARCH_BACKGROUND,
            borderColor: INSIGHT_SEARCH_BORDER,
            borderWidth: 1,
            borderRadius: INSIGHT_CARD_RADIUS,
            paddingVertical: spacing.md + 2,
            paddingRight: rightPad,
            paddingLeft: leftPad,
            ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : {}),
          },
          textInputStyleFromProps,
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        underlineColorAndroid="transparent"
        {...inputProps}
      />
      <View
        pointerEvents="none"
        style={[
          styles.iconSlot,
          {
            width: leftPad,
            paddingLeft: spacing.md,
          },
        ]}
      >
        <Ionicons name="search-outline" size={ICON_SIZE} color={colors.text} />
      </View>
      <View style={[styles.trailing, { paddingRight: spacing.sm }]}>
        {showClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={10}
            onPress={clear}
            style={({ pressed }) => [styles.clearHit, pressed && styles.clearPressed]}
          >
            <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
  },
  inputField: {
    width: '100%',
    margin: 0,
    minHeight: 44,
  },
  iconSlot: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  trailing: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    pointerEvents: 'box-none',
  },
  clearHit: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearPressed: {
    opacity: 0.65,
  },
});
