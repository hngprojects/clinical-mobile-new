import { aiReviewApi } from '@/features/lab-upload/api/ai-review.api';
import { client } from '@/shared/api/client';
import { ApiError } from '@/shared/api/types';

jest.mock('@/shared/api/client', () => ({
  client: {
    get: jest.fn(),
  },
}));

const mockGet = client.get as jest.Mock;

describe('aiReviewApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('maps a completed latest interpretation response', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'OK',
        data: {
          id: 'interpretation-1',
          medical_case_id: 'case-1',
          status: 'complete',
          summary: 'Review summary',
          value_breakdown: null,
          suggested_questions: ['What should I ask next?'],
          risk_level: 'low',
          confidence: 'high',
          generated_at: '2026-05-19T20:00:00.000Z',
        },
      },
    });

    await expect(aiReviewApi.getLatestInterpretation('case-1', 'guest-1')).resolves.toMatchObject({
      status: 'complete',
      summary: 'Review summary',
      medicalCaseId: 'case-1',
    });
    expect(mockGet).toHaveBeenCalledWith('/api/v1/cases/case-1/interpretations/latest', {
      headers: { 'x-guest-session-id': 'guest-1' },
    });
  });

  it('treats a missing interpretation on a processing case as processing', async () => {
    mockGet
      .mockRejectedValueOnce(new ApiError('No interpretation found for this case.', 404))
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'OK',
          data: {
            case: { status: 'processing' },
            interpretation: null,
          },
        },
      });

    await expect(aiReviewApi.getLatestInterpretation('case-1', 'guest-1')).resolves.toEqual({
      status: 'processing',
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v1/cases/case-1/full', {
      headers: { 'x-guest-session-id': 'guest-1' },
    });
  });

  it('treats a missing interpretation on a failed case as failed', async () => {
    mockGet
      .mockRejectedValueOnce(new ApiError('No interpretation found for this case.', 404))
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'OK',
          data: {
            case: { status: 'failed' },
            interpretation: null,
          },
        },
      });

    await expect(aiReviewApi.getLatestInterpretation('case-1')).resolves.toEqual({
      status: 'failed',
    });
  });
});
