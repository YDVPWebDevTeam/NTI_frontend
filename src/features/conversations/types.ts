export type ConversationChannel = 'INTERNAL' | 'PARTICIPANTS';

export type ConversationAnchor =
  | { kind: 'program-b'; projectId: string }
  | { kind: 'program-a'; applicationId: string };

export type ConversationUserSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ConversationMessageAttachment = {
  id: string;
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  status: string;
};

export type ConversationMessage = {
  id: string;
  channel: ConversationChannel;
  author: ConversationUserSummary;
  body: string;
  attachments: ConversationMessageAttachment[];
  isDeleted: boolean;
  editedAt: string | null;
  createdAt: string;
};

export type ConversationMessagePage = {
  data: ConversationMessage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ConversationAttachmentDownload = {
  attachmentId: string;
  downloadUrl: string;
};

export type CreateConversationMessageInput = {
  body: string;
  fileIds?: string[];
};
