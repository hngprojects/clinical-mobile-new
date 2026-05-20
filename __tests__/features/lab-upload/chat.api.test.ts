import { chatApi } from '@/features/lab-upload/api/chat.api';
import { client } from '@/shared/api/client';

jest.mock('@/shared/api/client', () => ({
  client: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = client.get as jest.Mock;
const mockPost = client.post as jest.Mock;

describe('chatApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it('lists case chat messages and maps backend fields', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'ok',
        data: [
          {
            id: 'chat-1',
            sender_type: 'ai',
            content: { message: 'Review summary' },
            medical_case_id: 'case-1',
            user_id: null,
            sent_at: '2026-05-20T06:30:00.000Z',
          },
        ],
      },
    });

    await expect(chatApi.listMessages('case-1', 'guest-1')).resolves.toEqual([
      {
        id: 'chat-1',
        senderType: 'ai',
        content: { message: 'Review summary' },
        text: 'Review summary',
        medicalCaseId: 'case-1',
        userId: null,
        sentAt: '2026-05-20T06:30:00.000Z',
      },
    ]);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/cases/case-1/chat', {
      params: { offset: 0, limit: 50 },
      headers: { 'x-guest-session-id': 'guest-1' },
    });
  });

  it('sends a patient message', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'Message sent.',
        data: {
          id: 'chat-2',
          sender_type: 'patient',
          content: { message: 'What does this mean?' },
          medical_case_id: 'case-1',
          user_id: 'user-1',
          sent_at: '2026-05-20T06:31:00.000Z',
        },
      },
    });

    await expect(chatApi.sendMessage('case-1', 'What does this mean?')).resolves.toMatchObject({
      id: 'chat-2',
      senderType: 'patient',
      text: 'What does this mean?',
    });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/cases/case-1/chat',
      {
        sender_type: 'patient',
        content: { message: 'What does this mean?' },
        medical_case_id: 'case-1',
      },
      {
        headers: undefined,
      },
    );
  });

  it('supports text content fallback', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'ok',
        data: [
          {
            id: 'chat-3',
            sender_type: 'ai',
            content: { text: 'Fallback text' },
            medical_case_id: 'case-1',
            user_id: null,
            sent_at: '2026-05-20T06:32:00.000Z',
          },
        ],
      },
    });

    await expect(chatApi.listMessages('case-1')).resolves.toMatchObject([
      { id: 'chat-3', text: 'Fallback text' },
    ]);
  });
});
