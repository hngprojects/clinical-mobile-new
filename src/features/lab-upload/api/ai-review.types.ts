export type AiReviewStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface AiReviewResult {
  status: AiReviewStatus;
  summary?: string;
  markersWithinRange?: number;
  markersNeedingAttention?: number;
  valueBreakdown?: ValueBreakdown[] | null;
  suggestedQuestions?: string[] | null;
  riskLevel?: 'low' | 'moderate' | 'high' | null;
  confidence?: 'low' | 'medium' | 'high' | null;
  id?: string;
  medicalCaseId?: string;
  generatedAt?: string;
}

export interface ValueBreakdown {
  metric: string;
  value: string | number;
  unit?: string | null;
  status?: string | null;
}
