#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://api.staging.clinsight.hng14.com';
const TERMINAL_STATUSES = new Set(['complete', 'failed']);

function readDotEnv() {
  try {
    return Object.fromEntries(
      String(readFileSync('.env'))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );
  } catch {
    return {};
  }
}

function parseArgs(argv) {
  const args = {
    filePath: null,
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    guestSessionId: `guest-local-${Date.now()}`,
    authToken: process.env.CLINSIGHT_AUTH_TOKEN,
    intervalMs: 1200,
    timeoutMs: 120000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--base-url') args.baseUrl = argv[++index];
    else if (value === '--guest-session-id') args.guestSessionId = argv[++index];
    else if (value === '--auth-token') args.authToken = argv[++index];
    else if (value === '--interval-ms') args.intervalMs = Number(argv[++index]);
    else if (value === '--timeout-ms') args.timeoutMs = Number(argv[++index]);
    else if (!args.filePath) args.filePath = value;
    else throw new Error(`Unknown argument: ${value}`);
  }

  const dotenv = readDotEnv();
  args.baseUrl = args.baseUrl || dotenv.EXPO_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
  return args;
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.pdf') return 'application/pdf';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  throw new Error('Use a PDF, JPG, JPEG, or PNG file.');
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.message || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function upload({ baseUrl, filePath, guestSessionId, authToken }) {
  const absolutePath = path.resolve(filePath);
  const buffer = await readFile(absolutePath);
  const mimeType = getMimeType(absolutePath);
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const fileName = path.basename(absolutePath);

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const body = {
    file: {
      name: fileName,
      url: dataUrl,
    },
  };

  if (!authToken && guestSessionId) {
    body.guest_session_id = guestSessionId;
  }

  console.log(`Uploading ${fileName} to ${baseUrl}/api/v1/upload`);
  const result = await requestJson(`${baseUrl}/api/v1/upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!result?.data?.case_id) {
    throw new Error(`Upload succeeded but no case_id was returned: ${JSON.stringify(result)}`);
  }

  return result.data;
}

async function getCaseProcessingStatus({ baseUrl, caseId, guestSessionId, authToken }) {
  const headers = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  else if (guestSessionId) headers['x-guest-session-id'] = guestSessionId;

  const result = await requestJson(`${baseUrl}/api/v1/cases/${caseId}/full`, { headers });
  const status = result?.data?.interpretation?.status || result?.data?.case?.status || 'processing';
  return { status, source: 'case-full', body: result };
}

async function getLatestInterpretation({ baseUrl, caseId, guestSessionId, authToken }) {
  const headers = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  else if (guestSessionId) headers['x-guest-session-id'] = guestSessionId;

  try {
    const result = await requestJson(`${baseUrl}/api/v1/cases/${caseId}/interpretations/latest`, {
      headers,
    });
    return {
      status: result?.data?.status || 'pending',
      source: 'latest-interpretation',
      body: result,
    };
  } catch (error) {
    if (
      error.status === 404 &&
      String(error.message || '')
        .toLowerCase()
        .includes('no interpretation found')
    ) {
      return getCaseProcessingStatus({ baseUrl, caseId, guestSessionId, authToken });
    }

    throw error;
  }
}

async function pollUntilDone(args, caseId) {
  const startedAt = Date.now();
  let attempt = 0;

  while (Date.now() - startedAt < args.timeoutMs) {
    attempt += 1;
    const result = await getLatestInterpretation({ ...args, caseId });
    console.log(`[${attempt}] ${result.source}: ${result.status}`);

    if (TERMINAL_STATUSES.has(result.status)) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, args.intervalMs));
  }

  throw new Error(`Timed out after ${args.timeoutMs}ms waiting for AI review.`);
}

function redactLargeFilePayloads(value) {
  if (Array.isArray(value)) return value.map(redactLargeFilePayloads);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (key === 'url' && typeof entry === 'string' && entry.startsWith('data:')) {
          return [key, `[redacted data URL: ${entry.length} chars]`];
        }

        return [key, redactLargeFilePayloads(entry)];
      }),
    );
  }

  return value;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.filePath) {
    console.error(
      'Usage: node scripts/test-ai-polling.mjs <file.pdf|jpg|png> [--auth-token token] [--guest-session-id id] [--base-url url]',
    );
    process.exit(1);
  }

  const uploadResult = await upload(args);
  console.log(`Uploaded. case_id=${uploadResult.case_id}`);
  console.log(`lab_result_id=${uploadResult.lab_result?.id || 'unknown'}`);

  const finalResult = await pollUntilDone(args, uploadResult.case_id);
  console.log('Final result:');
  console.log(
    JSON.stringify(redactLargeFilePayloads(finalResult.body?.data ?? finalResult.body), null, 2),
  );
}

main().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`);
  if (error.body) console.error(JSON.stringify(error.body, null, 2));
  process.exit(1);
});
