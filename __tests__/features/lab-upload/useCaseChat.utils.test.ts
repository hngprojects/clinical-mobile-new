import {
  getSocketSenderType,
  getSocketText,
  isChatResponse,
  normalizeSocketPayload,
  parseSocketPayload,
} from '@/features/lab-upload/hooks/useCaseChat';
import type { SocketPayload } from '@/features/lab-upload/hooks/useCaseChat';

const CASE_ID = 'case-abc';

const VALID_CHAT_RESPONSE = {
  id: 'msg-1',
  sender_type: 'ai' as const,
  content: { message: 'Hello' },
  medical_case_id: CASE_ID,
  user_id: null,
  sent_at: '2026-05-20T10:00:00.000Z',
};

describe('parseSocketPayload', () => {
  it('parses a JSON string into an object', () => {
    const result = parseSocketPayload(JSON.stringify({ type: 'message', content: 'hi' }));
    expect(result).toEqual({ type: 'message', content: 'hi' });
  });

  it('returns a synthetic object for non-JSON strings', () => {
    expect(parseSocketPayload('plain text')).toEqual({ type: 'message', content: 'plain text' });
  });

  it('returns non-string values unchanged', () => {
    const obj = { type: 'ping' };
    expect(parseSocketPayload(obj)).toBe(obj);
  });
});

describe('isChatResponse', () => {
  it('returns true for a valid ChatResponse', () => {
    expect(isChatResponse(VALID_CHAT_RESPONSE)).toBe(true);
  });

  it('returns false when id is missing', () => {
    const { id: _id, ...rest } = VALID_CHAT_RESPONSE;
    expect(isChatResponse(rest)).toBe(false);
  });

  it('returns false when medical_case_id is missing', () => {
    const { medical_case_id: _m, ...rest } = VALID_CHAT_RESPONSE;
    expect(isChatResponse(rest)).toBe(false);
  });

  it('returns false when sent_at is missing', () => {
    const { sent_at: _s, ...rest } = VALID_CHAT_RESPONSE;
    expect(isChatResponse(rest)).toBe(false);
  });

  it('returns false for unrecognised sender_type', () => {
    expect(isChatResponse({ ...VALID_CHAT_RESPONSE, sender_type: 'bot' })).toBe(false);
  });

  it('returns false when content is null', () => {
    expect(isChatResponse({ ...VALID_CHAT_RESPONSE, content: null })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isChatResponse(null)).toBe(false);
  });

  it('returns false for a plain string', () => {
    expect(isChatResponse('hello')).toBe(false);
  });
});

describe('getSocketText', () => {
  it('prefers content string over all other fields', () => {
    const payload: SocketPayload = {
      content: 'from content',
      text: 'from text',
      delta: 'from delta',
    };
    expect(getSocketText(payload)).toBe('from content');
  });

  it('falls back to text when content is not a string', () => {
    const payload: SocketPayload = { content: { message: 'nested' }, text: 'from text' };
    expect(getSocketText(payload)).toBe('from text');
  });

  it('falls back to delta', () => {
    expect(getSocketText({ delta: 'from delta' })).toBe('from delta');
  });

  it('falls back to chunk', () => {
    expect(getSocketText({ chunk: 'from chunk' })).toBe('from chunk');
  });

  it('falls back to message string', () => {
    expect(getSocketText({ message: 'from message' })).toBe('from message');
  });

  it('uses getChatText when content is an object with message', () => {
    expect(getSocketText({ content: { message: 'nested message' } })).toBe('nested message');
  });

  it('returns empty string when no text field is present', () => {
    expect(getSocketText({})).toBe('');
  });
});

describe('getSocketSenderType', () => {
  it('returns patient for sender_type patient', () => {
    expect(getSocketSenderType({ sender_type: 'patient' })).toBe('patient');
  });

  it('returns ai for sender_type ai', () => {
    expect(getSocketSenderType({ sender_type: 'ai' })).toBe('ai');
  });

  it('maps role user to patient', () => {
    expect(getSocketSenderType({ role: 'user' })).toBe('patient');
  });

  it('maps role patient to patient', () => {
    expect(getSocketSenderType({ role: 'patient' })).toBe('patient');
  });

  it('defaults to ai for unknown values', () => {
    expect(getSocketSenderType({})).toBe('ai');
    expect(getSocketSenderType({ sender_type: 'bot' })).toBe('ai');
  });
});

describe('normalizeSocketPayload', () => {
  it('maps a top-level ChatResponse to a ChatMessage', () => {
    const result = normalizeSocketPayload(VALID_CHAT_RESPONSE, CASE_ID);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'msg-1',
      senderType: 'ai',
      text: 'Hello',
      medicalCaseId: CASE_ID,
      userId: null,
      sentAt: '2026-05-20T10:00:00.000Z',
    });
  });

  it('unwraps a ChatResponse nested under data', () => {
    const result = normalizeSocketPayload({ data: VALID_CHAT_RESPONSE }, CASE_ID);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('msg-1');
  });

  it('maps an array of ChatResponses nested under data', () => {
    const second = { ...VALID_CHAT_RESPONSE, id: 'msg-2' };
    const result = normalizeSocketPayload({ data: [VALID_CHAT_RESPONSE, second] }, CASE_ID);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(['msg-1', 'msg-2']);
  });

  it('maps a top-level array of ChatResponses', () => {
    const second = { ...VALID_CHAT_RESPONSE, id: 'msg-2' };
    const result = normalizeSocketPayload([VALID_CHAT_RESPONSE, second], CASE_ID);
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.id)).toEqual(['msg-1', 'msg-2']);
  });

  it('returns [] for init / connected / ack / pong types', () => {
    for (const type of ['init', 'connected', 'ack', 'pong']) {
      expect(normalizeSocketPayload({ type, content: 'ignored' }, CASE_ID)).toHaveLength(0);
    }
  });

  it('returns [] for error type', () => {
    expect(normalizeSocketPayload({ type: 'error', content: 'bad' }, CASE_ID)).toHaveLength(0);
  });

  it('constructs a message from a plain text payload', () => {
    const result = normalizeSocketPayload({ type: 'message', content: 'plain reply' }, CASE_ID);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('plain reply');
    expect(result[0].senderType).toBe('ai');
    expect(result[0].medicalCaseId).toBe(CASE_ID);
  });

  it('returns [] when there is no extractable text', () => {
    expect(normalizeSocketPayload({ type: 'message' }, CASE_ID)).toHaveLength(0);
  });

  it('returns [] for null or non-object input', () => {
    expect(normalizeSocketPayload(null, CASE_ID)).toHaveLength(0);
    expect(normalizeSocketPayload('string', CASE_ID)).toHaveLength(0);
    expect(normalizeSocketPayload(42, CASE_ID)).toHaveLength(0);
  });

  it('uses sent_at from payload when available', () => {
    const payload: SocketPayload = {
      type: 'message',
      content: 'hi',
      sent_at: '2026-01-01T00:00:00.000Z',
    };
    const result = normalizeSocketPayload(payload, CASE_ID);
    expect(result[0].sentAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('falls back to case_id in payload over hook caseId for medicalCaseId', () => {
    const payload: SocketPayload = {
      type: 'message',
      content: 'hi',
      case_id: 'case-from-payload',
    };
    const result = normalizeSocketPayload(payload, CASE_ID);
    expect(result[0].medicalCaseId).toBe('case-from-payload');
  });
});
