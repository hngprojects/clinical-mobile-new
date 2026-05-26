import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

import type { AiReviewResult, ValueBreakdown } from '../api/ai-review.types';
import type { ChatMessage } from '../api/chat.types';
import { useAiReview } from '../hooks/useAiReview';
import { useCaseChat, useCaseChatSocket, useSendChatMessage } from '../hooks/useCaseChat';

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

const COMPOSER_INPUT_MIN_HEIGHT = 24;
const COMPOSER_INPUT_MAX_HEIGHT = 112;
const COMPOSER_VERTICAL_PADDING = 20;
const COMPOSER_MIN_HEIGHT = 48;
const COMPOSER_MEASURE_TEXT = ' ';
const FLO_PENDING_MESSAGES = [
  'Flo is thinking...',
  'Flo is reviewing...',
  'Flo is preparing your reply...',
];

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
  const [inputHeight, setInputHeight] = useState(COMPOSER_INPUT_MIN_HEIGHT);
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
  const isSendingMessage = sendMessage.isPending || chatSocket.isSending;
  const canSend = Boolean(
    (caseId || isMockChat) && (trimmedDraft || pendingAttachment) && !isSendingMessage,
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
  const composerHeight = Math.max(COMPOSER_MIN_HEIGHT, inputHeight + COMPOSER_VERTICAL_PADDING);

  useEffect(() => {
    if (timelineItems.length > 0) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [timelineItems.length]);

  const updateInputHeight = useCallback((height: number) => {
    const nextHeight = Math.min(
      Math.max(Math.ceil(height), COMPOSER_INPUT_MIN_HEIGHT),
      COMPOSER_INPUT_MAX_HEIGHT,
    );

    setInputHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
  }, []);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!value) {
      setInputHeight(COMPOSER_INPUT_MIN_HEIGHT);
    }
  };

  const handleSend = async () => {
    if (!canSend) return;

    const message = trimmedDraft;
    const attachment = pendingAttachment;
    setDraft('');
    setPendingAttachment(null);
    setInputHeight(COMPOSER_INPUT_MIN_HEIGHT);

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
              <StateMessage message="We could not find the case for this chat." />
            ) : isInitialLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color="#1565C0" size="small" />
                <Typography style={styles.stateText}>Loading chat...</Typography>
              </View>
            ) : isInitialError ? (
              <StateMessage
                message="We could not load your chat. Please check your connection and try again."
                actionLabel="Retry"
                onAction={() => {
                  chatQuery.refetch();
                }}
              />
            ) : timelineItems.length === 0 ? (
              <StateMessage
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

          {!isDemoMode && (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              {showReconnecting ? (
                <Typography style={styles.socketStatus}>Reconnecting…</Typography>
              ) : showConnectionLost ? (
                <Typography style={styles.socketStatus}>
                  Connection lost. Messages may not send in real time.
                </Typography>
              ) : null}
              {sendMessage.isError ? (
                <Typography style={styles.sendError}>Message failed. Please try again.</Typography>
              ) : null}
              {uploadErrorMessage ? (
                <Typography style={styles.sendError}>{uploadErrorMessage}</Typography>
              ) : null}
              {pendingAttachment ? (
                <View style={styles.pendingAttachment}>
                  <AttachmentPreviewThumb file={pendingAttachment} />
                  <View style={styles.pendingAttachmentCopy}>
                    <Typography numberOfLines={1} style={styles.pendingAttachmentName}>
                      {pendingAttachment.name}
                    </Typography>
                    <Typography style={styles.pendingAttachmentMeta}>
                      {pendingAttachment.size}
                    </Typography>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove attachment"
                    hitSlop={8}
                    onPress={() => setPendingAttachment(null)}
                    style={styles.pendingAttachmentRemove}
                  >
                    <Ionicons name="close" size={18} color="#767676" />
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.composerRow}>
                <View
                  style={[
                    styles.inputPill,
                    {
                      height: composerHeight,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Upload lab result"
                    onPress={() => {
                      setUploadErrorMessage(null);
                      setShowUploadSheet(true);
                    }}
                    style={styles.attachButton}
                  >
                    <Ionicons name="arrow-up-circle-outline" size={24} color="#767676" />
                  </Pressable>
                  <View style={[styles.inputWrap, { height: inputHeight }]}>
                    <Text
                      aria-hidden
                      onLayout={(event) => {
                        updateInputHeight(event.nativeEvent.layout.height);
                      }}
                      pointerEvents="none"
                      style={styles.inputMeasure}
                    >
                      {draft || COMPOSER_MEASURE_TEXT}
                    </Text>
                    <TextInput
                      multiline
                      blurOnSubmit={false}
                      onContentSizeChange={(event) => {
                        updateInputHeight(event.nativeEvent.contentSize.height);
                      }}
                      onChangeText={handleDraftChange}
                      placeholder="Ask about results"
                      placeholderTextColor="#767676"
                      returnKeyType="default"
                      scrollEnabled={inputHeight >= COMPOSER_INPUT_MAX_HEIGHT}
                      style={[styles.input, { height: inputHeight }]}
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
                  style={[
                    styles.sendButton,
                    (canSend || isSendingMessage) && styles.sendButtonActive,
                  ]}
                >
                  {isSendingMessage ? (
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
                Flo provides AI-powered explanations, not medical diagnoses.
              </Typography>
            </View>
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

function StateMessage({
  message,
  actionLabel,
  onAction,
}: {
  message: React.ReactNode;
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
  const attachment = getMessageAttachment(message);

  if (!isPatient) {
    return (
      <View style={styles.aiMessageGroup}>
        <View
          style={[
            styles.bubble,
            styles.aiBubble,
            isPendingResponseMessage(message) && styles.aiPendingBubble,
          ]}
        >
          {isPendingResponseMessage(message) ? (
            <FloPendingIndicator />
          ) : (
            <FormattedAiMessage text={message.text} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bubble, styles.patientBubble]}>
      {attachment ? (
        <>
          {attachment.text ? (
            <Typography style={[styles.bubbleText, styles.patientBubbleText]}>
              {attachment.text}
            </Typography>
          ) : null}
          <AttachmentBubbleCard attachment={attachment} />
        </>
      ) : (
        <Typography style={[styles.bubbleText, styles.patientBubbleText]}>
          {message.text}
        </Typography>
      )}
    </View>
  );
}

function isPendingResponseMessage(message: ChatMessage) {
  return message.content.isPendingResponse === true;
}

function FloPendingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % FLO_PENDING_MESSAGES.length);
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.aiLoadingRow}>
      <ActivityIndicator color="#1565C0" size="small" />
      <Typography style={styles.aiLoadingText}>{FLO_PENDING_MESSAGES[messageIndex]}</Typography>
    </View>
  );
}

function FormattedAiMessage({ text }: { text: string }) {
  const blocks = formatAiMessage(text);

  return (
    <View style={styles.formattedMessage}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <Typography key={`${block.text}-${index}`} style={styles.formattedHeading}>
              {block.text}
            </Typography>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={`${block.text}-${index}`} style={styles.formattedListItem}>
              <Typography style={styles.formattedBullet}>•</Typography>
              <Typography style={[styles.bubbleText, styles.formattedListText]}>
                {block.text}
              </Typography>
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={`${block.marker}-${block.text}-${index}`} style={styles.formattedListItem}>
              <Typography style={styles.formattedNumber}>{block.marker}</Typography>
              <Typography style={[styles.bubbleText, styles.formattedListText]}>
                {block.text}
              </Typography>
            </View>
          );
        }

        return (
          <Typography key={`${block.text}-${index}`} style={styles.bubbleText}>
            {block.text}
          </Typography>
        );
      })}
    </View>
  );
}

type FormattedBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; marker: string; text: string };

function formatAiMessage(text: string): FormattedBlock[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .flatMap((section): FormattedBlock[] => {
      const lines = section
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return [];

      const allListItems = lines.every((line) => /^([-*•]\s+|\d+[.)]\s+)/.test(line));
      if (allListItems) {
        return lines.map((line) => {
          const numbered = line.match(/^(\d+[.)])\s+(.+)$/);
          if (numbered) {
            return {
              marker: numbered[1],
              text: cleanMarkdownText(numbered[2]),
              type: 'numbered',
            };
          }

          return {
            text: cleanMarkdownText(line.replace(/^[-*•]\s+/, '')),
            type: 'bullet',
          };
        });
      }

      const heading = lines[0].match(/^#{1,6}\s+(.+)$/);
      if (heading && lines.length === 1) {
        return [{ text: cleanMarkdownText(heading[1]), type: 'heading' }];
      }

      return [{ text: cleanMarkdownText(lines.join(' ')), type: 'paragraph' }];
    });
}

