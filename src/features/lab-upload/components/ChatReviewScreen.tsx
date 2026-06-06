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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCaseName } from '@/features/insights/hooks/useCaseName';
import {
  Screen,
  Typography,
  UploadBottomSheet,
  UploadedFile,
  UploadError,
} from '@/shared/components';

import type { AiReviewResult } from '../api/ai-review.types';
import type { ChatMessage } from '../api/chat.types';
import { useAiReviewHistory } from '../hooks/useAiReview';
import { useCaseChat, useCaseChatSocket, useSendChatMessage } from '../hooks/useCaseChat';
import { useChatLabUpload } from '../hooks/useChatLabUpload';

import {
  ChatBubble,
  ChatComposer,
  ChatInterpretationCard,
  ChatStateMessage,
  GuestLimitModal,
} from './chat';

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

const GUEST_MESSAGE_LIMIT = 3;

export function ChatReviewScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const storedGuestSessionId = useAuthStore((state) => state.guestSessionId);
  const { caseId, guestSessionId, mock, demo, returnTo } = useLocalSearchParams<{
    caseId?: string;
    guestSessionId?: string;
    mock?: string;
    demo?: string;
    returnTo?: string;
  }>();
  const caseName = useCaseName(caseId);
  const [draft, setDraft] = useState('');
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [pendingAttachment, setPendingAttachment] = useState<UploadedFile | null>(null);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [isGuestAwaitingReply, setIsGuestAwaitingReply] = useState(false);
  const hasConnectedRef = useRef(false);
  const isMockChat = typeof __DEV__ !== 'undefined' && __DEV__ && mock === 'chat';
  const isDemoMode = demo === 'true';
  const effectiveGuestSessionId =
    typeof guestSessionId === 'string' ? guestSessionId : storedGuestSessionId;
  const isGuest = Boolean(effectiveGuestSessionId);
  const {
    clearUploadError,
    isLabUploading,
    isUploadError,
    labUploadStatusMessage,
    review,
    showUploadError,
    uploadErrorMessage,
    uploadLabResult,
  } = useChatLabUpload({
    caseId: caseId || '',
    enabled: !isMockChat && !isDemoMode,
    guestSessionId: effectiveGuestSessionId,
  });
  const reviewHistoryQuery = useAiReviewHistory(caseId || '', effectiveGuestSessionId);
  const chatQuery = useCaseChat(caseId || '', effectiveGuestSessionId, {
    refetchInterval: false,
  });
  const sendMessage = useSendChatMessage(caseId || '', effectiveGuestSessionId);
  const chatSocket = useCaseChatSocket(
    caseId || '',
    effectiveGuestSessionId,
    !isMockChat && !isDemoMode,
  );
  const displayedReview = isMockChat ? MOCK_REVIEW : review;
  const reviews = useMemo(
    () =>
      isMockChat ? [MOCK_REVIEW] : getTimelineReviews(reviewHistoryQuery.data, displayedReview),
    [displayedReview, isMockChat, reviewHistoryQuery.data],
  );
  useEffect(() => {
    if (!isGuest || !isGuestAwaitingReply) return;
    const hasAiReply = chatQuery.data?.some((m) => m.senderType === 'ai');
    if (hasAiReply) {
      setIsGuestAwaitingReply(false);
    }
  }, [chatQuery.data, isGuest, isGuestAwaitingReply]);

  const messages = useMemo(() => {
    if (isMockChat) return mockMessages;
    const base = [...(chatQuery.data ?? [])];
    const hasPendingReply = base.some(
      (message) =>
        message.senderType === 'ai' &&
        message.content &&
        typeof message.content === 'object' &&
        'isPendingResponse' in message.content,
    );
    if (isGuestAwaitingReply && !hasPendingReply) {
      base.push({
        id: 'guest-pending-ai',
        senderType: 'ai' as const,
        content: { isPendingResponse: true, message: 'Flo is reading...' },
        text: 'Flo is reading...',
        medicalCaseId: caseId || '',
        userId: null,
        sentAt: new Date().toISOString(),
      });
    }
    return base;
  }, [chatQuery.data, caseId, isGuestAwaitingReply, isMockChat, mockMessages]);
  const trimmedDraft = draft.trim();
  const { status: socketStatus } = chatSocket;
  if (socketStatus === 'connected') hasConnectedRef.current = true;
  const showReconnecting = hasConnectedRef.current && socketStatus === 'connecting';
  const showConnectionLost = hasConnectedRef.current && socketStatus === 'disconnected';
  const showSessionExpired = socketStatus === 'session_expired';
  const isSendingMessage = sendMessage.isPending || chatSocket.isSending || isLabUploading;
  const canSend = Boolean(
    (caseId || isMockChat) &&
    (trimmedDraft || pendingAttachment) &&
    !isSendingMessage &&
    !showSessionExpired,
  );
  const timelineItems = useMemo(() => buildTimeline(messages, reviews), [messages, reviews]);
  const isInitialLoading = !isMockChat && chatQuery.isLoading;
  const isInitialError = !isMockChat && chatQuery.isError;

  useEffect(() => {
    if (timelineItems.length > 0) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [timelineItems.length]);

  const clearComposerErrors = () => {
    if (sendMessage.isError) sendMessage.reset();
    clearUploadError();
  };

  const handleDraftChange = (value: string) => {
    if (sendMessage.isError || isUploadError || uploadErrorMessage) {
      clearComposerErrors();
    }
    setDraft(value);
  };

  const handleSend = async () => {
    if (!canSend) return;

    if (isGuest && guestMessageCount >= GUEST_MESSAGE_LIMIT) {
      setShowGuestLimitModal(true);
      return;
    }

    const message = trimmedDraft;
    const attachment = pendingAttachment;
    clearComposerErrors();
    setDraft('');
    setPendingAttachment(null);

    const sendChatText = async (text: string) => {
      if (!text) return;

      try {
        if (chatSocket.isConnected && (await chatSocket.sendLiveMessage(text))) {
          return;
        }
      } catch {
        // socket threw — fall through to REST fallback
      }

      await sendMessage.mutateAsync(text);
    };

    const recordGuestMessage = () => {
      if (!isGuest) return;

      setIsGuestAwaitingReply(true);
      setGuestMessageCount((current) => {
        const nextCount = current + 1;
        if (nextCount >= GUEST_MESSAGE_LIMIT) {
          setShowGuestLimitModal(true);
        }
        return nextCount;
      });
    };

    if (attachment) {
      if (isMockChat) {
        const localMessage = createLocalAttachmentMessage({
          caseId: 'mock-case',
          file: attachment,
          text: message,
        });
        setMockMessages((current) => [...current, localMessage]);
        return;
      }

      try {
        await uploadLabResult(attachment, message || null);
      } catch {
        setDraft(message);
        setPendingAttachment(attachment);
      }
      return;
    }

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
          text: 'That is a good follow-up. In the real chat, Flo would respond using the uploaded lab context.',
        }),
      ]);
      return;
    }

    recordGuestMessage();
    try {
      await sendChatText(message);
    } catch {
      setIsGuestAwaitingReply(false);
      setDraft(message);
      setPendingAttachment(attachment);
    }
  };

  const handleUploadFromChat = (file: UploadedFile) => {
    clearComposerErrors();
    setPendingAttachment(file);
  };

  const handleUploadPickerError = (error: UploadError) => {
    clearComposerErrors();

    if (error.type === 'file-size') {
      showUploadError('File size limit exceeded. Please upload a smaller file.');
      return;
    }

    if (error.type === 'file-type') {
      showUploadError('Please upload a PDF, JPG, JPEG, PNG, HEIC, or WEBP file.');
      return;
    }

    showUploadError('Upload failed. Please select a different file or try again.');
  };

  const handleBack = () => {
    if (returnTo === 'insights') {
      router.replace('/(main)/insights');
      return;
    }

    if (returnTo === 'home') {
      router.replace('/(main)');
      return;
    }

    router.back();
  };

  return (
    <>
      <Screen edges={['top']} backgroundColor="#FFFFFF" style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            hitSlop={12}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Typography style={styles.headerTitle} numberOfLines={1}>
            {caseName || 'Chat with Flo'}
          </Typography>
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
            {isDemoMode ? (
              <View style={styles.demoState}>
                <View style={styles.demoIconWrap}>
                  <Ionicons name="chatbubbles-outline" size={52} color="#1565C0" />
                </View>
                <Typography style={styles.demoTitle}>Coming Soon</Typography>
                <Typography style={styles.demoSubtitle}>
                  This is still a demo. Full chat review with Flo is on its way — stay tuned!
                </Typography>
              </View>
            ) : !caseId && !isMockChat ? (
              <ChatStateMessage message="We could not find the case for this chat." />
            ) : isInitialLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color="#1565C0" size="small" />
                <Typography style={styles.stateText}>Loading chat...</Typography>
              </View>
            ) : isInitialError ? (
              <ChatStateMessage
                message="We could not load your chat. Please check your connection and try again."
                actionLabel="Retry"
                onAction={() => {
                  chatQuery.refetch();
                }}
              />
            ) : timelineItems.length === 0 ? (
              <ChatStateMessage
                message={
                  <>
                    Ask a question about your <Typography style={styles.floInline}>Flo</Typography>{' '}
                    review to start the chat.
                  </>
                }
              />
            ) : (
              <>
                {timelineItems.map((item) =>
                  item.type === 'interpretation' ? (
                    <ChatInterpretationCard
                      key={item.id}
                      review={item.review}
                      onQuestionPress={handleDraftChange}
                    />
                  ) : (
                    <ChatBubble key={item.id} message={item.message} />
                  ),
                )}
              </>
            )}
          </ScrollView>

          {!isDemoMode && (
            <ChatComposer
              bottomInset={insets.bottom}
              canSend={canSend}
              draft={draft}
              hideUpload={isGuest}
              isSending={isSendingMessage}
              isUploadProcessing={isLabUploading}
              labUploadStatusMessage={labUploadStatusMessage}
              onDraftChange={handleDraftChange}
              onOpenUpload={() => {
                clearComposerErrors();
                setShowUploadSheet(true);
              }}
              onRemoveAttachment={() => {
                clearComposerErrors();
                setPendingAttachment(null);
              }}
              onSend={handleSend}
              pendingAttachment={pendingAttachment}
              sendErrorVisible={sendMessage.isError}
              showConnectionLost={showConnectionLost}
              showReconnecting={showReconnecting}
              showSessionExpired={showSessionExpired}
              uploadErrorMessage={uploadErrorMessage}
            />
          )}
        </KeyboardAvoidingView>
      </Screen>

      <UploadBottomSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onUpload={handleUploadFromChat}
        onUploadError={handleUploadPickerError}
      />

      {isGuest && caseId && effectiveGuestSessionId && (
        <GuestLimitModal
          caseId={caseId}
          guestSessionId={effectiveGuestSessionId}
          onDismiss={() => setShowGuestLimitModal(false)}
          visible={showGuestLimitModal}
        />
      )}
    </>
  );
}

