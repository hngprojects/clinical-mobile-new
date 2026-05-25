import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { env } from '@/shared/constants/env';

const STREAM_URL = `${env.API_BASE_URL}/api/v1/notifications/stream`;

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

    const controller = new AbortController();

    async function connect() {
      const token = useAuthStore.getState().accessToken;

      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      };

      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (guestSessionId) headers['x-guest-session-id'] = guestSessionId;

      try {
        const response = await fetch(STREAM_URL, { headers, signal: controller.signal });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE messages are separated by double newlines
          const messages = buffer.split('\n\n');
          buffer = messages.pop() ?? '';

          for (const message of messages) {
            const trimmed = message.trim();
            if (!trimmed || trimmed.startsWith(':')) continue; // skip pings/comments

            let eventType = 'message';
            let dataStr = '';

            for (const line of trimmed.split('\n')) {
              if (line.startsWith('event:')) eventType = line.slice(6).trim();
              else if (line.startsWith('data:')) dataStr = line.slice(5).trim();
            }

            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              // Backend wraps case_id inside a nested `data` field
              const eventData: Record<string, unknown> =
                parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
              onEventRef.current({ event: eventType, data: eventData });
            } catch {
              // ignore malformed JSON
            }
          }
        }
      } catch {
        // aborted or network error — polling fallback in useAiReview handles recovery
      }
    }

    connect();

    return () => controller.abort();
  }, [enabled, guestSessionId]);
}
