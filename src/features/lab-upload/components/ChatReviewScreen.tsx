import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, Typography } from '@/shared/components';

import type { AiReviewResult, ValueBreakdown } from '../api/ai-review.types';
import type { ChatMessage } from '../api/chat.types';
import { useAiReview } from '../hooks/useAiReview';
import { useCaseChat, useSendChatMessage } from '../hooks/useCaseChat';

type TimelineItem =
  | {
      id: string;
      index: number;
      timestamp: number;
      type: 'interpretation';
      review: AiReviewResult;
    }
  | {
      id: string;
      index: number;
      timestamp: number;
      type: 'message';
      message: ChatMessage;
    };

export function ChatReviewScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const { caseId, guestSessionId, mock } = useLocalSearchParams<{
    caseId?: string;
    guestSessionId?: string;
    mock?: string;
  }>();
  const [draft, setDraft] = useState('');
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const isMockChat = typeof __DEV__ !== 'undefined' && __DEV__ && mock === 'chat';
  const reviewQuery = useAiReview(caseId || '', guestSessionId);
  const chatQuery = useCaseChat(caseId || '', guestSessionId);
  const sendMessage = useSendChatMessage(caseId || '', guestSessionId);
  const review = isMockChat ? MOCK_REVIEW : reviewQuery.data;
  const messages = isMockChat ? mockMessages : (chatQuery.data ?? []);
  const trimmedDraft = draft.trim();
  const canSend = Boolean((caseId || isMockChat) && trimmedDraft && !sendMessage.isPending);
  const hasInterpretation = Boolean(
    review?.status === 'complete' &&
    (review.summary || review.valueBreakdown?.length || review.suggestedQuestions?.length),
  );
  const timelineItems = useMemo(
    () => buildTimeline(messages, hasInterpretation ? review : undefined),
    [hasInterpretation, messages, review],
  );
  const isInitialLoading = !isMockChat && (chatQuery.isLoading || reviewQuery.isLoading);
  const isInitialError = !isMockChat && (chatQuery.isError || reviewQuery.isError);

  useEffect(() => {
    if (timelineItems.length > 0) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [timelineItems.length]);

  const handleSend = async () => {
    if (!canSend) return;

    const message = trimmedDraft;
    setDraft('');

    if (isMockChat) {
      setMockMessages((current) => [
        ...current,
        createMockMessage({
          id: `mock-patient-${current.length + 1}`,
          senderType: 'patient',
          text: message,
        }),
        createMockMessage({
          id: `mock-ai-${current.length + 2}`,
          senderType: 'ai',
          text: 'That is a good follow-up. In the real chat, Chris would respond using the uploaded lab context.',
        }),
      ]);
      return;
    }

    try {
      await sendMessage.mutateAsync(message);
      chatQuery.refetch();
    } catch {
      setDraft(message);
    }
  };

  return (
    <Screen edges={['top']} backgroundColor="#FFFFFF" style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>
        <Typography style={styles.headerTitle}>Review Chat</Typography>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.body}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onTouchStart={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          {!caseId && !isMockChat ? (
            <StateMessage message="We could not find the case for this chat." />
          ) : isInitialLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#1565C0" size="small" />
              <Typography style={styles.stateText}>Loading chat...</Typography>
            </View>
          ) : isInitialError ? (
            <StateMessage
              message="We could not load your AI review. Please check your connection and try again."
              actionLabel="Retry"
              onAction={() => {
                reviewQuery.refetch();
                chatQuery.refetch();
              }}
            />
          ) : timelineItems.length === 0 ? (
            <StateMessage message="Ask a question about your AI review to start the chat." />
          ) : (
            <>
              {timelineItems.map((item) =>
                item.type === 'interpretation' ? (
                  <InterpretationCard
                    key={item.id}
                    review={item.review}
                    onQuestionPress={setDraft}
                  />
                ) : (
                  <ChatBubble key={item.id} message={item.message} />
                ),
              )}
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {sendMessage.isError ? (
            <Typography style={styles.sendError}>Message failed. Please try again.</Typography>
          ) : null}
          <View style={styles.composerRow}>
            <View style={styles.inputPill}>
              <Ionicons name="arrow-up-circle-outline" size={24} color="#767676" />
              <View style={styles.inputWrap}>
                {!draft ? (
                  <Typography pointerEvents="none" style={styles.customPlaceholder}>
                    Ask about results
                  </Typography>
                ) : null}
                <TextInput
                  onChangeText={setDraft}
                  onSubmitEditing={handleSend}
                  placeholder=""
                  returnKeyType="send"
                  style={styles.input}
                  value={draft}
                />
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Record voice"
              disabled
              style={[styles.iconButton, styles.disabledButton]}
            >
              <Ionicons name="mic-outline" size={28} color="#767676" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={!canSend}
              onPress={handleSend}
              style={[styles.sendButton, canSend && styles.sendButtonActive]}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons
                  name="paper-plane-outline"
                  size={26}
                  color={canSend ? '#FFFFFF' : '#767676'}
                />
              )}
            </Pressable>
          </View>
          <Typography style={styles.disclaimer}>
            Clinsight provides AI-powered explanations, not medical diagnoses.
          </Typography>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function buildTimeline(messages: ChatMessage[], review?: AiReviewResult): TimelineItem[] {
  const items: TimelineItem[] = messages.map((message, index) => ({
    id: `message-${message.id}`,
    index,
    message,
    timestamp: getTimestamp(message.sentAt),
    type: 'message',
  }));

  if (review?.status === 'complete') {
    items.push({
      id: `interpretation-${review.id ?? review.generatedAt ?? 'latest'}`,
      index: messages.length,
      review,
      timestamp: getTimestamp(review.generatedAt),
      type: 'interpretation',
    });
  }

  return items.sort((a, b) => a.timestamp - b.timestamp || a.index - b.index);
}

function getTimestamp(value?: string) {
  if (!value) return 0;

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function createMockMessage({
  id,
  senderType,
  text,
}: {
  id: string;
  senderType: ChatMessage['senderType'];
  text: string;
}): ChatMessage {
  return {
    id,
    senderType,
    content: { message: text },
    text,
    medicalCaseId: 'mock-case',
    userId: senderType === 'patient' ? 'mock-user' : null,
    sentAt: new Date().toISOString(),
  };
}

const MOCK_REVIEW: AiReviewResult = {
  id: 'mock-interpretation',
  medicalCaseId: 'mock-case',
  status: 'complete',
  generatedAt: '2026-05-20T09:05:00.000Z',
  summary:
    'Your HbA1c result is higher than the usual reference range, which can mean your average blood sugar has been elevated over the last few months. This is worth discussing with a clinician so they can interpret it alongside your history, symptoms, and any other tests.',
  riskLevel: 'moderate',
  confidence: 'high',
  valueBreakdown: [
    { metric: 'HbA1c', value: '15.5', unit: '%', status: 'high' },
    { metric: 'Fasting glucose', value: '7.8', unit: 'mmol/L', status: 'high' },
    { metric: 'Total cholesterol', value: '4.6', unit: 'mmol/L', status: 'normal' },
  ],
  suggestedQuestions: [
    'What does HbA1c mean?',
    'What should I ask my doctor?',
    'Which results need attention first?',
  ],
};

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'mock-chat-1',
    senderType: 'patient',
    content: { message: 'Can you explain this in simple terms?' },
    text: 'Can you explain this in simple terms?',
    medicalCaseId: 'mock-case',
    userId: 'mock-user',
    sentAt: '2026-05-20T09:06:00.000Z',
  },
  {
    id: 'mock-chat-2',
    senderType: 'ai',
    content: {
      message:
        'In simple terms, this result suggests your blood sugar may have been running high over time. It does not replace a diagnosis, but it is important enough to follow up.',
    },
    text: 'In simple terms, this result suggests your blood sugar may have been running high over time. It does not replace a diagnosis, but it is important enough to follow up.',
    medicalCaseId: 'mock-case',
    userId: null,
    sentAt: '2026-05-20T09:07:00.000Z',
  },
];

