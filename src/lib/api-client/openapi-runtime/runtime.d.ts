import type { AxiosRequestConfig } from 'axios';

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number);
}

export function buildApiUrl(path: string): string;
export function extractApiErrorMessage(payload: unknown): string;
export function isApiRequestError(error: unknown): error is ApiRequestError;
export function isAuthErrorStatus(status?: number): boolean;
export function orvalMutator<TResponse>(
  config: AxiosRequestConfig & { url: string },
  options?: AxiosRequestConfig,
): Promise<TResponse>;