function buildTimeline(messages: ChatMessage[], reviews: AiReviewResult[]): TimelineItem[] {
  const items: TimelineItem[] = messages.map((message, index) => ({
    id: `message-${message.id}`,
    index,
    message,
    timestamp: getTimestamp(message.sentAt),
    type: 'message',
  }));

  for (const [index, review] of reviews.entries()) {
    items.push({
      id: `interpretation-${review.id ?? review.generatedAt ?? index}`,
      index: messages.length + index,
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

function getTimelineReviews(history: AiReviewResult[] | undefined, latest?: AiReviewResult) {
  const source = latest ? [...(history ?? []), latest] : (history ?? []);
  const seen = new Set<string>();

  return source
    .filter(
      (review) =>
        review.status === 'complete' &&
        (review.summary || review.valueBreakdown?.length || review.suggestedQuestions?.length),
    )
    .filter((review) => {
      const identity = getReviewIdentity(review);
      if (!identity || seen.has(identity)) return false;

      seen.add(identity);
      return true;
    })
    .sort((a, b) => getTimestamp(a.generatedAt) - getTimestamp(b.generatedAt));
}

function getReviewIdentity(review?: AiReviewResult | null) {
  if (!review) return null;
  return `${review.status}:${review.id ?? ''}:${review.generatedAt ?? ''}`;
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

function createLocalAttachmentMessage({
  caseId,
  file,
  text,
}: {
  caseId: string;
  file: UploadedFile;
  text: string;
}): ChatMessage {
  return {
    id: `local-attachment-${Date.now()}`,
    senderType: 'patient',
    content: {
      attachmentMimeType: file.mimeType,
      attachmentName: file.name,
      attachmentSize: file.size,
      attachmentText: text,
      attachmentUri: file.uri,
      message: text || file.name,
    },
    text: text || file.name,
    medicalCaseId: caseId,
    userId: useAuthStore.getState().user?.id ?? null,
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

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  body: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  demoState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  demoIconWrap: {
    alignItems: 'center',
    backgroundColor: '#E8EFF8',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  demoTitle: {
    color: '#111827',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  demoSubtitle: {
    color: '#5E5E5E',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  floInline: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 21,
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
  loadingState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  screen: {
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  stateText: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
