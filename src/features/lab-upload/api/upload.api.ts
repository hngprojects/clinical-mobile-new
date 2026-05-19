import { client } from '@/shared/api/client';

import type { ApiSuccessResponse, UploadRequest, UploadResponse } from './upload.types';

async function uploadLabResult(request: UploadRequest): Promise<UploadResponse> {
  const { data } = await client.post<ApiSuccessResponse<UploadResponse>>('/api/v1/upload', request);

  if (!data.data) {
    throw new Error(data.message || 'Upload failed');
  }

  return data.data;
}

export const uploadApi = {
  uploadLabResult,
};
