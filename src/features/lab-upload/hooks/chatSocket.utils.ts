import { env } from '@/shared/constants/env';

import { getChatText, mapChatMessage } from '../api/chat.api';
import type { ChatMessage, ChatResponse, ChatSenderType } from '../api/chat.types';

export type SocketPayload = {
  type?: string;
  data?: unknown;
  message?: unknown;
  content?: unknown;
  text?: unknown;
  delta?: unknown;
  chunk?: unknown;
  id?: unknown;
  sender_type?: unknown;
  senderType?: unknown;
  role?: unknown;
  case_id?: unknown;
  medical_case_id?: unknown;
  user_id?: unknown;
  file?: unknown;
  sent_at?: unknown;
};

export function getChatSocketUrl() {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, '');
  const socketBaseUrl = baseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');

  return `${socketBaseUrl}/api/v1/ws/chat`;
}

export function createStreamingMessage(id: string, text: string, caseId: string): ChatMessage {
  return {
    id,
    senderType: 'ai',
    content: { message: text },
    text,
    medicalCaseId: caseId,
    userId: null,
    sentAt: new Date().toISOString(),
  };
}

export function createPendingResponseMessage(id: string, caseId: string): ChatMessage {
  return {
    id,
    senderType: 'ai',
    content: { isPendingResponse: true, message: 'Flo is reading...' },
    text: 'Flo is reading...',
    medicalCaseId: caseId,
    userId: null,
    sentAt: new Date().toISOString(),
  };
}

export function mergeResponseText(current: string, incoming: string) {
  if (!current) return incoming;
  if (!incoming) return current;
  if (incoming.startsWith(current)) return incoming;
  if (current.endsWith(incoming)) return current;

  return `${current}${incoming}`;
}

export function parseSocketPayload(data: unknown) {
  if (typeof data !== 'string') return data;

  try {
    return JSON.parse(data);
  } catch {
    return { type: 'message', content: data };
  }
}

export function normalizeSocketPayload(value: unknown, caseId: string): ChatMessage[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeSocketPayload(item, caseId));
  }

  if (!value || typeof value !== 'object') return [];

  const payload = value as SocketPayload;
  const nested = payload.data ?? payload.message;

  if (Array.isArray(nested)) {
    return nested.flatMap((item) => normalizeSocketPayload(item, caseId));
  }

  if (isChatResponse(payload)) {
    return [mapChatMessage(payload)];
  }

  if (isChatResponse(nested)) {
    return [mapChatMessage(nested)];
  }

  if (nested && typeof nested === 'object') {
    return normalizeSocketPayload(nested, caseId);
  }

  const type = typeof payload.type === 'string' ? payload.type.toLowerCase() : '';
  const text = getSocketText(payload);

  if (!text || ['init', 'connected', 'ack', 'pong', 'error'].includes(type)) {
    return [];
  }

  const senderType = getSocketSenderType(payload);
  const sentAt = typeof payload.sent_at === 'string' ? payload.sent_at : new Date().toISOString();

  return [
    {
      id: typeof payload.id === 'string' ? payload.id : `ws-${type || senderType}-${Date.now()}`,
      senderType,
      content: { message: text, raw: payload },
      text,
      medicalCaseId:
        typeof payload.medical_case_id === 'string'
          ? payload.medical_case_id
          : typeof payload.case_id === 'string'
            ? payload.case_id
            : caseId,
      userId: typeof payload.user_id === 'string' ? payload.user_id : null,
      sentAt,
    },
  ];
}

export function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== 'object') return false;

  const message = value as Partial<ChatResponse>;
  return (
    typeof message.id === 'string' &&
    typeof message.medical_case_id === 'string' &&
    typeof message.sent_at === 'string' &&
    (message.sender_type === 'patient' ||
      message.sender_type === 'ai' ||
      message.sender_type === 'file') &&
    typeof message.content === 'object' &&
    message.content !== null
  );
}

export function getSocketText(payload: SocketPayload) {
  if (typeof payload.content === 'string') return payload.content;
  if (typeof payload.text === 'string') return payload.text;
  if (typeof payload.delta === 'string') return payload.delta;
  if (typeof payload.chunk === 'string') return payload.chunk;
  if (typeof payload.message === 'string') return payload.message;
  if (payload.content && typeof payload.content === 'object') {
    return getChatText(payload.content as ChatResponse['content']);
  }

  return '';
}

export function getSocketSenderType(payload: SocketPayload): ChatSenderType {
  const senderType = payload.sender_type ?? payload.senderType;
  if (senderType === 'patient' || senderType === 'ai' || senderType === 'file') return senderType;

  if (payload.role === 'user' || payload.role === 'patient') return 'patient';

  return 'ai';
}
