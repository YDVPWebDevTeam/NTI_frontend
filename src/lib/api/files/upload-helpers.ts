import type {
  CompleteUploadDto,
  RequestUploadDto,
  UploadedFileResponse,
  UploadUrlResponse,
} from './types';

type UploadPipelineDependencies = {
  requestUploadUrl: (payload: RequestUploadDto) => Promise<UploadUrlResponse>;
  uploadToPresignedUrl: (payload: { uploadUrl: string; file: File }) => Promise<void>;
  completeUpload: (payload: CompleteUploadDto) => Promise<UploadedFileResponse>;
};

type UploadPipelineInput = {
  file: File;
  purpose: string;
  entityType: string;
};

export async function uploadAndCompleteFile(
  dependencies: UploadPipelineDependencies,
  input: UploadPipelineInput,
) {
  const uploadUrlResponse = await dependencies.requestUploadUrl({
    filename: input.file.name,
    mimeType: input.file.type || 'application/octet-stream',
    size: input.file.size,
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
