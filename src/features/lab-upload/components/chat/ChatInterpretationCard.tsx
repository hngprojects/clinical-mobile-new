import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/shared/components';

import type { AiReviewResult, ValueBreakdown } from '../../api/ai-review.types';

interface ChatInterpretationCardProps {
  review: AiReviewResult;
  onQuestionPress: (question: string) => void;
}

export function ChatInterpretationCard({ review, onQuestionPress }: ChatInterpretationCardProps) {
  const valueBreakdown = review.valueBreakdown ?? [];
  const suggestedQuestions = review.suggestedQuestions ?? [];

  return (
    <View style={styles.interpretationCard}>
      <View style={styles.interpretationHeader}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles-outline" size={16} color="#1565C0" />
        </View>
        <View style={styles.interpretationTitleBlock}>
          <Typography style={styles.interpretationTitle}>
            <Typography style={styles.floTitle}>Flo&apos;s</Typography> Review
          </Typography>
          <Typography style={styles.interpretationSubtitle}>Your lab result is ready</Typography>
        </View>
      </View>

      {review.summary ? <Typography style={styles.summaryText}>{review.summary}</Typography> : null}

      {review.riskLevel || review.confidence ? (
        <View style={styles.metaRow}>
          {review.riskLevel ? <MetaPill label={`Risk: ${review.riskLevel}`} /> : null}
          {review.confidence ? <MetaPill label={`Confidence: ${review.confidence}`} /> : null}
        </View>
      ) : null}

      {valueBreakdown.length > 0 ? (
        <View style={styles.valueList}>
          {valueBreakdown.slice(0, 6).map((item, index) => (
            <ValueRow item={item} key={`${item.metric}-${index}`} />
          ))}
        </View>
      ) : null}

      {suggestedQuestions.length > 0 ? (
        <View style={styles.questionGroup}>
          <Typography style={styles.questionTitle}>Suggested questions</Typography>
          {suggestedQuestions.map((question) => (
            <Pressable
              accessibilityRole="button"
              key={question}
              onPress={() => onQuestionPress(question)}
              style={styles.questionChip}
            >
              <Typography style={styles.questionText}>{question}</Typography>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Typography style={styles.metaText}>{label}</Typography>
    </View>
  );
}

function ValueRow({ item }: { item: ValueBreakdown }) {
  const value = [item.value, item.unit].filter(Boolean).join(' ');

  return (
    <View style={styles.valueRow}>
      <View style={styles.valueCopy}>
        <Typography style={styles.valueMetric}>{item.metric}</Typography>
        {item.status ? <Typography style={styles.valueStatus}>{item.status}</Typography> : null}
      </View>
      <Typography style={styles.valueAmount}>{value}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  aiAvatar: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  floTitle: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  interpretationCard: {
    alignSelf: 'stretch',
    backgroundColor: '#F8FBFF',
    borderColor: '#D7E8FA',
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  interpretationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  interpretationSubtitle: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  interpretationTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  interpretationTitleBlock: {
    flex: 1,
  },
  metaPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E8FA',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  questionChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E8FA',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  questionGroup: {
    gap: 8,
  },
  questionText: {
    color: '#1565C0',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  questionTitle: {
    color: '#494949',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  summaryText: {
    color: '#333333',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  valueAmount: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  valueCopy: {
    flex: 1,
    gap: 2,
  },
  valueList: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7EEF6',
    borderRadius: 10,
    borderWidth: 1,
  },
  valueMetric: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  valueRow: {
    alignItems: 'center',
    borderBottomColor: '#EEF3F8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  valueStatus: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
});