function cleanMarkdownText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function getMessageAttachment(message: ChatMessage) {
  const { content } = message;
  const uri = typeof content.attachmentUri === 'string' ? content.attachmentUri : '';
  const name = typeof content.attachmentName === 'string' ? content.attachmentName : '';

  if (!uri || !name) return null;

  const size = typeof content.attachmentSize === 'string' ? content.attachmentSize : '';
  const mimeType = typeof content.attachmentMimeType === 'string' ? content.attachmentMimeType : '';
  const text = typeof content.attachmentText === 'string' ? content.attachmentText : '';

  return {
    isImage: isImageAttachment(name, mimeType),
    mimeType,
    name,
    size,
    text,
    uri,
  };
}

function AttachmentBubbleCard({
  attachment,
}: {
  attachment: NonNullable<ReturnType<typeof getMessageAttachment>>;
}) {
  if (attachment.isImage) {
    return (
      <View style={styles.attachmentImageCard}>
        <Image source={{ uri: attachment.uri }} resizeMode="cover" style={styles.attachmentImage} />
      </View>
    );
  }

  return (
    <View style={styles.attachmentFileCard}>
      <View style={styles.attachmentFileIcon}>
        <Ionicons name="document-text-outline" size={22} color="#1565C0" />
      </View>
      <View style={styles.attachmentFileCopy}>
        <Typography numberOfLines={1} style={styles.attachmentFileName}>
          {attachment.name}
        </Typography>
        {attachment.size ? (
          <Typography style={styles.attachmentFileMeta}>{attachment.size}</Typography>
        ) : null}
      </View>
    </View>
  );
}

