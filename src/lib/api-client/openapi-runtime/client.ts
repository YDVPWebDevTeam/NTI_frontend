import type { AxiosRequestConfig } from 'axios';

import runtimeModule from './runtime';

type OpenApiRuntimeModule = {
  ApiRequestError: typeof Error & {
    new (message: string, status?: number): Error & { status?: number };
  };
  buildApiUrl: (path: string) => string;
  extractApiErrorMessage: (payload: unknown) => string;
  isApiRequestError: (error: unknown) => boolean;
  isAuthErrorStatus: (status?: number) => boolean;
  orvalMutator: <TResponse>(
    config: AxiosRequestConfig & { url: string },
    options?: AxiosRequestConfig,
  ) => Promise<TResponse>;
};

const runtime = runtimeModule as unknown as OpenApiRuntimeModule;

export type OpenApiRequestConfig = AxiosRequestConfig & {
  url: string;
};

export const ApiRequestError = runtime.ApiRequestError;
export const buildApiUrl = runtime.buildApiUrl;
export const extractApiErrorMessage = runtime.extractApiErrorMessage;
export const isApiRequestError = runtime.isApiRequestError as (
  error: unknown,
) => error is InstanceType<typeof ApiRequestError>;
export const isAuthErrorStatus = runtime.isAuthErrorStatus;

export default function openApiClient<TResponse>(
  config: OpenApiRequestConfig,
  options?: AxiosRequestConfig,
) {
  return runtime.orvalMutator<TResponse>(config, options);
}
