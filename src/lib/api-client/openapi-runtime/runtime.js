const axios = require('axios');

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
const HTTP_STATUS_MULTIPLE_CHOICES = 300;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_FORBIDDEN = 403;
const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function isApiRequestError(error) {
  return error instanceof ApiRequestError;
}

function isAuthErrorStatus(status) {
  return status === HTTP_STATUS_UNAUTHORIZED || status === HTTP_STATUS_FORBIDDEN;
}

function isApiEnvelope(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'success' in value &&
    'data' in value &&
    'message' in value,
  );
}

function buildApiUrl(path) {
  if (/^https?:\/\//.test(path) || path.startsWith('/api/')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function extractApiErrorMessage(payload) {
  if (isApiEnvelope(payload)) {
    return payload.message || 'Request failed';
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    return String(payload.message);
  }

  return 'Request failed';
}

function unwrapResponseData(payload) {
  if (isApiEnvelope(payload)) {
    if (!payload.success) {
      throw new Error(payload.message || 'Request failed');
    }

    return payload.data;
  }

  return payload;
}

function normalizeHeaders(headers) {
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

function getHeaders(value) {
  return value && value.headers ? value.headers : undefined;
}

function shouldAttemptAuthRefresh(path) {
  return path === '/auth/me' || !path.startsWith('/auth/');
}

async function refreshAccessToken() {
  try {
    const authModule = require('../../api/auth/auth');
    const refreshSession = authModule.refreshSession;

    await refreshSession();

    return true;
  } catch (_error) {
    return false;
  }
}

async function performRequest(path, config, options) {
  try {
    const { __skipAuthRefresh, ...requestConfig } = config;
    const response = await axios.request({
      ...options,
      ...requestConfig,
      url: buildApiUrl(path),
      withCredentials: true,
      headers: normalizeHeaders({
        ...getHeaders(options),
        ...requestConfig.headers,
      }),
      validateStatus: () => true,
    });

    if (
      response.status === HTTP_STATUS_UNAUTHORIZED &&
      !__skipAuthRefresh &&
      path !== '/auth/refresh' &&
      shouldAttemptAuthRefresh(path) &&
      (await refreshAccessToken())
    ) {
      return performRequest(path, { ...config, __skipAuthRefresh: true }, options);
    }

    if (response.status < 200 || response.status >= HTTP_STATUS_MULTIPLE_CHOICES) {
      throw new ApiRequestError(extractApiErrorMessage(response.data), response.status);
    }

    return unwrapResponseData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const response = error.response;

      throw new ApiRequestError(
        extractApiErrorMessage(response ? response.data : undefined),
        response ? response.status : undefined,
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new ApiRequestError('Request failed');
  }
}

function openApiClient(config, options) {
  return performRequest(config.url, config, options);
}

module.exports = {
  ApiRequestError,
  buildApiUrl,
  extractApiErrorMessage,
  isApiRequestError,
  isAuthErrorStatus,
  orvalMutator: openApiClient,
};
