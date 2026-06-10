'use client';

import { t } from '@lingui/core/macro';
import { Loader2, Paperclip, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button, Textarea } from 'components/shadcn';

import {
  requestConversationAttachmentDownload,
  useConversation,
  useConversationAttachmentUpload,
} from './api';
import type { ConversationAnchor, ConversationChannel, ConversationMessage } from './types';

const MAX_ATTACHMENTS = 10;

type ConversationPanelProps = {
  anchor: ConversationAnchor;
  channel: ConversationChannel;
  currentUserId: string | undefined;
  canWrite: boolean;
};

function formatAuthor(message: ConversationMessage): string {
  const name = `${message.author.firstName} ${message.author.lastName}`.trim();

  return name || message.author.email;
}

function formatTimestamp(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString();
}

export function ConversationPanel({
  anchor,
  channel,
  currentUserId,
  canWrite,
}: ConversationPanelProps) {
  const { messagesQuery, sendMessage, editMessage, deleteMessage } = useConversation(
    anchor,
    channel,
  );
  const attachmentUpload = useConversationAttachmentUpload();

  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  // Backend returns newest-first; render oldest-first for a natural chat feed.
  const messages = [...(messagesQuery.data?.data ?? [])].reverse();
  const isBusy = sendMessage.isPending || attachmentUpload.isPending;

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setPendingFiles((current) => {
      const next = [...current, ...Array.from(files)];

      if (next.length > MAX_ATTACHMENTS) {
        toast.error(t`A message may have at most ${MAX_ATTACHMENTS} attachments.`);

        return next.slice(0, MAX_ATTACHMENTS);
      }

      return next;
    });
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((current) => current.filter((_, position) => position !== index));
  };

  const handleSend = async () => {
    const body = draft.trim();

    if (!body) {
      toast.error(t`Message cannot be empty.`);

      return;
    }

    try {
      const fileIds: string[] = [];

      for (const file of pendingFiles) {
        let fileId: string;

        try {
          fileId = await attachmentUpload.mutateAsync(file);
        } catch (uploadError) {
          const msg = uploadError instanceof Error ? uploadError.message : '';
          // "Network Error" is the axios signal for a CORS/connectivity failure
          // during the direct browser → R2 PUT step.
          const isCors = msg === 'Network Error' || msg.toLowerCase().includes('network');

          toast.error(
            isCors
              ? t`Could not upload "${file.name}". The storage bucket may not allow uploads from this origin — check the R2 CORS configuration.`
              : msg || t`Unable to upload "${file.name}".`,
          );

          return;
        }

        fileIds.push(fileId);
      }

      await sendMessage.mutateAsync({ body, fileIds: fileIds.length ? fileIds : undefined });
      setDraft('');
      setPendingFiles([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to send the message.`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) {
      return;
    }

    const body = editBody.trim();

    if (!body) {
      toast.error(t`Message cannot be empty.`);

      return;
    }

    try {
      await editMessage.mutateAsync({ messageId: editingId, body });
      setEditingId(null);
      setEditBody('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to update the message.`);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to delete the message.`);
    }
  };

  const handleDownload = async (messageId: string, attachmentId: string) => {
    try {
      const { downloadUrl } = await requestConversationAttachmentDownload(messageId, attachmentId);

      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to download the attachment.`);
    }
  };

  let feed;

  if (messagesQuery.isLoading && !messagesQuery.data) {
    feed = (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t`Loading messages`}</span>
      </div>
    );
  } else if (messagesQuery.isError) {
    feed = (
      <p className="text-muted-foreground text-sm">{t`Messages are unavailable right now.`}</p>
    );
  } else if (messages.length === 0) {
    feed = <p className="text-muted-foreground text-sm">{t`No messages yet.`}</p>;
  } else {
    feed = messages.map((message) => {
      const isOwn = Boolean(currentUserId) && message.author.id === currentUserId;
      const isEditing = editingId === message.id;

      let content;

      if (message.isDeleted) {
        content = <p className="text-muted-foreground mt-2 text-sm italic">{t`Message deleted`}</p>;
      } else if (isEditing) {
        content = (
          <div className="mt-2 space-y-2">
            <Textarea
              rows={3}
              maxLength={5000}
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={editMessage.isPending}
                onClick={() => {
                  setEditingId(null);
                  setEditBody('');
                }}
              >
                {t`Cancel`}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={editMessage.isPending}
                onClick={() => void handleSaveEdit()}
              >
                {editMessage.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t`Save`}
              </Button>
            </div>
          </div>
        );
      } else {
        content = (
          <>
            <p className="text-foreground mt-2 text-sm leading-7 whitespace-pre-wrap">
              {message.body}
            </p>

            {message.attachments.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.attachments.map((attachment) => (
                  <button
                    key={attachment.id}
                    type="button"
                    className="border-border bg-card text-foreground inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                    onClick={() => void handleDownload(message.id, attachment.id)}
                  >
                    <Paperclip className="h-3 w-3" />
                    {attachment.name}
                  </button>
                ))}
              </div>
            ) : null}

            {isOwn && canWrite ? (
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(message.id);
                    setEditBody(message.body);
                  }}
                >
                  {t`Edit`}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={deleteMessage.isPending}
                  onClick={() => void handleDelete(message.id)}
                >
                  {t`Delete`}
                </Button>
              </div>
            ) : null}
          </>
        );
      }

      return (
        <div key={message.id} className="border-border bg-muted rounded-2xl border p-4">
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-foreground font-medium">{formatAuthor(message)}</span>
            <span>
              {formatTimestamp(message.createdAt)}
              {message.editedAt ? ` · ${t`edited`}` : ''}
            </span>
          </div>

          {content}
        </div>
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">{feed}</div>

      {canWrite ? (
        <div className="border-border bg-card/70 space-y-3 rounded-2xl border border-dashed p-4">
          <Textarea
            rows={3}
            maxLength={5000}
            value={draft}
            placeholder={t`Write a message…`}
            onChange={(event) => setDraft(event.target.value)}
          />

          {pendingFiles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="border-border bg-muted text-foreground inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                >
                  <Paperclip className="h-3 w-3" />
                  {file.name}
                  <button
                    type="button"
                    aria-label={t`Remove attachment`}
                    onClick={() => removePendingFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <label className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-sm">
              <Paperclip className="h-4 w-4" />
              {t`Attach`}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>

            <Button type="button" size="sm" disabled={isBusy} onClick={() => void handleSend()}>
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t`Send`}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
