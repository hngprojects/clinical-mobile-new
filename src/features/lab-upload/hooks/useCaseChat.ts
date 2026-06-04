import { UseQueryOptions, useQueryClient } from '@tanstack/react-query';

import { useApiMutation, useApiQuery } from '@/shared/api/hooks';
import { ApiError } from '@/shared/api/types';

import type { ChatMessage } from '../api/chat.types';
import { chatApi } from '../api/chat.api';

import { getCaseChatQueryKey } from './chatQueryKeys';

export { getCaseChatQueryKey } from './chatQueryKeys';
export {
  getSocketSenderType,
  getSocketText,
  isChatResponse,
  normalizeSocketPayload,
  parseSocketPayload,
} from './chatSocket.utils';
export type { SocketPayload } from './chatSocket.utils';
export { useCaseChatSocket } from './useCaseChatSocket';

export function useCaseChat(
  caseId: string,
  guestSessionId?: string | null,
  options?: Pick<UseQueryOptions<ChatMessage[], ApiError>, 'refetchInterval'>,
) {
  return useApiQuery(
    getCaseChatQueryKey(caseId, guestSessionId),
    () => chatApi.listMessages(caseId, guestSessionId),
    {
      enabled: Boolean(caseId),
      retry: false,
      ...options,
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
