import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { env } from '@/shared/constants/env';

const STREAM_URL = `${env.API_BASE_URL}/api/v1/notifications/stream`;
const RECONNECT_DELAY_MS = 3_000;

export interface NotificationEvent {
  event: string;
  data: Record<string, unknown>;
}

interface Options {
  enabled?: boolean;
  guestSessionId?: string | null;
  onEvent: (event: NotificationEvent) => void;
}

export function useNotificationStream({ enabled = true, guestSessionId, onEvent }: Options) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    let xhr: XMLHttpRequest | null = null;
    let destroyed = false;
    let lastLength = 0;
    let buffer = '';
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleReconnect() {
      if (destroyed || reconnectTimer) return;

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, RECONNECT_DELAY_MS);
    }

    function connect() {
      if (destroyed) return;

      lastLength = 0;
      buffer = '';
      xhr = new XMLHttpRequest();
      xhr.open('GET', STREAM_URL, true);

      xhr.setRequestHeader('Accept', 'text/event-stream');
      xhr.setRequestHeader('Cache-Control', 'no-cache');

      const token = useAuthStore.getState().accessToken;
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      if (guestSessionId) xhr.setRequestHeader('x-guest-session-id', guestSessionId);

      xhr.onprogress = () => {
        if (!xhr) return;

        const newData = xhr.responseText.slice(lastLength);
        lastLength = xhr.responseText.length;

        buffer += newData;

        // SSE messages are separated by double newlines
        const normalizedBuffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const messages = normalizedBuffer.split('\n\n');
        // Last element may be an incomplete message — keep it in the buffer
        buffer = messages.pop() ?? '';

        for (const message of messages) {
          const trimmed = message.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          let eventType = 'message';
          const dataLines: string[] = [];

          for (const line of trimmed.split('\n')) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
          }

          const dataStr = dataLines.join('\n');
          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);
            const eventData: Record<string, unknown> =
              parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
            onEventRef.current({ event: eventType, data: eventData });
          } catch {
            // ignore malformed JSON
          }
        }
      };

      xhr.onerror = () => {
        scheduleReconnect();
      };

      xhr.onloadend = () => {
        scheduleReconnect();
      };

      xhr.send();
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      xhr?.abort();
      xhr = null;
    };
  }, [enabled, guestSessionId]);
}
