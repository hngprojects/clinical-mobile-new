import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Typography, UploadedFile } from '@/shared/components';

import type { ChatMessage } from '../../api/chat.types';

const FLO_PENDING_MESSAGES = [
  'Flo is reading...',
  'Flo is checking...',
  'Flo is reviewing...',
  'Flo is preparing...',
];

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isPatient = message.senderType === 'patient';
  const isFile = message.senderType === 'file';
  const attachment = getMessageAttachment(message);

  if (!isPatient && !isFile) {
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

export function AttachmentPreviewThumb({ file }: { file: UploadedFile }) {
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
              {renderInlineText(block.text, `heading-${index}`)}
            </Typography>
          );
        }

        if (block.type === 'bullet') {
          return (
            <View key={`${block.text}-${index}`} style={styles.formattedListItem}>
              <Typography style={styles.formattedBullet}>{'\u2022'}</Typography>
              <Typography style={[styles.bubbleText, styles.formattedListText]}>
                {renderInlineText(block.text, `bullet-${index}`)}
              </Typography>
            </View>
          );
        }

        if (block.type === 'numbered') {
          return (
            <View key={`${block.marker}-${block.text}-${index}`} style={styles.formattedListItem}>
              <Typography style={styles.formattedNumber}>{block.marker}</Typography>
              <Typography style={[styles.bubbleText, styles.formattedListText]}>
                {renderInlineText(block.text, `numbered-${index}`)}
              </Typography>
            </View>
          );
        }

        return (
          <Typography key={`${block.text}-${index}`} style={styles.bubbleText}>
            {renderInlineText(block.text, `paragraph-${index}`)}
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

      return parseMarkdownLines(lines);
    });
}

function parseMarkdownLines(lines: string[]): FormattedBlock[] {
  const blocks: FormattedBlock[] = [];
  let paragraphLines: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) return;
    blocks.push({ text: cleanMarkdownBlockText(paragraphLines.join(' ')), type: 'paragraph' });
    paragraphLines = [];
  }

  for (const line of lines) {
    const heading = line.match(/^\s*#{1,6}\s*(.+?)\s*#{0,6}\s*$/);
    if (heading) {
      flushParagraph();
      blocks.push({ text: cleanMarkdownBlockText(heading[1]), type: 'heading' });
      continue;
    }

    const numbered = line.match(/^(\d+[.)])\s+(.+)$/);
    if (numbered) {
      flushParagraph();
      blocks.push({
        marker: numbered[1],
        text: cleanMarkdownBlockText(numbered[2]),
        type: 'numbered',
      });
      continue;
    }

    if (/^[-*\u2022]\s+/.test(line)) {
      flushParagraph();
      blocks.push({
        text: cleanMarkdownBlockText(line.replace(/^[-*\u2022]\s+/, '')),
        type: 'bullet',
      });
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  return blocks;
}

function cleanMarkdownBlockText(text: string) {
  return cleanMarkdownHeadings(text).trim();
}

function renderInlineText(text: string, keyPrefix: string) {
  return parseInlineMarkdown(text).map((segment, index) => {
    if (!segment.bold) return segment.text;

    return (
      <Text key={`${keyPrefix}-bold-${index}`} style={styles.inlineBold}>
        {segment.text}
      </Text>
    );
  });
}

function parseInlineMarkdown(text: string) {
  const segments: { text: string; bold: boolean }[] = [];
  const boldPattern = /(\*\*|__)(.+?)\1/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldPattern.exec(text)) !== null) {
    const plainText = cleanInlineText(text.slice(lastIndex, match.index));
    if (plainText.length > 0) segments.push({ bold: false, text: plainText });

    const boldText = cleanInlineText(match[2]);
    if (boldText.length > 0) segments.push({ bold: true, text: boldText });

    lastIndex = match.index + match[0].length;
  }

  const trailingText = cleanInlineText(text.slice(lastIndex));
  if (trailingText.length > 0) segments.push({ bold: false, text: trailingText });

  return segments.length > 0 ? segments : [{ bold: false, text: cleanInlineText(text) }];
}

function cleanInlineText(text: string) {
  return cleanMarkdownHeadings(text)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

function cleanMarkdownHeadings(text: string) {
  return text.replace(/^\s*#{1,6}\s*/gm, '').replace(/\s+#{1,6}\s*$/gm, '');
}

function getMessageAttachment(message: ChatMessage) {
  if (message.file) {
    const name = message.file.name;
    const uri = message.file.url;

    if (!name || !uri) return null;

    return {
      isImage: isImageAttachment(name),
      mimeType: '',
      name,
      size: '',
      text: getFileMessageText(message),
      uri,
    };
  }

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

function getFileMessageText(message: ChatMessage) {
  if (!message.text || message.text === message.file?.name) return '';

  return message.text;
}

function AttachmentBubbleCard({
  attachment,
}: {
  attachment: NonNullable<ReturnType<typeof getMessageAttachment>>;
}) {
  const meta = attachment.size || getAttachmentMetaLabel(attachment.name, attachment.mimeType);

  if (attachment.isImage) {
    return (
      <View style={styles.attachmentImageCard}>
        <Image source={{ uri: attachment.uri }} resizeMode="cover" style={styles.attachmentImage} />
        <View style={styles.attachmentImageFooter}>
          <Typography numberOfLines={1} style={styles.attachmentFileName}>
            {attachment.name}
          </Typography>
          <Typography style={styles.attachmentFileMeta}>{meta}</Typography>
        </View>
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
        <Typography style={styles.attachmentFileMeta}>{meta}</Typography>
      </View>
    </View>
  );
}

function isImageAttachment(name: string, mimeType?: string) {
  return Boolean(mimeType?.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(name));
}

function getAttachmentMetaLabel(name: string, mimeType?: string) {
  if (mimeType) {
    const [, subtype] = mimeType.split('/');
    if (subtype) return `${subtype.toUpperCase()} file`;
  }

  const extension = name.match(/\.([a-z0-9]+)$/i)?.[1];
  if (extension) return `${extension.toUpperCase()} file`;

  return 'Uploaded file';
}

const styles = StyleSheet.create({
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAFAFA',
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
  aiMessageGroup: {
    alignSelf: 'flex-start',
  },
  aiPendingBubble: {
    minWidth: 244,
  },
  attachmentFileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: 220,
  },
  attachmentFileCopy: {
    flex: 1,
    gap: 2,
  },
  attachmentFileIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  attachmentFileMeta: {
    color: '#767676',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  attachmentFileName: {
    color: '#1B1B1B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentImage: {
    backgroundColor: '#0F4C92',
    borderRadius: 8,
    height: 52,
    width: 52,
  },
  attachmentImageCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: 220,
  },
  attachmentImageFooter: {
    flex: 1,
    gap: 2,
  },
  bubble: {
    borderRadius: 12,
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleText: {
    color: '#494949',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  formattedBullet: {
    color: '#494949',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    width: 10,
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
  formattedListText: {
    flex: 1,
  },
  formattedMessage: {
    gap: 8,
  },
  formattedNumber: {
    color: '#494949',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    minWidth: 22,
  },
  inlineBold: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  patientBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1565C0',
    gap: 8,
  },
  patientBubbleText: {
    color: '#FFFFFF',
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
});
