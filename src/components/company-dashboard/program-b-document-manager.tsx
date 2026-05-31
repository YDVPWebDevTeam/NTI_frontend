'use client';

import { t } from '@lingui/core/macro';
import { Download, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { uploadToPresignedUrl } from 'lib/api-client/openapi-runtime/file-upload';
import { Button, FileInput } from 'components/shadcn';
import { formatEnumLabel } from 'lib/utils';

export type ProgramBManagedDocument = {
  id: string;
  name: string;
  category: string;
  status: string;
};

export type ProgramBDocumentCategoryOption = {
  value: string;
  label: string;
};

type DocumentUploadTicket = {
  documentId: string;
  fileId: string;
  uploadUrl: string;
};

export type ProgramBDocumentManagerProps = {
  documents: ProgramBManagedDocument[];
  categories: ProgramBDocumentCategoryOption[];
  isLoading: boolean;
  isError: boolean;
  /** When false, the upload form is hidden (role/state gated by the caller). */
  canUpload: boolean;
  /** When true, upload is disabled (e.g. closed/read-only entity). */
  disabled?: boolean;
  createUpload: (input: {
    filename: string;
    mimeType: string;
    size: number;
    category: string;
  }) => Promise<DocumentUploadTicket>;
  completeUpload: (documentId: string, input: { size: number }) => Promise<unknown>;
  requestDownload: (documentId: string) => Promise<{ downloadUrl: string }>;
  onChanged: () => Promise<void> | void;
};

const FALLBACK_MIME_TYPE = 'application/octet-stream';

export function ProgramBDocumentManager({
  documents,
  categories,
  isLoading,
  isError,
  canUpload,
  disabled = false,
  createUpload,
  completeUpload,
  requestDownload,
  onChanged,
}: ProgramBDocumentManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>(categories[0]?.value ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file || !category) {
      return;
    }

    setIsUploading(true);

    try {
      const ticket = await createUpload({
        filename: file.name,
        mimeType: file.type || FALLBACK_MIME_TYPE,
        size: file.size,
        category,
      });

      await uploadToPresignedUrl({ uploadUrl: ticket.uploadUrl, file });
      await completeUpload(ticket.documentId, { size: file.size });
      toast.success(t`Document uploaded.`);
      setFile(null);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to upload document.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    setDownloadingId(documentId);

    try {
      const result = await requestDownload(documentId);

      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t`Unable to download document.`);
    } finally {
      setDownloadingId(null);
    }
  };

  let listContent;

  if (isLoading) {
    listContent = <p className="text-sm text-[#60718d]">{t`Loading documents…`}</p>;
  } else if (isError) {
    listContent = (
      <p className="text-sm text-[#60718d]">{t`Documents are unavailable right now.`}</p>
    );
  } else if (documents.length === 0) {
    listContent = <p className="text-sm text-[#60718d]">{t`No documents uploaded yet.`}</p>;
  } else {
    listContent = documents.map((document) => (
      <div
        key={document.id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dfe7fa] bg-[#f8fbff] p-4"
      >
        <div>
          <p className="font-semibold text-[#10213d]">{document.name}</p>
          <p className="mt-1 text-sm text-[#60718d]">
            {formatEnumLabel(document.category)} · {formatEnumLabel(document.status)}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={downloadingId === document.id}
          onClick={() => void handleDownload(document.id)}
        >
          {downloadingId === document.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t`Download`}
        </Button>
      </div>
    ));
  }

  return (
    <div className="space-y-4">
      {canUpload ? (
        <div className="rounded-2xl border border-dashed border-[#c4d4f5] bg-white/70 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <FileInput
              id="program-b-document-upload"
              file={file}
              onFileChange={setFile}
              disabled={disabled || isUploading}
            />
            <select
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
              value={category}
              disabled={disabled || isUploading}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={disabled || isUploading || !file || !category}
              onClick={() => void handleUpload()}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {t`Upload document`}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">{listContent}</div>
    </div>
  );
}
