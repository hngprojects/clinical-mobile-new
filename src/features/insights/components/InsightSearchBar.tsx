import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

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

export function InsightSearchBar({
  value,
  onChangeText,
  placeholder = DEFAULT_PLACEHOLDER,
  containerStyle,
  style: textInputStyleFromProps,
  ...inputProps
}: InsightSearchBarProps) {
  const { colors, spacing, typography, isDark } = useTheme();

  const backgroundColor = isDark ? colors.inputBackground : INSIGHT_SEARCH_BACKGROUND;
  const borderColor = isDark ? colors.border : INSIGHT_SEARCH_BORDER;
  const leftPad = spacing.md + ICON_SIZE + ICON_GAP;

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
            backgroundColor,
            borderColor,
            borderWidth: 1,
            borderRadius: INSIGHT_CARD_RADIUS,
            paddingVertical: spacing.md + 2,
            paddingRight: spacing.md,
            paddingLeft: leftPad,
            ...(Platform.OS === 'ios' ? { borderCurve: 'continuous' as const } : {}),
          },
          textInputStyleFromProps,
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
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
});
