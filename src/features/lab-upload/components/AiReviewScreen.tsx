import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { Screen, Typography } from '@/shared/components';
import { useTheme } from '@/shared/theme';

import { useAiReview } from '../hooks/useAiReview';
import { FlowErrorScreen } from './FlowErrorScreen';

const STEPS = [
  'Extracting lab values from your file',
  'Checking reference ranges',
  'Generating your interpretation',
  'Preparing your report',
];

const STEP_INTERVAL_MS = 3500;

type StepState = 'pending' | 'active' | 'done';

function StepRow({
  label,
  state,
  index,
}: {
  label: string;
  state: StepState;
  index: number;
}) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (state === 'pending') return;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, state]);

  useEffect(() => {
    if (state === 'active') {
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.current.start();
    } else {
      spinLoop.current?.stop();
      spinAnim.setValue(0);
    }
    return () => spinLoop.current?.stop();
  }, [spinAnim, state]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const iconColor = state === 'done' ? colors.primary : state === 'active' ? colors.primary : colors.border;

  return (
    <Animated.View
      style={[
        styles.stepRow,
        { opacity: state === 'pending' ? 0 : fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: state === 'done' ? colors.primarySubtle : 'transparent',
            borderColor: iconColor,
            borderWidth: state === 'done' ? 0 : 1.5,
          },
        ]}
      >
        {state === 'done' ? (
          <Ionicons name="checkmark" size={14} color={colors.primary} />
        ) : state === 'active' ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="reload-outline" size={14} color={colors.primary} />
          </Animated.View>
        ) : null}
      </View>

      <Typography
        variant="body2"
        color={state === 'done' ? colors.text : state === 'active' ? colors.text : colors.textSecondary}
        style={state === 'active' ? styles.activeLabel : undefined}
      >
        {label}
      </Typography>
    </Animated.View>
  );
}

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
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    setStepIndex(0);
    setHasShownAllSteps(false);
    setRunKey((k) => k + 1);
  }, [caseId]);

  const reviewQuery = useAiReview(caseId || '', guestSessionId);
  const review = reviewQuery.data;
  const isComplete = review?.status === 'complete' && hasShownAllSteps;

  const missingCaseErrorType = !caseId ? 'system' : undefined;
  const configuredErrorType =
    errorType === 'network' || errorType === 'system' ? errorType : undefined;
  const processingErrorType = review?.status === 'failed' ? 'processing' : undefined;
  const queryErrorType = reviewQuery.isError ? 'network' : undefined;
  const visibleErrorType = hasShownAllSteps
    ? missingCaseErrorType || configuredErrorType || processingErrorType || queryErrorType
    : undefined;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (stepIndex + 1) / STEPS.length,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, stepIndex]);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((current) => {
        if (current >= STEPS.length - 1) {
          setHasShownAllSteps(true);
          return current;
        }
        return current + 1;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  const handleBackToPreview = () => {
    router.replace({
      pathname: '/(main)/preview-upload',
      params: { guestSessionId, name, size, uri, mimeType },
    });
  };

  const handleRetry = () => {
    setStepIndex(0);
    setHasShownAllSteps(false);
    setRunKey((k) => k + 1);

    if (processingErrorType) {
      handleBackToPreview();
      return;
    }

    if (queryErrorType) {
      reviewQuery.refetch();
      return;
    }

    if (configuredErrorType) {
      router.replace({
        pathname: '/(main)/ai-review',
        params: { caseId, guestSessionId, name, size, uri, mimeType },
      });
    }
  };

  useEffect(() => {
    if (isComplete) {
      router.replace({
        pathname: '/(main)/chat-review',
        params: { caseId, guestSessionId, name, size, uri, mimeType },
      });
    }
  }, [caseId, guestSessionId, isComplete, mimeType, name, router, size, uri]);

  if (visibleErrorType) {
    const isNetworkError = visibleErrorType === 'network';
    const isProcessingError = visibleErrorType === 'processing';

    return (
      <FlowErrorScreen
        title={
          isNetworkError
            ? 'There was an issue processing your file'
            : isProcessingError
              ? 'We could not read your lab result'
              : 'Something went wrong.'
        }
        message={
          isNetworkError
            ? "We couldn't connect to the server.\nPlease check your internet connection and try again."
            : isProcessingError
              ? 'Your file was uploaded, but the lab values could not be extracted.\nPlease check that the file is a lab result, then try a clearer image or upload a PDF.'
              : 'The system encountered an issue.\nPlease try again later.'
        }
        icon={isNetworkError ? 'network' : 'warning'}
        onClose={handleBackToPreview}
        onRetry={handleRetry}
      />
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderSubtle }]}>
            <View style={styles.cardHeader}>
              <Typography variant="body1" style={styles.cardTitle}>
                Analysing your results
              </Typography>
              <Typography variant="label" color={colors.textSecondary}>
                {stepIndex + 1} of {STEPS.length}
              </Typography>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.primarySubtle }]}>
              <Animated.View
                style={[styles.progressFill, { backgroundColor: colors.primary, width: progressWidth }]}
              />
            </View>

            <View style={styles.stepList}>
              {STEPS.map((label, i) => {
                const state: StepState =
                  i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending';
                return <StepRow key={`${runKey}-${label}`} label={label} state={state} index={i} />;
              })}
            </View>
          </View>

          <Typography variant="body2" color={colors.textSecondary} style={styles.hint}>
            This usually takes less than a minute
          </Typography>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 20,
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
  headerSpacer: {
    width: 24,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  stepList: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  hint: {
    textAlign: 'center',
  },
});
