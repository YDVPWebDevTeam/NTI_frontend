'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useFilesControllerCompleteUpload, useFilesControllerRequestUploadUrl } from 'lib/api';
import {
  uploadAndCompleteFile,
  uploadToPresignedUrl,
} from 'lib/api-client/openapi-runtime/file-upload';
import { orvalMutator } from 'lib/api-client/openapi-runtime/runtime';

import type {
  ConversationAnchor,
  ConversationAttachmentDownload,
  ConversationChannel,
  ConversationMessage,
  ConversationMessagePage,
  CreateConversationMessageInput,
} from './types';

const POLL_INTERVAL_MS = 15_000;
const PAGE_LIMIT = 50;

function anchorBasePath(anchor: ConversationAnchor, channel: ConversationChannel): string {
  if (anchor.kind === 'program-b') {
    return `/program-b/projects/${anchor.projectId}/conversations/${channel}/messages`;
  }

  return `/program-a/applications/${anchor.applicationId}/conversations/${channel}/messages`;
}

function anchorId(anchor: ConversationAnchor): string {
  return anchor.kind === 'program-b' ? anchor.projectId : anchor.applicationId;
}

function conversationQueryKey(anchor: ConversationAnchor, channel: ConversationChannel) {
  return ['conversations', anchor.kind, anchorId(anchor), channel] as const;
}

export function listConversationMessages(
  anchor: ConversationAnchor,
  channel: ConversationChannel,
  signal?: AbortSignal,
) {
  return orvalMutator<ConversationMessagePage>({
    url: anchorBasePath(anchor, channel),
    method: 'GET',
    params: { page: 1, limit: PAGE_LIMIT },
    signal,
  });
}

export function createConversationMessage(
  anchor: ConversationAnchor,
  channel: ConversationChannel,
  data: CreateConversationMessageInput,
) {
  return orvalMutator<ConversationMessage>({
    url: anchorBasePath(anchor, channel),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function updateConversationMessage(messageId: string, body: string) {
  return orvalMutator<ConversationMessage>({
    url: `/conversations/messages/${messageId}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    data: { body },
  });
}

export function deleteConversationMessage(messageId: string) {
  return orvalMutator<ConversationMessage>({
    url: `/conversations/messages/${messageId}`,
    method: 'DELETE',
  });
}

export function requestConversationAttachmentDownload(messageId: string, attachmentId: string) {
  return orvalMutator<ConversationAttachmentDownload>({
    url: `/conversations/messages/${messageId}/attachments/${attachmentId}/download`,
    method: 'POST',
  });
}

/**
 * Bundles the message feed (polling) plus send/edit/delete mutations for a
 * single conversation channel, keeping query invalidation in one place.
 */
export function useConversation(
  anchor: ConversationAnchor,
  channel: ConversationChannel,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const queryKey = conversationQueryKey(anchor, channel);
  const enabled = options?.enabled ?? true;

  const messagesQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => listConversationMessages(anchor, channel, signal),
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL_MS : false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const sendMessage = useMutation({
    mutationFn: (data: CreateConversationMessageInput) =>
      createConversationMessage(anchor, channel, data),
    onSuccess: invalidate,
  });

  const editMessage = useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      updateConversationMessage(messageId, body),
    onSuccess: invalidate,
  });

  const deleteMessage = useMutation({
    mutationFn: (messageId: string) => deleteConversationMessage(messageId),
    onSuccess: invalidate,
  });

  return { messagesQuery, sendMessage, editMessage, deleteMessage };
}

/** Two-phase upload of a single attachment, returning the resulting file id. */
export function useConversationAttachmentUpload() {
  const requestUploadUrl = useFilesControllerRequestUploadUrl();
  const completeUpload = useFilesControllerCompleteUpload();

  return useMutation({
    mutationFn: async (file: File) => {
      const completed = await uploadAndCompleteFile(
        {
          requestUploadUrl: (payload) => requestUploadUrl.mutateAsync({ data: payload }),
          uploadToPresignedUrl,
          completeUpload: (payload) => completeUpload.mutateAsync({ data: payload }),
        },
        {
          file,
          purpose: 'conversation-attachment',
          entityType: 'ConversationMessage',
          visibility: 'PRIVATE',
        },
      );

      return completed.id;
    },
  });
}