function AttachmentPreviewThumb({ file }: { file: UploadedFile }) {
  const isImage = isImageAttachment(file.name, file.mimeType);

  if (isImage) {
    return <Image source={{ uri: file.uri }} resizeMode="cover" style={styles.pendingImageThumb} />;
  }

  return (
    <View style={styles.pendingAttachmentIcon}>
      <Ionicons name="document-attach-outline" size={18} color="#1565C0" />
    </View>
  );
}

function isImageAttachment(name: string, mimeType?: string) {
  return Boolean(mimeType?.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(name));
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
  floHeaderWord: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
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
  floInline: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
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
  aiPendingBubble: {
    minWidth: 244,
  },
  aiMessageGroup: {
    alignSelf: 'flex-start',
  },
  aiLoadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  aiLoadingText: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  patientBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1565C0',
    gap: 8,
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
  formattedMessage: {
    gap: 8,
  },
  formattedHeading: {
    color: '#1B1B1B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  formattedListItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  formattedBullet: {
    color: '#494949',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    width: 10,
  },
  formattedNumber: {
    color: '#494949',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    minWidth: 22,
  },
  formattedListText: {
    flex: 1,
  },
  attachmentImageCard: {
    borderRadius: 10,
    height: 72,
    overflow: 'hidden',
    width: 160,
  },
  attachmentImage: {
    backgroundColor: '#0F4C92',
    height: '100%',
    width: '100%',
  },
  attachmentFileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: 160,
  },
  attachmentFileIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  attachmentFileCopy: {
    flex: 1,
    gap: 2,
  },
  attachmentFileName: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentFileMeta: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
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
  floTitle: {
    color: '#1565C0',
    fontFamily: 'Inter_600SemiBold',
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
  socketStatus: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  sendError: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  pendingAttachment: {
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderColor: '#D7E8FA',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pendingAttachmentIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  pendingImageThumb: {
    backgroundColor: '#EAF4FF',
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  pendingAttachmentCopy: {
    flex: 1,
    gap: 2,
  },
  pendingAttachmentName: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  pendingAttachmentMeta: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  pendingAttachmentRemove: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  composerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 14,
  },
  inputPill: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row',
    gap: 12,
    maxHeight: COMPOSER_INPUT_MAX_HEIGHT + COMPOSER_VERTICAL_PADDING,
    minHeight: COMPOSER_MIN_HEIGHT,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrap: {
    flex: 1,
    flexShrink: 1,
    minHeight: COMPOSER_INPUT_MIN_HEIGHT,
  },
  inputMeasure: {
    color: 'transparent',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    includeFontPadding: false,
    left: 0,
    lineHeight: 21,
    opacity: 0,
    padding: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  input: {
    color: '#1B1B1B',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    includeFontPadding: false,
    lineHeight: 21,
    maxHeight: COMPOSER_INPUT_MAX_HEIGHT,
    minHeight: COMPOSER_INPUT_MIN_HEIGHT,
    padding: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    textAlignVertical: 'top',
    width: '100%',
  },
  attachButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    padding: 12,
    justifyContent: 'center',
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
});
