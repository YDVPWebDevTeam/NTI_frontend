'use client';

import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

import type {
  FilesControllerCompleteUploadMutationBody,
  FilesControllerCompleteUploadMutationResult,
  FilesControllerRequestUploadUrlMutationBody,
  FilesControllerRequestUploadUrlMutationResult,
  RequestUploadDtoVisibility,
} from 'lib/api';

type UploadPipelineDependencies = {
  requestUploadUrl: (
    payload: FilesControllerRequestUploadUrlMutationBody,
  ) => Promise<FilesControllerRequestUploadUrlMutationResult>;
  uploadToPresignedUrl: (payload: { uploadUrl: string; file: File }) => Promise<void>;
  completeUpload: (
    payload: FilesControllerCompleteUploadMutationBody,
  ) => Promise<FilesControllerCompleteUploadMutationResult>;
};

type UploadPipelineInput = {
  file: File;
  purpose: string;
  entityType: string;
  visibility?: RequestUploadDtoVisibility;
};

export async function uploadToPresignedUrl({ uploadUrl, file }: { uploadUrl: string; file: File }) {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });
}

export function useUploadToPresignedUrl() {
  return useMutation({
    mutationFn: uploadToPresignedUrl,
  });
}

export async function uploadAndCompleteFile(
  dependencies: UploadPipelineDependencies,
  input: UploadPipelineInput,
) {
  const uploadUrlResponse = await dependencies.requestUploadUrl({
    filename: input.file.name,
    mimeType: input.file.type || 'application/octet-stream',
    size: input.file.size,
    visibility: input.visibility,
    purpose: input.purpose,
    entityType: input.entityType,
  });

  await dependencies.uploadToPresignedUrl({
    uploadUrl: uploadUrlResponse.uploadUrl,
    file: input.file,
  });

  return dependencies.completeUpload({
    fileId: uploadUrlResponse.fileId,
    size: input.file.size,
  });
}
