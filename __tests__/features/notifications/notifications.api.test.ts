import { sortNotificationsNewestFirst } from '@/features/notifications/api/notifications.api';
import type { Notification } from '@/features/notifications/api/notifications.types';

function notification(id: string, createdAt: string): Notification {
  return {
    id,
    type: 'interpretation_ready',
    title: 'AI Analysis Complete',
    message: null,
    data: null,
    medicalCaseId: `case-${id}`,
    userId: 'user-1',
    isRead: false,
    readAt: null,
    deliveredAt: null,
    createdAt,
  };
}

describe('sortNotificationsNewestFirst', () => {
  it('places the latest notification first without mutating the original list', () => {
    const original = [
      notification('older', '2026-06-04T09:00:00.000Z'),
      notification('latest', '2026-06-04T11:00:00.000Z'),
      notification('middle', '2026-06-04T10:00:00.000Z'),
    ];

    const sorted = sortNotificationsNewestFirst(original);

    expect(sorted.map((item) => item.id)).toEqual(['latest', 'middle', 'older']);
    expect(original.map((item) => item.id)).toEqual(['older', 'latest', 'middle']);
  });

  it('places notifications with invalid timestamps after valid timestamps', () => {
    const sorted = sortNotificationsNewestFirst([
      notification('invalid', 'not-a-date'),
      notification('valid', '2026-06-04T11:00:00.000Z'),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['valid', 'invalid']);
  });
});
