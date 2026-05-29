export type NotificationType = 'interpretation_ready' | 'interpretation_failed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: Record<string, unknown> | null;
  data: Record<string, unknown> | null;
  medicalCaseId: string | null;
  userId: string;
  isRead: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  notifyOnComplete: boolean;
}

export interface ListNotificationsParams {
  unreadOnly?: boolean;
  offset?: number;
  limit?: number;
}

export interface UpdatePreferencesRequest {
  notifyOnComplete: boolean;
}
