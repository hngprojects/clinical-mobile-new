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
import {
  Screen,
  Typography,
  UploadBottomSheet,
  UploadedFile,
  UploadError,
} from '@/shared/components';

import type { AiReviewResult } from '../api/ai-review.types';
import type { ChatMessage } from '../api/chat.types';
import { useAiReview } from '../hooks/useAiReview';
import { useCaseChat, useCaseChatSocket, useSendChatMessage } from '../hooks/useCaseChat';

import { ChatBubble, ChatComposer, ChatInterpretationCard, ChatStateMessage } from './chat';

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
  const storedGuestSessionId = useAuthStore((state) => state.guestSessionId);
  const { caseId, guestSessionId, mock, demo } = useLocalSearchParams<{
    caseId?: string;
    guestSessionId?: string;
    mock?: string;
    demo?: string;
  }>();
  const [draft, setDraft] = useState('');
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [pendingAttachment, setPendingAttachment] = useState<UploadedFile | null>(null);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const hasConnectedRef = useRef(false);
  const isMockChat = typeof __DEV__ !== 'undefined' && __DEV__ && mock === 'chat';
  const isDemoMode = demo === 'true';
  const effectiveGuestSessionId =
    typeof guestSessionId === 'string' ? guestSessionId : storedGuestSessionId;
  const reviewQuery = useAiReview(caseId || '', effectiveGuestSessionId);
  const chatQuery = useCaseChat(caseId || '', effectiveGuestSessionId);
  const sendMessage = useSendChatMessage(caseId || '', effectiveGuestSessionId);
  const chatSocket = useCaseChatSocket(
    caseId || '',
    effectiveGuestSessionId,
    !isMockChat && !isDemoMode,
  );
  const review = isMockChat ? MOCK_REVIEW : reviewQuery.data;
  const messages = useMemo(
    () => (isMockChat ? mockMessages : [...(chatQuery.data ?? []), ...localMessages]),
    [chatQuery.data, isMockChat, localMessages, mockMessages],
  );
  const trimmedDraft = draft.trim();
  const { status: socketStatus } = chatSocket;
  if (socketStatus === 'connected') hasConnectedRef.current = true;
  const showReconnecting = hasConnectedRef.current && socketStatus === 'connecting';
  const showConnectionLost = hasConnectedRef.current && socketStatus === 'disconnected';
  const showSessionExpired = socketStatus === 'session_expired';
  const isSendingMessage = sendMessage.isPending || chatSocket.isSending;
  const canSend = Boolean(
    (caseId || isMockChat) &&
    (trimmedDraft || pendingAttachment) &&
    !isSendingMessage &&
    !showSessionExpired,
  );
  const hasInterpretation = Boolean(
    review?.status === 'complete' &&
    (review.summary || review.valueBreakdown?.length || review.suggestedQuestions?.length),
  );
  const timelineItems = useMemo(
    () => buildTimeline(messages, hasInterpretation ? review : undefined),
    [hasInterpretation, messages, review],
  );
  const isInitialLoading = !isMockChat && chatQuery.isLoading;
  const isInitialError = !isMockChat && chatQuery.isError;

  useEffect(() => {
    if (timelineItems.length > 0) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [timelineItems.length]);

  const handleSend = async () => {
    if (!canSend) return;

    const message = trimmedDraft;
    const attachment = pendingAttachment;
    setDraft('');
    setPendingAttachment(null);

    if (attachment) {
      const localMessage = createLocalAttachmentMessage({
        caseId: caseId || 'mock-case',
        file: attachment,
        text: message,
      });

      if (isMockChat) {
        setMockMessages((current) => [...current, localMessage]);
      } else {
        setLocalMessages((current) => [...current, localMessage]);
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

    try {
      if (chatSocket.isConnected && (await chatSocket.sendLiveMessage(message))) {
        return;
      }

      await sendMessage.mutateAsync(message);
    } catch {
      setDraft(message);
      setPendingAttachment(attachment);
    }
  };

  const handleUploadFromChat = (file: UploadedFile) => {
    setUploadErrorMessage(null);
    setPendingAttachment(file);
  };

  const handleUploadPickerError = (error: UploadError) => {
    if (error.type === 'file-size') {
      setUploadErrorMessage('File size limit exceeded. Please upload a smaller file.');
      return;
    }

    if (error.type === 'file-type') {
      setUploadErrorMessage('Please upload a PDF, JPG, JPEG, or PNG file.');
      return;
    }

    setUploadErrorMessage('Upload failed. Please select a different file or try again.');
  };

  return (
    <>
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
          <Typography style={styles.headerTitle}>
            Chat with <Typography style={styles.floHeaderWord}>Flo</Typography>
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
                      onQuestionPress={setDraft}
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
              isSending={isSendingMessage}
              onDraftChange={setDraft}
              onOpenUpload={() => {
                setUploadErrorMessage(null);
                setShowUploadSheet(true);
              }}
              onRemoveAttachment={() => setPendingAttachment(null)}
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
    </>
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
  floHeaderWord: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 27,
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
