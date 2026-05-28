import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/auth.store';

import type { ChatMessage } from '../api/chat.types';

import { getCaseChatQueryKey } from './chatQueryKeys';
import {
  createPendingResponseMessage,
  createStreamingMessage,
  getChatSocketUrl,
  getSocketText,
  mergeResponseText,
  normalizeSocketPayload,
  parseSocketPayload,
  type SocketPayload,
} from './chatSocket.utils';

type SocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'session_expired';

const RECONNECT_MAX_ATTEMPTS = 6;
const RECONNECT_MAX_DELAY_MS = 30_000;
const RESPONSE_SETTLE_DELAY_MS = 1500;

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
  const responseSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamingRef = useRef<{ id: string; text: string } | null>(null);
  const pendingResponseIdRef = useRef<string | null>(null);
  const sessionExpiredRef = useRef(false);
  const [status, setStatus] = useState<SocketStatus>('idle');
  const [isSending, setIsSending] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const canUseSocket = Boolean(enabled && caseId && accessToken && !guestSessionId);

  const upsertMessage = useCallback(
    (message: ChatMessage) => {
      const pendingResponseId = pendingResponseIdRef.current;
      const shouldClearPending = Boolean(message.senderType === 'ai' && pendingResponseId);

      if (shouldClearPending) {
        pendingResponseIdRef.current = null;
        setIsAwaitingResponse(false);
      }

      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) => {
        const source = shouldClearPending
          ? current.filter((item) => item.id !== pendingResponseId)
          : current;
        const optimisticIndex = source.findIndex(
          (item) =>
            item.id.startsWith('optimistic-') &&
            item.senderType === message.senderType &&
            item.text === message.text,
        );
        const existingIndex = source.findIndex((item) => item.id === message.id);
        const next = [...source];

        if (existingIndex >= 0) {
          next[existingIndex] = message;
        } else if (optimisticIndex >= 0) {
          const nextOptimisticIndex = next.findIndex(
            (item) =>
              item.id.startsWith('optimistic-') &&
              item.senderType === message.senderType &&
              item.text === message.text,
          );
          if (nextOptimisticIndex >= 0) next[nextOptimisticIndex] = message;
        } else {
          next.push(message);
        }

        return next.sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt));
      });
    },
    [queryClient, queryKey],
  );

  const addPendingResponse = useCallback(() => {
    const previousPendingId = pendingResponseIdRef.current;
    const id = `pending-ai-${Date.now()}`;
    pendingResponseIdRef.current = id;
    setIsAwaitingResponse(true);

    queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) => {
      const withoutPending = previousPendingId
        ? current.filter((item) => item.id !== previousPendingId)
        : current;

      return [...withoutPending, createPendingResponseMessage(id, caseId)].sort(
        (a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt),
      );
    });
  }, [caseId, queryClient, queryKey]);

  const removePendingResponse = useCallback(() => {
    const id = pendingResponseIdRef.current;
    pendingResponseIdRef.current = null;
    setIsAwaitingResponse(false);

    if (!id) return;

    queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) =>
      current.filter((item) => item.id !== id),
    );
  }, [queryClient, queryKey]);

  const clearResponseSettleTimer = useCallback(() => {
    if (responseSettleTimerRef.current !== null) {
      clearTimeout(responseSettleTimerRef.current);
      responseSettleTimerRef.current = null;
    }
  }, []);

  const flushBufferedResponse = useCallback(() => {
    clearResponseSettleTimer();

    const streamed = streamingRef.current;
    streamingRef.current = null;

    if (streamed?.text.trim()) {
      upsertMessage(createStreamingMessage(streamed.id, streamed.text.trim(), caseId));
    } else {
      removePendingResponse();
    }
  }, [caseId, clearResponseSettleTimer, removePendingResponse, upsertMessage]);

  const bufferAiResponse = useCallback(
    (text: string) => {
      if (!text) return;

      if (!streamingRef.current) {
        streamingRef.current = { id: `streaming-ai-${Date.now()}`, text };
      } else {
        streamingRef.current.text = mergeResponseText(streamingRef.current.text, text);
      }

      clearResponseSettleTimer();
      responseSettleTimerRef.current = setTimeout(flushBufferedResponse, RESPONSE_SETTLE_DELAY_MS);
    },
    [clearResponseSettleTimer, flushBufferedResponse],
  );

  const connectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canUseSocket) {
      setStatus('idle');
      return undefined;
    }

    function connect() {
      sessionExpiredRef.current = false;
      const socket = new WebSocket(getChatSocketUrl());
      socketRef.current = socket;
      setStatus('connecting');

      function stopForSessionExpired() {
        sessionExpiredRef.current = true;
        socketRef.current = null;
        clearResponseSettleTimer();
        streamingRef.current = null;
        removePendingResponse();
        setStatus('session_expired');

        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }

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

            bufferAiResponse(text);
            continue;
          }

          if (type === 'stream_end' || type === 'message_complete') {
            const text = getSocketText(p);
            if (text) bufferAiResponse(text);
            flushBufferedResponse();
            continue;
          }

          if (type === 'error') {
            if (isAuthSocketFailure(p)) {
              stopForSessionExpired();
              continue;
            }

            clearResponseSettleTimer();
            streamingRef.current = null;
            removePendingResponse();
            continue;
          }

          const messages = normalizeSocketPayload(p, caseId);
          if (messages.length > 0) {
            const bufferedAnyMessage = messages.some((message) => {
              if (pendingResponseIdRef.current && message.senderType === 'ai') {
                bufferAiResponse(message.text);
                return true;
              }

              upsertMessage(message);
              return false;
            });

            if (!bufferedAnyMessage) {
              queryClient.invalidateQueries({ queryKey });
            }
          }
        }
      };

      function scheduleReconnect() {
        if (sessionExpiredRef.current) {
          setStatus('session_expired');
          return;
        }

        if (socketRef.current !== socket) return;
        socketRef.current = null;
        clearResponseSettleTimer();
        streamingRef.current = null;
        removePendingResponse();

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

      socket.onclose = (event) => {
        if (isAuthSocketClose(event)) {
          stopForSessionExpired();
          return;
        }

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
      clearResponseSettleTimer();
      streamingRef.current = null;
      removePendingResponse();
      if (s) s.close();
    };
  }, [
    accessToken,
    canUseSocket,
    caseId,
    bufferAiResponse,
    clearResponseSettleTimer,
    flushBufferedResponse,
    queryClient,
    queryKey,
    removePendingResponse,
    upsertMessage,
  ]);

  const sendLiveMessage = useCallback(
    async (message: string) => {
      if (!accessToken || !caseId || socketRef.current?.readyState !== WebSocket.OPEN) {
        return false;
      }

      setIsSending(true);

      try {
        const optimisticMessage = createLocalChatMessage(caseId, message);
        upsertMessage(optimisticMessage);
        addPendingResponse();
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
        removePendingResponse();
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [accessToken, addPendingResponse, caseId, removePendingResponse, upsertMessage],
  );

  return {
    isConnected: status === 'connected',
    isSending: isSending || isAwaitingResponse,
    reconnectAttempts: reconnectAttemptsRef.current,
    sendLiveMessage,
    status,
  };
}

function isAuthSocketClose(event: WebSocketCloseEvent) {
  if (event.code === 1008 || event.code === 4001 || event.code === 4401 || event.code === 4403) {
    return true;
  }

  return isAuthFailureText(event.reason ?? '');
}

function isAuthSocketFailure(payload: SocketPayload) {
  return isAuthFailureText(getSocketFailureText(payload));
}

function getSocketFailureText(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(getSocketFailureText).join(' ');
  if (typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  return ['message', 'detail', 'error', 'content', 'text', 'reason', 'code', 'status']
    .map((key) => getSocketFailureText(record[key]))
    .filter(Boolean)
    .join(' ');
}

function isAuthFailureText(value: string) {
  const text = value.toLowerCase();

  return (
    text.includes('401') ||
    text.includes('403') ||
    text.includes('unauthorized') ||
    text.includes('unauthenticated') ||
    text.includes('forbidden') ||
    text.includes('expired') ||
    text.includes('invalid token') ||
    text.includes('token expired') ||
    text.includes('session expired')
  );
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
