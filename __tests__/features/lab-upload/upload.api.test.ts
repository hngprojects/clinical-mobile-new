import { uploadApi } from '@/features/lab-upload/api/upload.api';
import { client } from '@/shared/api/client';

jest.mock('@/shared/api/client', () => ({
  client: {
    post: jest.fn(),
  },
}));

const mockPost = client.post as jest.Mock;
const RealFormData = global.FormData;

class MockFormData {
  parts: [string, unknown][] = [];

  append(name: string, value: unknown) {
    this.parts.push([name, value]);
  }
}

describe('uploadApi', () => {
  beforeEach(() => {
    mockPost.mockReset();
    global.FormData = MockFormData as unknown as typeof FormData;
  });

  afterEach(() => {
    global.FormData = RealFormData;
  });

  it('sends a note when uploading a lab result to an existing case', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'ok',
        data: {
          id: 'lab-1',
          medical_case_id: 'case-1',
          file: { name: 'Blood panel.pdf', url: 'https://cdn.example.com/blood-panel.pdf' },
          ocr_status: 'pending',
          created_at: '2026-05-20T06:33:00.000Z',
        },
      },
    });

    await uploadApi.uploadLabResultToCase({
      caseId: 'case-1',
      file: {
        name: 'Blood panel.pdf',
        uri: 'file:///blood-panel.pdf',
        mimeType: 'application/pdf',
      },
      note: 'Please explain the cholesterol result',
    });

    const formData = mockPost.mock.calls[0][1] as MockFormData;
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/cases/case-1/lab-results',
      expect.any(MockFormData),
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120_000 },
    );
    expect(formData.parts).toEqual(
      expect.arrayContaining([['note', 'Please explain the cholesterol result']]),
    );
  });
});
