import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Typography } from '@/shared/components';

import type { AiReviewResult, ValueBreakdown } from '../../api/ai-review.types';

interface ChatInterpretationCardProps {
  review: AiReviewResult;
  onQuestionPress: (question: string) => void;
}

type ValueGroup = 'watch' | 'good' | 'other';
type ReviewMetaKind = 'confidence' | 'risk';

const WATCH_STATUS_TERMS = [
  'abnormal',
  'above',
  'attention',
  'below',
  'borderline',
  'critical',
  'elevated',
  'flagged',
  'high',
  'low',
  'out of range',
  'outside',
];
const GOOD_STATUS_TERMS = ['normal', 'ok', 'optimal', 'within'];
const PRESERVED_METRIC_ACRONYMS = new Set([
  'ALT',
  'AST',
  'CRP',
  'ESR',
  'HDL',
  'LDL',
  'MCH',
  'MCHC',
  'MCV',
  'RBC',
  'TSH',
  'WBC',
]);

export function ChatInterpretationCard({ review, onQuestionPress }: ChatInterpretationCardProps) {
  const [showAllGoodValues, setShowAllGoodValues] = useState(false);
  const [showAllContextValues, setShowAllContextValues] = useState(false);
  const [activeMetaInfo, setActiveMetaInfo] = useState<ReviewMetaKind | null>(null);
  const values = getReviewValues(review.valueBreakdown);
  const groups = groupValues(values);
  const questions = getSuggestedQuestions(review, groups.watch).slice(0, 4);
  const counts = getReviewCounts(review, groups);
  const verdict = getVerdict(counts, groups);
  const meta = getReviewMeta(review);

  return (
    <View style={styles.reviewGroup}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Typography style={styles.title}>Flo&apos;s review</Typography>
          </View>
          {meta.length > 0 ? (
            <>
              <View style={styles.metaRow}>
                {meta.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`What ${item.label.toLowerCase()} means`}
                    key={item.kind}
                    onPress={() =>
                      setActiveMetaInfo((current) => (current === item.kind ? null : item.kind))
                    }
                    style={[styles.metaPill, activeMetaInfo === item.kind && styles.metaPillActive]}
                  >
                    <View style={styles.metaLabelRow}>
                      <Typography style={styles.metaLabel}>{item.label}</Typography>
                    </View>
                    <Typography style={styles.metaValue}>{item.value}</Typography>
                  </Pressable>
                ))}
              </View>
              {activeMetaInfo ? (
                <View style={styles.metaInfoPanel}>
                  <Typography style={styles.metaInfoTitle}>
                    {getMetaInfoTitle(activeMetaInfo)}
                  </Typography>
                  <Typography style={styles.metaInfoText}>
                    {getMetaInfoText(activeMetaInfo)}
                  </Typography>
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={styles.takeaway}>
          <Typography style={styles.sectionTitle}>Key takeaway</Typography>
          {review.summary ? (
            <FormattedText style={styles.summary} text={review.summary} />
          ) : (
            <>
              <Typography style={styles.verdictTitle}>{verdict.title}</Typography>
              <Typography style={styles.summary}>{verdict.body}</Typography>
            </>
          )}
        </View>

        {groups.watch.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Typography style={styles.sectionTitle}>Needs attention</Typography>
              <Typography style={styles.sectionCount}>
                {getCountLabel(groups.watch.length)}
              </Typography>
            </View>
            <Typography style={styles.sectionIntro}>
              These were read as outside range or flagged.
            </Typography>
            {groups.watch.map((item, index) => (
              <FindingRow item={item} key={`${getMetricText(item)}-${index}`} />
            ))}
          </View>
        ) : null}

        {groups.good.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Typography style={styles.sectionTitle}>Within range</Typography>
              <Typography style={styles.sectionCount}>
                {getCountLabel(groups.good.length)}
              </Typography>
            </View>
            <Typography style={styles.sectionIntro}>
              These were read as normal or in range.
            </Typography>
            {(showAllGoodValues ? groups.good : groups.good.slice(0, 3)).map((item, index) => (
              <FindingRow item={item} key={`${getMetricText(item)}-${index}`} />
            ))}
            {!showAllGoodValues && groups.good.length > 3 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowAllGoodValues(true)}
                style={styles.inlineAction}
              >
                <Typography style={styles.inlineActionText}>
                  Show {groups.good.length - 3} more
                </Typography>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {groups.other.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Typography style={styles.sectionTitle}>Needs context</Typography>
              <Typography style={styles.sectionCount}>
                {getCountLabel(groups.other.length)}
              </Typography>
            </View>
            <Typography style={styles.sectionIntro}>
              Flo read these, but the status was not clear enough to classify.
            </Typography>
            {(showAllContextValues ? groups.other : groups.other.slice(0, 3)).map((item, index) => (
              <FindingRow item={item} key={`${getMetricText(item)}-${index}`} />
            ))}
            {!showAllContextValues && groups.other.length > 3 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowAllContextValues(true)}
                style={styles.inlineAction}
              >
                <Typography style={styles.inlineActionText}>
                  Show {groups.other.length - 3} more
                </Typography>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {questions.length > 0 ? (
          <View style={styles.questionGroup}>
            <Typography style={styles.questionTitle}>Suggested follow-up questions</Typography>
            {questions.map((question) => (
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
    </View>
  );
}

function FindingRow({ item }: { item: ValueBreakdown }) {
  return (
    <View style={styles.findingRow}>
      <View style={styles.findingTopRow}>
        <View style={styles.metricBlock}>
          <Typography numberOfLines={2} style={styles.metric}>
            {getMetricText(item)}
          </Typography>
        </View>
        <Typography style={styles.amount}>{getValueText(item)}</Typography>
      </View>
    </View>
  );
}

function FormattedText({ style, text }: { style: object; text: string }) {
  return <Typography style={style}>{renderInlineText(cleanMarkdownHeadings(text))}</Typography>;
}

function renderInlineText(text: string) {
  return parseInlineMarkdown(text).map((segment, index) => {
    if (!segment.bold) return segment.text;

    return (
      <Text key={`${segment.text}-${index}`} style={styles.inlineBold}>
        {segment.text}
      </Text>
    );
  });
}

function parseInlineMarkdown(text: string) {
  const segments: { bold: boolean; text: string }[] = [];
  const boldPattern = /(\*\*|__)(.+?)\1/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldPattern.exec(text)) !== null) {
    const plainText = cleanInlineText(text.slice(lastIndex, match.index));
    if (plainText) segments.push({ bold: false, text: plainText });

    const boldText = cleanInlineText(match[2]);
    if (boldText) segments.push({ bold: true, text: boldText });

    lastIndex = match.index + match[0].length;
  }

  const trailingText = cleanInlineText(text.slice(lastIndex));
  if (trailingText) segments.push({ bold: false, text: trailingText });

  return segments.length > 0 ? segments : [{ bold: false, text: cleanInlineText(text) }];
}

function cleanInlineText(text: string) {
  return text
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/\s+#{1,6}\s*$/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

function cleanMarkdownHeadings(text: string) {
  return text
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/\s+#{1,6}\s*$/gm, '')
    .trim();
}

function getReviewValues(values: AiReviewResult['valueBreakdown']) {
  return Array.isArray(values) ? values : [];
}

function groupValues(values: ValueBreakdown[]) {
  return values.reduce(
    (groups, item) => {
      groups[getValueGroup(item)].push(item);
      return groups;
    },
    {
      good: [] as ValueBreakdown[],
      other: [] as ValueBreakdown[],
      watch: [] as ValueBreakdown[],
    },
  );
}

function getValueGroup(item: ValueBreakdown): ValueGroup {
  const status = getStatusText(item).toLowerCase();
  if (!status) return 'other';
  if (WATCH_STATUS_TERMS.some((term) => status.includes(term))) return 'watch';
  if (GOOD_STATUS_TERMS.some((term) => status.includes(term))) return 'good';
  return 'other';
}

function getReviewCounts(review: AiReviewResult, groups: ReturnType<typeof groupValues>) {
  return {
    needingAttention:
      typeof review.markersNeedingAttention === 'number'
        ? review.markersNeedingAttention
        : groups.watch.length,
    withinRange:
      typeof review.markersWithinRange === 'number'
        ? review.markersWithinRange
        : groups.good.length,
  };
}

function getVerdict(
  counts: ReturnType<typeof getReviewCounts>,
  groups: ReturnType<typeof groupValues>,
) {
  if (counts.needingAttention > 0) {
    return {
      title: `${counts.needingAttention} value${
        counts.needingAttention === 1 ? '' : 's'
      } need attention`,
      body: 'These are worth asking about first.',
    };
  }

  if (counts.withinRange > 0 && groups.other.length === 0) {
    return {
      title: 'The values Flo read are within range',
      body: 'No extracted value was marked as outside range in this upload.',
    };
  }

  return {
    title: 'Review ready',
    body: 'Some values may need more context. Ask Flo a question if anything is unclear.',
  };
}

function getReviewMeta(review: AiReviewResult) {
  return [
    review.confidence
      ? { kind: 'confidence' as const, label: 'Confidence', value: capitalize(review.confidence) }
      : null,
    review.riskLevel
      ? { kind: 'risk' as const, label: 'Risk', value: capitalize(review.riskLevel) }
      : null,
  ].filter((item): item is { kind: ReviewMetaKind; label: string; value: string } => Boolean(item));
}

function getMetaInfoTitle(kind: ReviewMetaKind) {
  return kind === 'confidence' ? 'About confidence' : 'About risk';
}

function getMetaInfoText(kind: ReviewMetaKind) {
  if (kind === 'confidence') {
    return 'How clearly Flo could read and interpret this upload.';
  }

  return 'How much attention the extracted values may need. This is not a diagnosis.';
}

function getCountLabel(count: number) {
  return `${count} value${count === 1 ? '' : 's'}`;
}

function getSuggestedQuestions(review: AiReviewResult, watchValues: ValueBreakdown[]) {
  const fallbackQuestions =
    watchValues.length > 0
      ? [
          `What does ${getMetricText(watchValues[0])} mean for me?`,
          'Which result needs the most attention?',
          'What should I ask a clinician about this?',
        ]
      : [
          'Which results look reassuring?',
          'Is there anything I should keep monitoring?',
          'What should I compare with my next test?',
        ];

  const backendQuestions = Array.isArray(review.suggestedQuestions)
    ? review.suggestedQuestions
        .filter((question): question is string => typeof question === 'string')
        .map(normalizeQuestionText)
        .filter(Boolean)
    : [];

  const questions =
    backendQuestions.length >= 2
      ? backendQuestions
      : [...backendQuestions, ...fallbackQuestions.slice(0, 2 - backendQuestions.length)];

  return questions
    .map(normalizeQuestionText)
    .filter((question, index, questions) => question && questions.indexOf(question) === index);
}

function getMetricText(item: ValueBreakdown) {
  return typeof item.metric === 'string' && item.metric.trim()
    ? formatMetricLabel(item.metric)
    : 'This value';
}

function getStatusText(item: ValueBreakdown) {
  if (typeof item.status !== 'string') return '';

  return formatResultLabel(item.status);
}

function getValueText(item: ValueBreakdown) {
  if (isMissingValue(item.value)) return 'Missing value';

  const value = formatValueLabel(item.value);
  const unit = typeof item.unit === 'string' ? item.unit : '';
  return [value, unit].filter(Boolean).join(' ');
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatResultLabel(value: string) {
  const normalized = value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

  return normalized ? capitalize(normalized) : '';
}

function formatValueLabel(value: ValueBreakdown['value']) {
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return 'Missing value';

  const normalized = value.trim();
  if (!normalized || isMissingValue(normalized)) return 'Missing value';

  return normalized;
}

function isMissingValue(value: ValueBreakdown['value']) {
  if (typeof value !== 'string') return value === null || value === undefined;

  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === 'none' ||
    normalized === 'null' ||
    normalized === 'n/a' ||
    normalized === 'not reported' ||
    normalized === 'not extracted'
  );
}

function formatMetricLabel(value: string) {
  const normalized = value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  return normalized
    .split(' ')
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (PRESERVED_METRIC_ACRONYMS.has(upperWord)) return upperWord;
      if (/^[A-Z0-9]+$/.test(word) && word.length <= 4) return upperWord;
      if (/[a-z]/.test(word) && /[A-Z]/.test(word)) return word;

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function normalizeQuestionText(value: string) {
  const text = cleanMarkdownHeadings(value)
    .replace(/^[-*\d.)\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';

  return text.endsWith('?') ? text : `${text}?`;
}

const styles = StyleSheet.create({
  amount: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 96,
    textAlign: 'right',
  },
  card: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
  },
  findingRow: {
    backgroundColor: '#FAFAFA',
    borderColor: '#ECEFF3',
    borderRadius: 8,
    borderWidth: 1,
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  findingTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  header: {
    gap: 9,
  },
  inlineAction: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  inlineActionText: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 17,
  },
  inlineBold: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  metaLabel: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 15,
  },
  metaLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'space-between',
  },
  metaInfoPanel: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  metaInfoText: {
    color: '#4B5563',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  metaInfoTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 17,
  },
  metaPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  metaPillActive: {
    borderColor: '#C9D7E8',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaValue: {
    color: '#1B1B1B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  metric: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  metricBlock: {
    flex: 1,
    gap: 5,
  },
  questionChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
    color: '#374151',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  reviewGroup: {
    alignSelf: 'flex-start',
    gap: 5,
    maxWidth: '88%',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sectionCount: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionIntro: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  summary: {
    color: '#333333',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  takeaway: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECEFF3',
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  title: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  titleRow: {
    gap: 2,
  },
  verdictTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 21,
  },
});
