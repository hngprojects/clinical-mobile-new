export interface ApiSuccessResponse<T> {
  status: string;
  message: string;
  data: T | null;
}

export interface FileObject {
  name: string;
  url: string;
}

export interface UploadFile {
  name: string;
  uri: string;
  mimeType?: string;
}

export interface UploadRequest {
  file: UploadFile;
  guest_session_id?: string | null;
}

export interface UploadChatLabResultRequest {
  caseId: string;
  file: UploadFile;
  note?: string | null;
}

export type OcrStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface LabResultResponse {
  file: FileObject;
  ocr_status: OcrStatus;
  id: string;
  medical_case_id: string;
  extracted_values?: Record<string, unknown> | null;
  ocr_completed_at?: string | null;
  created_at: string;
}

export interface UploadResponse {
  case_id: string;
  lab_result: LabResultResponse;
}
