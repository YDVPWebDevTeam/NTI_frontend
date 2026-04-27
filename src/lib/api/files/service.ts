import { api } from 'lib/api/base-client';

import { filesEndpoints } from './endpoints';
import type {
  CompleteUploadDto,
  DownloadUrlQuery,
  DownloadUrlResponse,
  RequestUploadDto,
  UploadedFileResponse,
  UploadUrlResponse,
} from './types';

function withDownloadUrlQuery(path: string, query?: DownloadUrlQuery): string {
  if (!query?.disposition) {
    return path;
  }

  const searchParams = new URLSearchParams({
    disposition: query.disposition,
  });

  return `${path}?${searchParams.toString()}`;
}

export const filesService = {
  requestUploadUrl(payload: RequestUploadDto) {
    return api.post<UploadUrlResponse, RequestUploadDto>(filesEndpoints.requestUploadUrl, payload);
  },

  async uploadToPresignedUrl(uploadUrl: string, file: File) {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file (${response.status})`);
    }
  },

  completeUpload(payload: CompleteUploadDto) {
    return api.post<UploadedFileResponse, CompleteUploadDto>(
      filesEndpoints.completeUpload,
      payload,
    );
  },

  getDownloadUrl(id: string, query?: DownloadUrlQuery) {
    return api.get<DownloadUrlResponse>(
      withDownloadUrlQuery(filesEndpoints.downloadUrl(id), query),
    );
  },
};
