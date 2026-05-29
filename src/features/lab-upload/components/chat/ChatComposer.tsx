import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Typography, UploadedFile } from '@/shared/components';

import { AttachmentPreviewThumb } from './ChatBubble';

const COMPOSER_INPUT_MIN_HEIGHT = 24;
const COMPOSER_INPUT_MAX_HEIGHT = 112;
const COMPOSER_VERTICAL_PADDING = 20;
const COMPOSER_MIN_HEIGHT = 48;
const COMPOSER_MEASURE_TEXT = ' ';

interface ChatComposerProps {
  bottomInset: number;
  canSend: boolean;
  draft: string;
  hideUpload?: boolean;
  isSending: boolean;
  onDraftChange: (value: string) => void;
  onOpenUpload: () => void;
  onRemoveAttachment: () => void;
  onSend: () => void;
  pendingAttachment: UploadedFile | null;
  sendErrorVisible: boolean;
  uploadErrorMessage: string | null;
  showConnectionLost: boolean;
  showReconnecting: boolean;
  showSessionExpired: boolean;
}

export function ChatComposer({
  bottomInset,
  canSend,
  draft,
  hideUpload = false,
  isSending,
  onDraftChange,
  onOpenUpload,
  onRemoveAttachment,
  onSend,
  pendingAttachment,
  sendErrorVisible,
  uploadErrorMessage,
  showConnectionLost,
  showReconnecting,
  showSessionExpired,
}: ChatComposerProps) {
  const [inputHeight, setInputHeight] = useState(COMPOSER_INPUT_MIN_HEIGHT);
  const [voiceNoticeVisible, setVoiceNoticeVisible] = useState(false);
  const voiceNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composerHeight = Math.max(COMPOSER_MIN_HEIGHT, inputHeight + COMPOSER_VERTICAL_PADDING);

  useEffect(() => {
    if (!draft) {
      setInputHeight(COMPOSER_INPUT_MIN_HEIGHT);
    }
  }, [draft]);

  useEffect(
    () => () => {
      if (voiceNoticeTimerRef.current !== null) {
        clearTimeout(voiceNoticeTimerRef.current);
      }
    },
    [],
  );

  const updateInputHeight = useCallback((height: number) => {
    const nextHeight = Math.min(
      Math.max(Math.ceil(height), COMPOSER_INPUT_MIN_HEIGHT),
      COMPOSER_INPUT_MAX_HEIGHT,
    );

    setInputHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
  }, []);

  const showVoiceNotice = useCallback(() => {
    setVoiceNoticeVisible(true);

    if (voiceNoticeTimerRef.current !== null) {
      clearTimeout(voiceNoticeTimerRef.current);
    }

    voiceNoticeTimerRef.current = setTimeout(() => {
      setVoiceNoticeVisible(false);
      voiceNoticeTimerRef.current = null;
    }, 1800);
  }, []);

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {showSessionExpired ? (
        <Typography style={styles.socketError}>
          Your session has expired. Please log in again to continue chatting.
        </Typography>
      ) : showReconnecting ? (
        <Typography style={styles.socketStatus}>Reconnecting...</Typography>
      ) : showConnectionLost ? (
        <Typography style={styles.socketStatus}>
          Connection lost. Messages may not send in real time.
        </Typography>
      ) : null}
      {sendErrorVisible ? (
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
            <Typography style={styles.pendingAttachmentMeta}>{pendingAttachment.size}</Typography>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove attachment"
            hitSlop={8}
            onPress={onRemoveAttachment}
            style={styles.pendingAttachmentRemove}
          >
            <Ionicons name="close" size={18} color="#767676" />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.composerRow}>
        <View style={[styles.inputPill, { height: composerHeight }]}>
          {!hideUpload && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Upload lab result"
              onPress={onOpenUpload}
              style={styles.attachButton}
            >
              <Ionicons name="arrow-up-circle-outline" size={24} color="#767676" />
            </Pressable>
          )}
          <View style={[styles.inputWrap, { height: inputHeight }]}>
            <Text
              aria-hidden
              onLayout={(event) => updateInputHeight(event.nativeEvent.layout.height)}
              pointerEvents="none"
              style={styles.inputMeasure}
            >
              {draft || COMPOSER_MEASURE_TEXT}
            </Text>
            <TextInput
              multiline
              blurOnSubmit={false}
              onContentSizeChange={(event) =>
                updateInputHeight(event.nativeEvent.contentSize.height)
              }
              onChangeText={onDraftChange}
              placeholder="Ask about results"
              placeholderTextColor="#767676"
              returnKeyType="default"
              scrollEnabled={inputHeight >= COMPOSER_INPUT_MAX_HEIGHT}
              style={[styles.input, { height: inputHeight }]}
              value={draft}
            />
          </View>
        </View>
        <View style={styles.micButtonWrap}>
          {voiceNoticeVisible ? (
            <View pointerEvents="none" style={styles.voiceTooltip}>
              <Typography style={styles.voiceTooltipText}>Voice coming soon</Typography>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice input coming soon"
            onPress={showVoiceNotice}
            style={[styles.iconButton, styles.disabledButton]}
          >
            <Ionicons name="mic-outline" size={28} color="#767676" />
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={!canSend}
          onPress={onSend}
          style={[styles.sendButton, (canSend || isSending) && styles.sendButtonActive]}
        >
          {isSending ? (
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
  );
}

const styles = StyleSheet.create({
  attachButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
  },
  composerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 14,
  },
  disabledButton: {
    opacity: 0.5,
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
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F0F0F0',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
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
  inputPill: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    flexShrink: 1,
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
  micButtonWrap: {
    position: 'relative',
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
  pendingAttachmentCopy: {
    flex: 1,
    gap: 2,
  },
  pendingAttachmentMeta: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  pendingAttachmentName: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  pendingAttachmentRemove: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    justifyContent: 'center',
    padding: 12,
  },
  sendButtonActive: {
    backgroundColor: '#1565C0',
  },
  sendError: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  socketError: {
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  socketStatus: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  voiceTooltip: {
    alignItems: 'center',
    backgroundColor: '#1B1B1B',
    borderRadius: 999,
    bottom: 48,
    left: -46,
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
    width: 128,
  },
  voiceTooltipText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
