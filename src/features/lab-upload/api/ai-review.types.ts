export type AiReviewStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface AiReviewResult {
  status: AiReviewStatus;
  summary?: string;
  markersWithinRange?: number;
  markersNeedingAttention?: number;
}
