import type { AiReviewResult } from './ai-review.types';

const MOCK_COMPLETE_AFTER_POLLS = 4;
const pollCountsByCase = new Map<string, number>();

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function getLatestInterpretation(caseId: string): Promise<AiReviewResult> {
  await delay(350);

  const nextCount = (pollCountsByCase.get(caseId) ?? 0) + 1;
  pollCountsByCase.set(caseId, nextCount);

  if (nextCount >= MOCK_COMPLETE_AFTER_POLLS) {
    return {
      status: 'complete',
      summary: 'We found 8 markers within range and 2 markers that may need attention.',
      markersWithinRange: 8,
      markersNeedingAttention: 2,
    };
  }

  return {
    status: nextCount === 1 ? 'pending' : 'processing',
  };
}

export const aiReviewApi = {
  getLatestInterpretation,
};
