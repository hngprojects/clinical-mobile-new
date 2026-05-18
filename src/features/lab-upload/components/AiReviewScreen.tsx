import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

const processingSteps = [
  'Extracting data from your file...',
  'Interpreting lab values...',
  'Preparing your results...',
];

export function AiReviewScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const id = setInterval(() => {
      setStepIndex((current) => {
        if (current >= processingSteps.length - 1) {
          setIsComplete(true);
          return current;
        }
        return current + 1;
      });
    }, 1200);

    return () => clearInterval(id);
  }, [isComplete]);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.root, { paddingHorizontal: spacing.lg }]}>
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
            AI Review
          </Typography>
        </View>

        {isComplete ? (
          <View style={[styles.resultBody, { gap: spacing.lg }]}>
            <View style={[styles.successHalo, { backgroundColor: colors.primarySubtle }]}>
              <View style={[styles.successInner, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={54} color="#FFFFFF" />
              </View>
            </View>
            <Typography variant="h1" align="center" style={styles.resultTitle}>
              Your AI review is ready
            </Typography>
            <Typography
              variant="body1"
              color={colors.textSecondary}
              align="center"
              style={styles.resultCopy}
            >
              We found 8 markers within range and 2 markers that may need attention.
            </Typography>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/(main)/insights')}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Typography variant="h3" style={styles.primaryButtonText}>
                View Results
              </Typography>
            </Pressable>
          </View>
        ) : (
          <View style={styles.processingBody}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Typography
              variant="h2"
              color={colors.textSecondary}
              align="center"
              style={styles.processingText}
            >
              {processingSteps[stepIndex]}
            </Typography>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontWeight: '500',
  },
  processingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 96,
    gap: 12,
  },
  processingText: {
    fontWeight: '400',
  },
  resultBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 96,
  },
  successHalo: {
    width: 206,
    height: 206,
    borderRadius: 103,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    maxWidth: 340,
  },
  resultCopy: {
    maxWidth: 340,
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
