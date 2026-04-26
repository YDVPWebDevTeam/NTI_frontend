export const filesEndpoints = {
  requestUploadUrl: '/files/upload-url',
  completeUpload: '/files/complete',
  downloadUrl: (id: string) => `/files/${id}/download-url`,
};
