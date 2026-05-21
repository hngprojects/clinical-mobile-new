import { useQueryClient } from '@tanstack/react-query';

import { useApiMutation, useApiQuery } from '@/shared/api/hooks';

import { chatApi } from '../api/chat.api';

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
