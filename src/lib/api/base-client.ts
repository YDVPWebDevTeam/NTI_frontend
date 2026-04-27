import { t } from '@lingui/core/macro';

import { authEndpoints } from './auth/endpoints';
import { type ApiResponse } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

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

export function buildApiUrl(path: string): string {
  if (path.startsWith('/api/')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }

  return new Error(t`Request failed`);
}

export function extractApiErrorMessage(payload: unknown): string {
  if (isApiEnvelope<unknown>(payload)) {
    return payload.message || t`Request failed`;
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    return String(payload.message);
  }

  return t`Request failed`;
}

function unwrapResponseData<TResponse>(payload: unknown): TResponse {
  if (isApiEnvelope<TResponse>(payload)) {
    if (!payload.success) {
      throw new Error(payload.message || t`Request failed`);
    }

    return payload.data;
  }

  return payload as TResponse;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  headers?: HeadersInit;
  skipAuthRefresh?: boolean;
}

export async function request<TResponse>(path: string, config?: RequestConfig): Promise<TResponse> {
  try {
    const headers = new Headers(config?.headers);
    const hasBody = config?.data !== undefined;

    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(buildApiUrl(path), {
      method: config?.method ?? 'GET',
      credentials: 'include',
      headers,
      body: hasBody ? JSON.stringify(config.data) : undefined,
    });

    if (response.status === 401 && !config?.skipAuthRefresh && !isAuthRefreshEndpoint(path)) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return request<TResponse>(path, {
          ...config,
          skipAuthRefresh: true,
        });
      }
    }

    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error(extractApiErrorMessage(payload));
    }

    return unwrapResponseData<TResponse>(payload);
  } catch (error) {
    throw toError(error);
  }
}

function isAuthRefreshEndpoint(path: string): boolean {
  return [
    authEndpoints.login,
    authEndpoints.registerStudent,
    authEndpoints.resendConfirmationEmail,
    authEndpoints.confirmEmail,
    authEndpoints.refresh,
    authEndpoints.logout,
  ].includes(path);
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const { authService } = await import('./auth/service');

    await authService.refresh();

    return true;
  } catch {
    return false;
  }
}

export const api = {
  get<TResponse>(path: string, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return request<TResponse>(path, {
      ...config,
      method: 'GET',
    });
  },

  post<TResponse, TBody = unknown>(
    path: string,
    data?: TBody,
    config?: Omit<RequestConfig, 'method' | 'data'>,
  ) {
    return request<TResponse>(path, {
      ...config,
      data,
      method: 'POST',
    });
  },

  put<TResponse, TBody = unknown>(
    path: string,
    data?: TBody,
    config?: Omit<RequestConfig, 'method' | 'data'>,
  ) {
    return request<TResponse>(path, {
      ...config,
      data,
      method: 'PUT',
    });
  },

  patch<TResponse, TBody = unknown>(
    path: string,
    data?: TBody,
    config?: Omit<RequestConfig, 'method' | 'data'>,
  ) {
    return request<TResponse>(path, {
      ...config,
      data,
      method: 'PATCH',
    });
  },

  delete<TResponse>(path: string, config?: Omit<RequestConfig, 'method' | 'data'>) {
    return request<TResponse>(path, {
      ...config,
      method: 'DELETE',
    });
  },
};
