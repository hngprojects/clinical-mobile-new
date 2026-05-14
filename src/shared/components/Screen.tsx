import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: Edge[];
  padding?: boolean;
  keyboardAvoiding?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  edges = ['top', 'bottom'],
  padding = false,
  style,
  keyboardAvoiding = false,
  ...props
}: ScreenProps) {
  const { colors, spacing } = useTheme();

  const inner = scrollable ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[padding && { padding: spacing.md }]}
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
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
