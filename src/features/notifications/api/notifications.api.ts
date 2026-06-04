import { client } from '@/shared/api/client';

import type {
  ListNotificationsParams,
  Notification,
  NotificationPreferences,
  UpdatePreferencesRequest,
} from './notifications.types';

interface ApiSuccessResponse<T> {
  status: string;
  message: string;
  data: T | null;
}

interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: Record<string, unknown> | null;
  data: Record<string, unknown> | null;
  medical_case_id: string | null;
  user_id: string;
  is_read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

interface BackendPreferences {
  notify_on_complete: boolean;
}

const UNREAD_PAGE_SIZE = 100;
const MARK_READ_BATCH_SIZE = 20;

function mapNotification(raw: BackendNotification): Notification {
  return {
    id: raw.id,
    type: raw.type as Notification['type'],
    title: raw.title,
    message: raw.message,
    data: raw.data,
    medicalCaseId: raw.medical_case_id,
    userId: raw.user_id,
    isRead: raw.is_read,
    readAt: raw.read_at,
    deliveredAt: raw.delivered_at,
    createdAt: raw.created_at,
  };
}

function mapPreferences(raw: BackendPreferences): NotificationPreferences {
  return { notifyOnComplete: raw.notify_on_complete };
}

export function sortNotificationsNewestFirst(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => {
    const aCreatedAt = Date.parse(a.createdAt);
    const bCreatedAt = Date.parse(b.createdAt);
    const aTimestamp = Number.isNaN(aCreatedAt) ? 0 : aCreatedAt;
    const bTimestamp = Number.isNaN(bCreatedAt) ? 0 : bCreatedAt;
    return bTimestamp - aTimestamp;
  });
}

async function list(params?: ListNotificationsParams): Promise<Notification[]> {
  const { data } = await client.get<ApiSuccessResponse<BackendNotification[]>>(
    '/api/v1/notifications',
    {
      params: {
        unread_only: params?.unreadOnly,
        offset: params?.offset,
        limit: params?.limit,
      },
    },
  );
  return sortNotificationsNewestFirst((data.data ?? []).map(mapNotification));
}

async function getUnreadCount(): Promise<number> {
  const { data } = await client.get<ApiSuccessResponse<{ unread_count: number }>>(
    '/api/v1/notifications/unread-count',
  );
  return data.data?.unread_count ?? 0;
}

async function markRead(notificationId: string): Promise<Notification> {
  const { data } = await client.patch<ApiSuccessResponse<BackendNotification>>(
    `/api/v1/notifications/${notificationId}/read`,
  );
  if (!data.data) throw new Error(`Failed to mark notification ${notificationId} as read`);
  return mapNotification(data.data);
}

async function markAllRead(knownUnreadIds: string[] = []) {
  const unreadIds = new Set(knownUnreadIds);
  let offset = 0;

  while (true) {
    const page = await list({ unreadOnly: true, offset, limit: UNREAD_PAGE_SIZE });
    const previousSize = unreadIds.size;
    page.forEach((notification) => unreadIds.add(notification.id));

    if (page.length < UNREAD_PAGE_SIZE || unreadIds.size === previousSize) break;
    offset += page.length;
  }

  const ids = [...unreadIds];
  const results: PromiseSettledResult<Notification>[] = [];

  for (let index = 0; index < ids.length; index += MARK_READ_BATCH_SIZE) {
    const batch = ids.slice(index, index + MARK_READ_BATCH_SIZE);
    results.push(...(await Promise.allSettled(batch.map(markRead))));
  }

  return {
    markedCount: results.filter((result) => result.status === 'fulfilled').length,
    failedCount: results.filter((result) => result.status === 'rejected').length,
  };
}

async function getPreferences(): Promise<NotificationPreferences> {
  const { data } = await client.get<ApiSuccessResponse<BackendPreferences>>(
    '/api/v1/notifications/preferences',
  );
  if (!data.data) throw new Error('Failed to fetch notification preferences');
  return mapPreferences(data.data);
}

async function updatePreferences(req: UpdatePreferencesRequest): Promise<NotificationPreferences> {
  const { data } = await client.patch<ApiSuccessResponse<BackendPreferences>>(
    '/api/v1/notifications/preferences',
    { notify_on_complete: req.notifyOnComplete },
  );
  if (!data.data) throw new Error('Failed to update notification preferences');
  return mapPreferences(data.data);
}

export const notificationsApi = {
  list,
  getUnreadCount,
  markRead,
  markAllRead,
  getPreferences,
  updatePreferences,
};
