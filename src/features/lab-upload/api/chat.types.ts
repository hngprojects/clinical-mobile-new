export type ChatSenderType = 'patient' | 'ai';

export interface ChatContent {
  message?: string;
  text?: string;
  body?: string;
  [key: string]: unknown;
}

export interface ChatResponse {
  sender_type: ChatSenderType;
  content: ChatContent;
  medical_case_id: string;
  id: string;
  user_id: string | null;
  sent_at: string;
}

export interface ChatCreateRequest {
  sender_type: ChatSenderType;
  content: ChatContent;
  medical_case_id: string;
  user_id?: string | null;
}

export interface ChatMessage {
  id: string;
  senderType: ChatSenderType;
  content: ChatContent;
  text: string;
  medicalCaseId: string;
  userId: string | null;
  sentAt: string;
}
