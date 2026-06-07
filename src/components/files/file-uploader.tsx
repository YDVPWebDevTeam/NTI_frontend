'use client';

import { t } from '@lingui/core/macro';
import { FileText, Upload, X } from 'lucide-react';
import * as React from 'react';

import { useFilesControllerCompleteUpload, useFilesControllerRequestUploadUrl } from 'lib/api';
import type { RequestUploadDtoVisibility } from 'lib/api';
import { uploadToPresignedUrl } from 'lib/api-client/openapi-runtime/file-upload';
import { Button } from 'components/shadcn';
import { cn } from 'lib/utils';

const FALLBACK_MIME_TYPE = 'application/octet-stream';

export type UploadedFile = {
  /** Internal file record id returned by the files API. */
  fileId: string;
  /** Original file name, shown in the list. */
  name: string;
};

export type FileUploadOptions = {
  visibility?: RequestUploadDtoVisibility;
  /** Logical upload purpose forwarded to the files API key generation. */
  purpose?: string;
  /** Optional domain entity type this file belongs to. */
  entityType?: string;
};

/**
 * Uploads raw `File` objects through the presigned-URL flow and returns the
 * finalized file records. Use this to defer uploading until a form is actually
 * submitted instead of uploading the moment a file is selected.
 */
export function useFileUploads() {
  const requestUploadUrl = useFilesControllerRequestUploadUrl();
  const completeUpload = useFilesControllerCompleteUpload();
  const [isUploadingFiles, setIsUploadingFiles] = React.useState(false);

  const uploadFile = React.useCallback(
    async (file: File, options: FileUploadOptions = {}): Promise<UploadedFile> => {
      const { visibility = 'PRIVATE', purpose, entityType } = options;

      const instructions = await requestUploadUrl.mutateAsync({
        data: {
          filename: file.name,
          mimeType: file.type || FALLBACK_MIME_TYPE,
          size: file.size,
          visibility,
          purpose,
          entityType,
        },
      });

      await uploadToPresignedUrl({ uploadUrl: instructions.uploadUrl, file });
      await completeUpload.mutateAsync({
        data: { fileId: instructions.fileId, size: file.size },
      });

      return { fileId: instructions.fileId, name: file.name };
    },
    [requestUploadUrl, completeUpload],
  );

  const uploadFiles = React.useCallback(
    async (files: File[], options: FileUploadOptions = {}): Promise<UploadedFile[]> => {
      setIsUploadingFiles(true);
      const uploaded: UploadedFile[] = [];

      try {
        for (const file of files) {
          uploaded.push(await uploadFile(file, options));
        }
      } finally {
        setIsUploadingFiles(false);
      }

      return uploaded;
    },
    [uploadFile],
  );

  return {
    uploadFile,
    uploadFiles,
    isUploading: isUploadingFiles || requestUploadUrl.isPending || completeUpload.isPending,
  };
}

type FileUploaderProps = {
  id: string;
  /** Files selected for upload. They are only uploaded when the parent form is submitted. */
  value: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  /** Allow selecting and keeping more than one file. Defaults to true. */
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  buttonLabel?: string;
};

export function FileUploader({
  id,
  value,
  onChange,
  accept,
  multiple = true,
  disabled,
  className,
  placeholder,
  buttonLabel = t`Upload files`,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    resetInput();

    if (selectedFiles.length === 0) {
      return;
    }

    onChange(multiple ? [...value, ...selectedFiles] : selectedFiles.slice(-1));
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, entryIndex) => entryIndex !== index));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="border-border bg-muted flex flex-col gap-3 rounded-md border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium">
            {placeholder ?? t`Upload one or more files.`}
          </p>
          <p className="text-muted-foreground text-xs">
            {value.length > 0 ? t`${value.length} file(s) selected.` : t`No files selected yet.`}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </div>

      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="border-border bg-card flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <span className="text-foreground flex min-w-0 items-center gap-2 text-sm">
                <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
