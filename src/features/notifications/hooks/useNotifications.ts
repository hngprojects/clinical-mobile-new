import { useQueryClient } from '@tanstack/react-query';

import { useApiMutation, useApiQuery } from '@/shared/api/hooks';

import { notificationsApi } from '../api/notifications.api';
import type { ListNotificationsParams, UpdatePreferencesRequest } from '../api/notifications.types';

export const NOTIFICATIONS_KEY = ['notifications'];
export const UNREAD_COUNT_KEY = ['notifications', 'unread-count'];
export const NOTIFICATION_PREFERENCES_KEY = ['notifications', 'preferences'];
const NOTIFICATIONS_REFRESH_INTERVAL_MS = 30_000;

export function useNotifications(params?: ListNotificationsParams) {
  return useApiQuery([...NOTIFICATIONS_KEY, params], () => notificationsApi.list(params), {
    refetchInterval: NOTIFICATIONS_REFRESH_INTERVAL_MS,
  });
}

export function useUnreadCount() {
  return useApiQuery(UNREAD_COUNT_KEY, () => notificationsApi.getUnreadCount(), {
    refetchInterval: NOTIFICATIONS_REFRESH_INTERVAL_MS,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useApiMutation((notificationId: string) => notificationsApi.markRead(notificationId), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useNotificationPreferences() {
  return useApiQuery(NOTIFICATION_PREFERENCES_KEY, () => notificationsApi.getPreferences());
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (req: UpdatePreferencesRequest) => notificationsApi.updatePreferences(req),
    {
      onSuccess: (updated) => {
        queryClient.setQueryData(NOTIFICATION_PREFERENCES_KEY, updated);
      },
    },
  );
}
