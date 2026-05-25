import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

interface ToggleRowProps {
  title: string;
  description?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  showDivider?: boolean;
}

function ToggleRow({ title, description, value, onToggle, showDivider = true }: ToggleRowProps) {
  const { colors } = useTheme();

  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Typography variant="body1" style={styles.rowTitle}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color={colors.textSecondary}>
              {description}
            </Typography>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
      {showDivider && <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />}
    </>
  );
}

export function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [aiInsights, setAiInsights] = useState(true);
  const [mobilePush, setMobilePush] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Typography variant="body1" style={styles.headerTitle}>
          Notification
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Page title */}
        <View style={styles.titleBlock}>
          <Typography variant="h2" style={styles.pageTitle}>
            Notification Preferences
          </Typography>
          <Typography variant="body2" color={colors.textSecondary}>
            Choose how you want to be updated about your insights, account activity, and important
            updates.
          </Typography>
        </View>

        {/* Toggles */}
        <View style={styles.toggleList}>
          <ToggleRow
            title="AI Insights"
            description="Get notified when your analysis is ready."
            value={aiInsights}
            onToggle={setAiInsights}
          />
          <ToggleRow
            title="Mobile push notifications"
            value={mobilePush}
            onToggle={setMobilePush}
          />
          <ToggleRow
            title="Email notifications"
            value={emailNotifs}
            onToggle={setEmailNotifs}
            showDivider={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '500' },
  headerSpacer: { width: 32 },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 32,
  },

  titleBlock: { gap: 8 },
  pageTitle: { fontWeight: '700' },

  toggleList: { gap: 0 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    gap: 16,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '500' },

  divider: { height: StyleSheet.hairlineWidth },
});
