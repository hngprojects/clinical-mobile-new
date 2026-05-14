import React from 'react';
import { ScrollView, StyleSheet, StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: Edge[];
  padding?: boolean;
  /** Merged into `ScrollView` `contentContainerStyle` when `scrollable` is true. */
  scrollContentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scrollable = false,
  edges = ['top', 'bottom'],
  padding = true,
  scrollContentContainerStyle,
  style,
  ...props
}: ScreenProps) {
  const { colors, spacing } = useTheme();

  const inner = scrollable ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[padding && { padding: spacing.md }, scrollContentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, padding && { padding: spacing.md }, style]} {...props}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.background }]} edges={edges}>
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
