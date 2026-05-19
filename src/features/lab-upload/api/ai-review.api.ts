import { client } from '@/shared/api/client';

import type { ApiSuccessResponse } from './upload.types';
import type { AiReviewResult, AiReviewStatus } from './ai-review.types';

interface AIInterpretationResponse {
  summary?: string | null;
  value_breakdown?: AiReviewResult['valueBreakdown'];
  suggested_questions?: string[] | null;
  risk_level?: AiReviewResult['riskLevel'];
  confidence?: AiReviewResult['confidence'];
  id: string;
  medical_case_id: string;
  status: AiReviewStatus;
  generated_at: string;
}

async function getLatestInterpretation(
  caseId: string,
  guestSessionId?: string | null,
): Promise<AiReviewResult> {
  const { data } = await client.get<ApiSuccessResponse<AIInterpretationResponse>>(
    `/api/v1/cases/${caseId}/interpretations/latest`,
    {
      headers: guestSessionId ? { 'x-guest-session-id': guestSessionId } : undefined,
    },
  );

  const interpretation = data.data;

  if (!interpretation) {
    return { status: 'pending' };
  }

  return {
    status: interpretation.status,
    summary: interpretation.summary ?? undefined,
    valueBreakdown: interpretation.value_breakdown,
    suggestedQuestions: interpretation.suggested_questions,
    riskLevel: interpretation.risk_level,
    confidence: interpretation.confidence,
    id: interpretation.id,
    medicalCaseId: interpretation.medical_case_id,
    generatedAt: interpretation.generated_at,
  };
}

export const aiReviewApi = {
  getLatestInterpretation,
};
