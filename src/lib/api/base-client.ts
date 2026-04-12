import { t } from '@lingui/core/macro';
import { type ApiResponse } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

type ApiEnvelope<T> = ApiResponse<T>;

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'success' in value &&
    'data' in value &&
    'message' in value,
  );
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

export async function baseClient<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const body = (await response.json()) as unknown;

  if (!response.ok) {
    if (isApiEnvelope<unknown>(body)) {
      throw new Error(body.message || t`Request failed`);
    }

    if (body && typeof body === 'object' && 'message' in body) {
      throw new Error(String(body.message));
    }

    throw new Error(t`Request failed`);
  }

  if (isApiEnvelope<TResponse>(body)) {
    if (!body.success) {
      throw new Error(body.message || t`Request failed`);
    }

    return body.data;
  }

  return body as TResponse;
}
