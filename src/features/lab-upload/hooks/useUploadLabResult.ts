import { useApiMutation } from '@/shared/api/hooks';

import { uploadApi } from '../api/upload.api';
import type { UploadRequest } from '../api/upload.types';

export function useUploadLabResult() {
  return useApiMutation((request: UploadRequest) => uploadApi.uploadLabResult(request));
}
