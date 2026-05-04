export const filesEndpoints = {
  requestUploadUrl: '/v1/files/upload-url',
  completeUpload: '/v1/files/complete',
  downloadUrl: (id: string) => `/v1/files/${id}/download-url`,
};
