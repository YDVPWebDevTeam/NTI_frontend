export type FileVisibility = 'PRIVATE' | 'PUBLIC';

export interface RequestUploadDto {
  filename: string;
  mimeType: string;
  size: number;
  visibility?: FileVisibility;
  purpose?: string;
  entityType?: string;
  entityId?: string;
}

export interface UploadUrlResponse {
  fileId: string;
  key: string;
  visibility: FileVisibility;
  uploadUrl: string;
  publicUrl?: string;
  expiresAt: string;
}

export interface CompleteUploadDto {
  fileId: string;
  size?: number;
  checksum?: string;
}

export interface UploadedFileResponse {
  id: string;
  ownerId: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  visibility: FileVisibility;
  status: 'PENDING' | (string & {});
  publicUrl?: string;
  uploadedAt?: string;
}

export interface DownloadUrlParams {
  id: string;
}

export interface DownloadUrlQuery {
  disposition?: 'inline' | 'attachment';
}

export interface DownloadUrlResponse {
  fileId: string;
  downloadUrl: string;
  visibility: FileVisibility;
  expiresAt?: string;
}
