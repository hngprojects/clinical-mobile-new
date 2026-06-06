import {
  notificationsApi,
  sortNotificationsNewestFirst,
} from '@/features/notifications/api/notifications.api';
import type { Notification } from '@/features/notifications/api/notifications.types';
import { client } from '@/shared/api/client';

jest.mock('@/shared/api/client', () => ({
  client: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockGet = client.get as jest.Mock;
const mockPatch = client.patch as jest.Mock;

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

function backendNotification(id: string) {
  return {
    id,
    type: 'interpretation_ready',
    title: 'AI Analysis Complete',
    message: null,
    data: null,
    medical_case_id: `case-${id}`,
    user_id: 'user-1',
    is_read: false,
    read_at: null,
    delivered_at: null,
    created_at: '2026-06-04T11:00:00.000Z',
  };
}

describe('sortNotificationsNewestFirst', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
  });

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

describe('notificationsApi.markAllRead', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
  });

  it('fetches every unread page and marks every unique notification', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      backendNotification(`notification-${index}`),
    );
    const secondPage = [
      backendNotification('notification-100'),
      backendNotification('known-notification'),
    ];

    mockGet
      .mockResolvedValueOnce({ data: { data: firstPage } })
      .mockResolvedValueOnce({ data: { data: secondPage } });
    mockPatch.mockImplementation((url: string) => {
      const id = url.split('/').at(-2) ?? '';
      return Promise.resolve({ data: { data: backendNotification(id) } });
    });

    await expect(notificationsApi.markAllRead(['known-notification'])).resolves.toEqual({
      markedCount: 102,
      failedCount: 0,
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/v1/notifications', {
      params: { unread_only: true, offset: 0, limit: 100 },
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v1/notifications', {
      params: { unread_only: true, offset: 100, limit: 100 },
    });
    expect(mockPatch).toHaveBeenCalledTimes(102);
  });
});
