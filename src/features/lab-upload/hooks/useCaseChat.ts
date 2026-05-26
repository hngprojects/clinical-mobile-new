import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useApiMutation, useApiQuery } from '@/shared/api/hooks';
import { env } from '@/shared/constants/env';

import { chatApi, getChatText, mapChatMessage } from '../api/chat.api';
import type { ChatMessage, ChatResponse, ChatSenderType } from '../api/chat.types';

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

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
  sent_at?: unknown;
};

export function getCaseChatQueryKey(caseId: string, guestSessionId?: string | null) {
  return ['case-chat', caseId, guestSessionId];
}

export function useCaseChat(caseId: string, guestSessionId?: string | null) {
  return useApiQuery(
    getCaseChatQueryKey(caseId, guestSessionId),
    () => chatApi.listMessages(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      retry: false,
    },
  );
}

export function useSendChatMessage(caseId: string, guestSessionId?: string | null) {
  const queryClient = useQueryClient();

  return useApiMutation((message: string) => chatApi.sendMessage(caseId, message, guestSessionId), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCaseChatQueryKey(caseId, guestSessionId) });
    },
  });
}

const RECONNECT_MAX_ATTEMPTS = 6;
const RECONNECT_MAX_DELAY_MS = 30_000;

export function useCaseChatSocket(caseId: string, guestSessionId?: string | null, enabled = true) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => getCaseChatQueryKey(caseId, guestSessionId),
    [caseId, guestSessionId],
  );
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingRef = useRef<{ id: string; text: string } | null>(null);
  const [status, setStatus] = useState<SocketStatus>('idle');
  const [isSending, setIsSending] = useState(false);
  const canUseSocket = Boolean(enabled && caseId && accessToken && !guestSessionId);

  const upsertMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) => {
        const optimisticIndex = current.findIndex(
          (item) =>
            item.id.startsWith('optimistic-') &&
            item.senderType === message.senderType &&
            item.text === message.text,
        );
        const existingIndex = current.findIndex((item) => item.id === message.id);
        const next = [...current];

        if (existingIndex >= 0) {
          next[existingIndex] = message;
        } else if (optimisticIndex >= 0) {
          next[optimisticIndex] = message;
        } else {
          next.push(message);
        }

        return next.sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
      });
    },
    [queryClient, queryKey],
  );

  const connectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canUseSocket) {
      setStatus('idle');
      return undefined;
    }

    function connect() {
      const socket = new WebSocket(getChatSocketUrl());
      socketRef.current = socket;
      setStatus('connecting');

      socket.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setStatus('connected');
        socket.send(
          JSON.stringify({
            type: 'init',
            token: accessToken,
            case_id: caseId,
          }),
        );
      };

      socket.onmessage = (event) => {
        const raw = parseSocketPayload(event.data);
        const payloads = Array.isArray(raw) ? raw : [raw];

        for (const payload of payloads) {
          if (!payload || typeof payload !== 'object') continue;

          const p = payload as SocketPayload;
          const type = typeof p.type === 'string' ? p.type.toLowerCase() : '';

          if (type === 'delta' || type === 'chunk' || type === 'stream_chunk') {
            const text = getSocketText(p);
            if (!text) continue;

            if (!streamingRef.current) {
              const id = `streaming-ai-${Date.now()}`;
              streamingRef.current = { id, text };
              upsertMessage(createStreamingMessage(id, text, caseId));
            } else {
              streamingRef.current.text += text;
              upsertMessage(
                createStreamingMessage(streamingRef.current.id, streamingRef.current.text, caseId),
              );
            }
            continue;
          }

          if (type === 'stream_end' || type === 'message_complete') {
            streamingRef.current = null;
            continue;
          }

          streamingRef.current = null;
          const messages = normalizeSocketPayload(p, caseId);
          if (messages.length > 0) {
            messages.forEach(upsertMessage);
            queryClient.invalidateQueries({ queryKey });
          }
        }
      };

      function scheduleReconnect() {
        if (socketRef.current !== socket) return;
        socketRef.current = null;
        streamingRef.current = null;

        const attempts = reconnectAttemptsRef.current;
        if (attempts < RECONNECT_MAX_ATTEMPTS && canUseSocket) {
          const delay = Math.min(1000 * 2 ** attempts, RECONNECT_MAX_DELAY_MS);
          reconnectAttemptsRef.current += 1;
          setStatus('connecting');
          reconnectTimerRef.current = setTimeout(() => {
            if (connectRef.current) connectRef.current();
          }, delay);
        } else {
          setStatus('disconnected');
        }
      }

      socket.onerror = () => {
        scheduleReconnect();
      };

      socket.onclose = () => {
        scheduleReconnect();
      };
    }

    connectRef.current = connect;
    connect();

    return () => {
      connectRef.current = null;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      const s = socketRef.current;
      socketRef.current = null;
      streamingRef.current = null;
      if (s) s.close();
    };
  }, [accessToken, canUseSocket, caseId, queryClient, queryKey, upsertMessage]);

  const sendLiveMessage = useCallback(
    async (message: string) => {
      if (!accessToken || !caseId || socketRef.current?.readyState !== WebSocket.OPEN) {
        return false;
      }

      setIsSending(true);

      try {
        const optimisticMessage = createLocalChatMessage(caseId, message);
        upsertMessage(optimisticMessage);
        socketRef.current.send(
          JSON.stringify({
            type: 'message',
            token: accessToken,
            case_id: caseId,
            content: message,
          }),
        );
        return true;
      } catch {
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [accessToken, caseId, upsertMessage],
  );

  return {
    isConnected: status === 'connected',
    isSending,
    reconnectAttempts: reconnectAttemptsRef.current,
    sendLiveMessage,
    status,
  };
}

function getChatSocketUrl() {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, '');
  const socketBaseUrl = baseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');

  return `${socketBaseUrl}/api/v1/ws/chat`;
}

function createStreamingMessage(id: string, text: string, caseId: string): ChatMessage {
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

export function parseSocketPayload(data: unknown) {
  if (typeof data !== 'string') return data;

  try {
    return JSON.parse(data);
  } catch {
    return { type: 'message', content: data };
  }
}

export function normalizeSocketPayload(value: unknown, caseId: string): ChatMessage[] {
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
    (message.sender_type === 'patient' || message.sender_type === 'ai') &&
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
  if (senderType === 'patient' || senderType === 'ai') return senderType;

  if (payload.role === 'user' || payload.role === 'patient') return 'patient';

  return 'ai';
}

function createLocalChatMessage(caseId: string, message: string): ChatMessage {
  const sentAt = new Date().toISOString();

  return {
    id: `optimistic-${sentAt}`,
    senderType: 'patient',
    content: { message },
    text: message,
    medicalCaseId: caseId,
    userId: useAuthStore.getState().user?.id ?? null,
    sentAt,
  };
}
