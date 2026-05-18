import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

export function UploadPreviewScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { name, size } = useLocalSearchParams<{ name: string; size: string }>();

  const fileName = name || 'Blood_test_report.jpg';
  const fileSize = size || '0.8MB';
  const fileType = fileName.split('.').pop()?.toUpperCase() || 'JPG';

  return (
    <Screen scrollable padding edges={['top', 'bottom']}>
      <View style={[styles.root, { gap: spacing.xl }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={34} color="#111827" />
          </Pressable>
          <Typography variant="h2" color={colors.textSecondary} style={styles.headerTitle}>
            Preview Upload
          </Typography>
        </View>

        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.surfaceMuted,
              padding: spacing.lg,
            },
          ]}
        >
          <Typography variant="h2" style={styles.fileName}>
            {fileName}
          </Typography>
          <Typography variant="h2" color={colors.textSecondary} style={styles.fileMeta}>
            {fileType} • {fileSize}
          </Typography>

          <View style={[styles.reportFrame, { backgroundColor: '#E5E5E5' }]}>
            <View style={styles.reportPaper}>
              <Typography variant="h3" color="#0F2A4A" align="center" style={styles.reportLogo}>
                GLOBAL PATHOLOGY LABS
              </Typography>
              <Typography variant="label" color="#0F2A4A" align="center">
                Comprehensive Metabolic Panel & Complete Blood Count
              </Typography>

              <View style={styles.reportMeta}>
                <Typography variant="label" color="#0F2A4A">
                  Patient ID: JANE DOE
                </Typography>
                <Typography variant="label" color="#0F2A4A">
                  Report Date: 2023-10-27
                </Typography>
              </View>

              <View style={styles.reportColumns}>
                <ReportColumn
                  title="Metabolic Panel"
                  rows={['Glucose 95 mg/DL', 'BUN 18 mg/DL', 'Creatinine 0.9 mg/DL', 'Sodium 141']}
                />
                <ReportColumn
                  title="Blood Count"
                  rows={['WBC 7.7', 'RBC 4.8', 'Hemoglobin 14', 'Platelets 250']}
                />
              </View>

              <View style={styles.watermark}>
                <Typography
                  variant="h1"
                  color="rgba(17, 24, 39, 0.22)"
                  style={styles.watermarkText}
                >
                  SAMPLE DOCUMENT
                </Typography>
              </View>
            </View>
          </View>
        </View>

        <View style={{ gap: spacing.md }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get AI Review"
            onPress={() => router.push('/(main)/ai-review')}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Typography variant="h3" style={styles.primaryButtonText}>
              Get AI Review
            </Typography>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Upload another"
            onPress={() => router.replace('/(main)')}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons name="cloud-upload-outline" size={28} color={colors.textSecondary} />
            <Typography variant="h3" color={colors.textSecondary}>
              Upload Another
            </Typography>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function ReportColumn({ title, rows }: { title: string; rows: string[] }) {
  return (
    <View style={styles.reportColumn}>
      <Typography variant="label" color="#0F2A4A" style={styles.reportColumnTitle}>
        {title}
      </Typography>
      {rows.map((row) => (
        <View key={row} style={styles.reportRow}>
          <Typography variant="label" color="#0F2A4A">
            {row}
          </Typography>
          <Ionicons name="checkmark" size={12} color="#16A34A" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontWeight: '500',
  },
  previewCard: {
    borderRadius: 28,
    gap: 14,
  },
  fileName: {
    fontWeight: '500',
  },
  fileMeta: {
    fontWeight: '500',
  },
  reportFrame: {
    borderRadius: 22,
    padding: 34,
    aspectRatio: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reportPaper: {
    width: '86%',
    aspectRatio: 0.72,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    transform: [{ rotate: '-1.5deg' }],
  },
  reportLogo: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  reportMeta: {
    marginTop: 16,
    gap: 2,
  },
  reportColumns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  reportColumn: {
    flex: 1,
    gap: 5,
  },
  reportColumnTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  watermark: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-33deg' }],
  },
  watermarkText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  secondaryButton: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
