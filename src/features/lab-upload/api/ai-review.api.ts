import { client } from '@/shared/api/client';
import { ApiError } from '@/shared/api/types';

import type { ApiSuccessResponse } from './upload.types';
import type { AiReviewResult, AiReviewStatus } from './ai-review.types';

interface AIInterpretationResponse {
  summary?: string | null;
  value_breakdown?: AiReviewResult['valueBreakdown'];
  suggested_questions?: string[] | null;
  markers_within_range?: number | null;
  markers_needing_attention?: number | null;
  risk_level?: AiReviewResult['riskLevel'];
  confidence?: AiReviewResult['confidence'];
  id: string;
  medical_case_id: string;
  status: AiReviewStatus;
  generated_at: string;
}

interface MedicalCaseDetailResponse {
  case: {
    status: AiReviewStatus;
  };
  interpretation?: AIInterpretationResponse | null;
  interpretations?: AIInterpretationResponse[] | null;
}

interface AIInterpretationListResponse {
  interpretations?: AIInterpretationResponse[] | null;
  items?: AIInterpretationResponse[] | null;
  results?: AIInterpretationResponse[] | null;
}

function mapInterpretation(interpretation: AIInterpretationResponse): AiReviewResult {
  return {
    status: interpretation.status,
    summary: interpretation.summary ?? undefined,
    valueBreakdown: interpretation.value_breakdown,
    suggestedQuestions: interpretation.suggested_questions,
    markersWithinRange: interpretation.markers_within_range ?? undefined,
    markersNeedingAttention: interpretation.markers_needing_attention ?? undefined,
    riskLevel: interpretation.risk_level,
    confidence: interpretation.confidence,
    id: interpretation.id,
    medicalCaseId: interpretation.medical_case_id,
    generatedAt: interpretation.generated_at,
  };
}

function isNoInterpretationYetError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

function getInterpretationList(
  data: AIInterpretationResponse[] | AIInterpretationListResponse | null,
) {
  if (Array.isArray(data)) return data;
  return data?.interpretations ?? data?.items ?? data?.results ?? [];
}

async function getCaseProcessingStatus(
  caseId: string,
  guestSessionId?: string | null,
): Promise<AiReviewResult> {
  const { data } = await client.get<ApiSuccessResponse<MedicalCaseDetailResponse>>(
    `/api/v1/cases/${caseId}/full`,
    {
      headers: guestSessionId ? { 'x-guest-session-id': guestSessionId } : undefined,
    },
  );

  const caseDetail = data.data;

  if (caseDetail?.interpretation) {
    return mapInterpretation(caseDetail.interpretation);
  }

  if (caseDetail?.case.status === 'failed') {
    return { status: 'failed' };
  }

  if (caseDetail?.case.status === 'pending') {
    return { status: 'pending' };
  }

  return { status: 'processing' };
}

async function getLatestInterpretation(
  caseId: string,
  guestSessionId?: string | null,
): Promise<AiReviewResult> {
  try {
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

    return mapInterpretation(interpretation);
  } catch (error) {
    if (isNoInterpretationYetError(error)) {
      return getCaseProcessingStatus(caseId, guestSessionId);
    }

    throw error;
  }
}

async function getInterpretations(
  caseId: string,
  guestSessionId?: string | null,
): Promise<AiReviewResult[]> {
  try {
    const { data } = await client.get<
      ApiSuccessResponse<AIInterpretationResponse[] | AIInterpretationListResponse>
    >(`/api/v1/cases/${caseId}/interpretations`, {
      headers: guestSessionId ? { 'x-guest-session-id': guestSessionId } : undefined,
    });

    return getInterpretationList(data.data).map(mapInterpretation);
  } catch (error) {
    if (!isNoInterpretationYetError(error)) throw error;

    const { data } = await client.get<ApiSuccessResponse<MedicalCaseDetailResponse>>(
      `/api/v1/cases/${caseId}/full`,
      {
        headers: guestSessionId ? { 'x-guest-session-id': guestSessionId } : undefined,
      },
    );

    const interpretations =
      data.data?.interpretations ?? (data.data?.interpretation ? [data.data.interpretation] : []);

    return interpretations.map(mapInterpretation);
  }
}

export const aiReviewApi = {
  getInterpretations,
  getLatestInterpretation,
};
