'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { filesService } from './service';
import type { CompleteUploadDto, DownloadUrlQuery, RequestUploadDto } from './types';

export function useRequestUploadUrlMutation() {
  return useMutation({
    mutationFn: (payload: RequestUploadDto) => filesService.requestUploadUrl(payload),
  });
}

export function useUploadToPresignedUrlMutation() {
  return useMutation({
    mutationFn: ({ uploadUrl, file }: { uploadUrl: string; file: File }) =>
      filesService.uploadToPresignedUrl(uploadUrl, file),
  });
}

export function useCompleteUploadMutation() {
  return useMutation({
    mutationFn: (payload: CompleteUploadDto) => filesService.completeUpload(payload),
  });
}

export function useDownloadUrlQuery(id: string, query?: DownloadUrlQuery, enabled = true) {
  return useQuery({
    queryKey: ['files', 'download-url', id, query?.disposition],
    queryFn: () => filesService.getDownloadUrl(id, query),
    enabled: Boolean(id) && enabled,
  });
}
