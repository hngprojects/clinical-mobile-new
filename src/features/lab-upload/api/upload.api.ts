import { client } from '@/shared/api/client';

import type {
  ApiSuccessResponse,
  LabResultResponse,
  UploadChatLabResultRequest,
  UploadRequest,
  UploadResponse,
} from './upload.types';

function inferMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'png') return 'image/png';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'webp') return 'image/webp';

  return 'application/octet-stream';
}

async function uploadLabResult(request: UploadRequest): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: request.file.uri,
    name: request.file.name,
    type: request.file.mimeType ?? inferMimeType(request.file.name),
  } as unknown as Blob);

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };

  if (request.guest_session_id) {
    headers['x-guest-session-id'] = request.guest_session_id;
  }

  const { data } = await client.post<ApiSuccessResponse<UploadResponse>>(
    '/api/v1/upload',
    formData,
    { headers: { ...headers, 'Content-Type': 'multipart/form-data' } },
  );

  if (!data.data) {
    throw new Error(data.message || 'Upload failed');
  }

  return data.data;
}

async function uploadLabResultToCase(
  request: UploadChatLabResultRequest,
): Promise<LabResultResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: request.file.uri,
    name: request.file.name,
    type: request.file.mimeType ?? inferMimeType(request.file.name),
  } as unknown as Blob);

  const { data } = await client.post<ApiSuccessResponse<LabResultResponse>>(
    `/api/v1/cases/${request.caseId}/lab-results`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (!data.data) {
    throw new Error(data.message || 'Upload failed');
  }

  return data.data;
}

export const uploadApi = {
  uploadLabResult,
  uploadLabResultToCase,
};
