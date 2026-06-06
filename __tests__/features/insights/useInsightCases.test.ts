import { mapCasesToInsightItems } from '@/features/insights/hooks/useInsightCases';

describe('mapCasesToInsightItems', () => {
  it('preserves backend case ids for chat navigation', () => {
    const [item] = mapCasesToInsightItems([
      {
        completed_at: null,
        created_at: 'not-a-date',
        guest_session_id: null,
        id: 'case-123',
        status: 'complete',
        title: 'CBC Review',
        user_id: 'user-1',
      },
    ]);

    expect(item).toEqual({
      id: 'case-123',
      caseId: 'case-123',
      title: 'CBC Review',
      subtitle: 'Unknown time',
    });
  });
});
