import { client } from '@/shared/api/client';

import type { ApiSuccessResponse, UploadRequest, UploadResponse } from './upload.types';

async function uploadLabResult(request: UploadRequest): Promise<UploadResponse> {
  let fileUrl = request.file.url;

  if (fileUrl.startsWith('file://') || fileUrl.startsWith('content://')) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Could not read selected file for upload: ${response.status}`);
    }

    const blob = await response.blob();

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    fileUrl = base64Data;
  }

  const { data } = await client.post<ApiSuccessResponse<UploadResponse>>('/api/v1/upload', {
    ...request,
    file: {
      ...request.file,
      url: fileUrl,
    },
  });

  if (!data.data) {
    throw new Error(data.message || 'Upload failed');
  }

  return data.data;
}

export const uploadApi = {
  uploadLabResult,
};
