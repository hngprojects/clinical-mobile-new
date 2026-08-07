import { client } from '@/shared/api/client';

import type { ApiSuccessResponse } from './upload.types';
import type { ChatCreateRequest, ChatMessage, ChatResponse } from './chat.types';

function guestHeaders(guestSessionId?: string | null) {
  return guestSessionId ? { 'x-guest-session-id': guestSessionId } : undefined;
}

export function getChatText(content: ChatResponse['content']) {
  if (typeof content.message === 'string') return content.message;
  if (typeof content.text === 'string') return content.text;
  if (typeof content.body === 'string') return content.body;
  if (Object.keys(content).length === 0) return '';

  return JSON.stringify(content);
}

export function mapChatMessage(message: ChatResponse): ChatMessage {
  const text = getChatText(message.content) || message.file?.name || '';

  return {
    id: message.id,
    senderType: message.sender_type,
    content: message.content,
    text,
    medicalCaseId: message.medical_case_id,
    userId: message.user_id,
    file: message.file ?? null,
    sentAt: message.sent_at,
  };
}

async function listMessages(
  caseId: string,
  guestSessionId?: string | null,
): Promise<ChatMessage[]> {
  const { data } = await client.get<ApiSuccessResponse<ChatResponse[]>>(
    `/api/v1/cases/${caseId}/chat`,
    {
      params: { offset: 0, limit: 50 },
      headers: guestHeaders(guestSessionId),
    },
  );

  return data.data?.map(mapChatMessage) ?? [];
}

async function sendMessage(
  caseId: string,
  message: string,
  guestSessionId?: string | null,
): Promise<ChatMessage> {
  const body: ChatCreateRequest = {
    sender_type: 'patient',
    content: { message },
    medical_case_id: caseId,
  };

  const { data } = await client.post<ApiSuccessResponse<ChatResponse>>(
    `/api/v1/cases/${caseId}/chat`,
    body,
    {
      headers: guestHeaders(guestSessionId),
    },
  );

  if (!data.data) {
    throw new Error(data.message || 'Message could not be sent');
  }

  return mapChatMessage(data.data);
}

export const chatApi = {
  listMessages,
  sendMessage,
};
