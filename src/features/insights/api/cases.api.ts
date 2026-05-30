import { client } from '@/shared/api/client';

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

export const casesApi = {
  listCases,
};
