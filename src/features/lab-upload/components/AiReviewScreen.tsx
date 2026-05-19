import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { FlowErrorScreen } from './FlowErrorScreen';
import { useAiReview } from '../hooks/useAiReview';

const processingSteps = [
  'Extracting data from your file...',
  'Interpreting lab values...',
  'Preparing your results...',
];

export function AiReviewScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { caseId, guestSessionId, name, size, uri, mimeType, errorType } = useLocalSearchParams<{
    caseId?: string;
    guestSessionId?: string;
    name?: string;
    size?: string;
    uri?: string;
    mimeType?: string;
    errorType?: string;
  }>();
  const [stepIndex, setStepIndex] = useState(0);
  const [hasShownAllSteps, setHasShownAllSteps] = useState(false);
  const reviewQuery = useAiReview(caseId || '', guestSessionId);
  const review = reviewQuery.data;
  const isComplete = review?.status === 'complete' && hasShownAllSteps;
  const configuredErrorType =
    errorType === 'network' || errorType === 'system' ? errorType : undefined;
  const failedErrorType = review?.status === 'failed' ? 'system' : undefined;
  const queryErrorType = reviewQuery.isError ? 'network' : undefined;
  const visibleErrorType = hasShownAllSteps
    ? configuredErrorType || failedErrorType || queryErrorType
    : undefined;

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((current) => {
        if (current >= processingSteps.length - 1) {
          setHasShownAllSteps(true);
          return 0;
        }

        return current + 1;
      });
    }, 1200);

    return () => clearInterval(id);
  }, []);

  const handleBackToPreview = () => {
    router.replace({
      pathname: '/(main)/preview-upload',
      params: { name, size, uri, mimeType },
    });
  };

  const handleRetry = () => {
    setStepIndex(0);
    setHasShownAllSteps(false);

    if (configuredErrorType) {
      router.replace({
        pathname: '/(main)/ai-review',
        params: {
          caseId,
          guestSessionId,
          name,
          size,
          uri,
          mimeType,
        },
      });
      return;
    }

    reviewQuery.refetch();
  };

  useEffect(() => {
    if (isComplete) {
      router.replace('/(main)/chat-review');
    }
  }, [isComplete, router]);

  if (visibleErrorType) {
    const isNetworkError = visibleErrorType === 'network';

    return (
      <FlowErrorScreen
        title={isNetworkError ? 'There was an issue processing your file' : 'Something went wrong.'}
        message={
          isNetworkError
            ? "We couldn't connect to the server.\nPlease check your internet connection and try again."
            : 'The system encountered an issue.\nPlease try again later.'
        }
        icon={isNetworkError ? 'network' : 'warning'}
        onClose={handleBackToPreview}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.root, { paddingHorizontal: spacing.lg }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBackToPreview}
            hitSlop={12}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Typography variant="h2" color={colors.textSecondary} style={styles.headerTitle}>
            AI Review
          </Typography>
        </View>

        <View style={styles.processingBody}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Typography variant="h2" align="center" style={styles.processingText}>
            {processingSteps[stepIndex]}
          </Typography>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 4,
  },
  header: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  backButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  processingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 96,
    gap: 12,
  },
  processingText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
