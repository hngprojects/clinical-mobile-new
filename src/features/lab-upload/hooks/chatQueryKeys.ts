export function getCaseChatQueryKey(caseId: string, guestSessionId?: string | null) {
  return ['case-chat', caseId, guestSessionId ?? null];
}
