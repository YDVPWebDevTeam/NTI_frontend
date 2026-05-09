import { t } from '@lingui/core/macro';
import axios, { type AxiosRequestConfig } from 'axios';

import { authEndpoints as adminAuthEndpoints } from './admin/auth/endpoints';
import { authEndpoints } from './auth/endpoints';
import { type ApiResponse } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
const HTTP_STATUS_MULTIPLE_CHOICES = 300;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_FORBIDDEN = 403;
const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

type ApiEnvelope<T> = ApiResponse<T>;

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function isAuthErrorStatus(status?: number) {
  return status === HTTP_STATUS_UNAUTHORIZED || status === HTTP_STATUS_FORBIDDEN;
}

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

  return new ApiRequestError(t`Request failed`);
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
  params?: Record<string, unknown>;
  skipAuthRefresh?: boolean;
}

export async function request<TResponse>(path: string, config?: RequestConfig): Promise<TResponse> {
  try {
    const axiosConfig: AxiosRequestConfig = {
      method: config?.method ?? 'GET',
      url: buildApiUrl(path),
      withCredentials: true,
      data: config?.data,
      params: config?.params,
      headers: normalizeHeaders(config?.headers),
      validateStatus: () => true,
    };

    const response = await axios.request<unknown>(axiosConfig);

    if (
      response.status === 401 &&
      !config?.skipAuthRefresh &&
      !isAuthRefreshEndpoint(path) &&
      (await refreshAccessToken(path))
    ) {
      return request<TResponse>(path, {
        ...config,
        skipAuthRefresh: true,
      });
    }

    if (response.status < 200 || response.status >= HTTP_STATUS_MULTIPLE_CHOICES) {
      throw new ApiRequestError(extractApiErrorMessage(response.data), response.status);
    }

    return unwrapResponseData<TResponse>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiRequestError(
        extractApiErrorMessage(error.response?.data),
        error.response?.status,
      );
    }

    throw toError(error);
  }
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> | undefined {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]));
}

function isAdminPath(path: string): boolean {
  return path.startsWith('/admin/') || path.startsWith('/auth/admin/');
}

function isAuthRefreshEndpoint(path: string): boolean {
  return [
    authEndpoints.login,
    authEndpoints.registerStudent,
    authEndpoints.registerCompanyOwner,
    authEndpoints.resendConfirmationEmail,
    authEndpoints.confirmEmail,
    authEndpoints.refresh,
    authEndpoints.logout,
    adminAuthEndpoints.loginAdmin,
    adminAuthEndpoints.forceChangePassword,
    adminAuthEndpoints.refresh,
    adminAuthEndpoints.logout,
  ].includes(path);
}

async function refreshAccessToken(path: string): Promise<boolean> {
  try {
    if (isAdminPath(path)) {
      const { authService } = await import('./admin/auth/service');

      await authService.refresh();

      return true;
    }

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
