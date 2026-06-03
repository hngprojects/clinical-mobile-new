import * as FileSystem from 'expo-file-system/legacy';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { client } from '@/shared/api/client';
import { env } from '@/shared/constants/env';

export interface CaseListItem {
  completed_at: string | null;
  created_at: string;
  guest_session_id: string | null;
  id: string;
  status: 'pending' | 'completed' | 'failed';
  title: string;
  user_id: string | null;
}

export interface CasesListResponse {
  data: CaseListItem[];
  message: string;
  status: string;
}

async function listCases(offset = 0, limit = 50): Promise<CasesListResponse> {
  const { data } = await client.get<CasesListResponse>('/api/v1/cases', {
    params: { offset, limit },
  });

  return data;
}

async function updateCaseTitle(caseId: string, title: string): Promise<void> {
  const response = await client.patch(`/api/v1/cases/${caseId}`, { title });

  if (__DEV__) {
    console.log('[Insights rename response]', response.data);
  }

  return;
}

async function exportCasePdf(caseId: string): Promise<string> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const dest = `${FileSystem.cacheDirectory}insight_${caseId}.pdf`;
  const { status } = await FileSystem.downloadAsync(
    `${env.API_BASE_URL}/api/v1/cases/${caseId}/export`,
    dest,
    { headers },
  );

  if (status !== 200) throw new Error(`Export failed with status ${status}`);
  return dest;
}

export const casesApi = {
  listCases,
  updateCaseTitle,
  exportCasePdf,
};