function StateMessage({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.stateCard}>
      <Typography style={styles.stateText}>{message}</Typography>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.stateAction}>
          <Typography style={styles.stateActionText}>{actionLabel}</Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isPatient = message.senderType === 'patient';

  return (
    <View style={[styles.bubble, isPatient ? styles.patientBubble : styles.aiBubble]}>
      <Typography style={[styles.bubbleText, isPatient && styles.patientBubbleText]}>
        {message.text}
      </Typography>
    </View>
  );
}

function InterpretationCard({
  review,
  onQuestionPress,
}: {
  review: AiReviewResult;
  onQuestionPress: (question: string) => void;
}) {
  const valueBreakdown = review.valueBreakdown ?? [];
  const suggestedQuestions = review.suggestedQuestions ?? [];

  return (
    <View style={styles.interpretationCard}>
      <View style={styles.interpretationHeader}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles-outline" size={16} color="#1565C0" />
        </View>
        <View style={styles.interpretationTitleBlock}>
          <Typography style={styles.interpretationTitle}>AI Review</Typography>
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
  screen: {
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.18,
    lineHeight: 27,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  loadingState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  stateCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  stateText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  stateAction: {
    borderColor: '#1565C0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  stateActionText: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  bubble: {
    borderRadius: 12,
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAFAFA',
  },
  patientBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1565C0',
  },
  bubbleText: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  patientBubbleText: {
    color: '#FFFFFF',
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
  aiAvatar: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  interpretationTitleBlock: {
    flex: 1,
  },
  interpretationTitle: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  interpretationSubtitle: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  summaryText: {
    color: '#333333',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E8FA',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaText: {
    color: '#1565C0',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  valueList: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7EEF6',
    borderRadius: 10,
    borderWidth: 1,
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
  valueCopy: {
    flex: 1,
    gap: 2,
  },
  valueMetric: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  valueStatus: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  valueAmount: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  questionGroup: {
    gap: 8,
  },
  questionTitle: {
    color: '#494949',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
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
  questionText: {
    color: '#1565C0',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F0F0F0',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sendError: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  composerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  inputPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
    height: 48,
  },
  customPlaceholder: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    left: 0,
    lineHeight: 21,
    position: 'absolute',
    top: 13.5,
  },
  input: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    height: 48,
    lineHeight: 21,
    paddingBottom: 0,
    paddingTop: 0,
  },
  iconButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  sendButtonActive: {
    backgroundColor: '#1565C0',
  },
  disclaimer: {
    color: '#8A8A8A',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16.5,
    marginTop: 14,
    textAlign: 'center',
  },
});
