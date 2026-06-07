import { t } from '@lingui/core/macro';

/** Default maximum upload size: 20 MB. */
export const DEFAULT_MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** File extensions accepted for document slots (CV, evidence, attachments, org docs). */
export const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp';

/** Image extensions accepted for logos/avatars. */
export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.svg';

const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg'];

export type FileValidationResult = { ok: true } | { ok: false; message: string };

export type FileValidationOptions = {
  /** Maximum allowed size in bytes. Defaults to {@link DEFAULT_MAX_UPLOAD_BYTES}. */
  maxBytes?: number;
  /** Allowed lowercase file extensions (without the leading dot). */
  allowedExtensions?: string[];
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');

  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : '';
}

/**
 * Validate a file before kicking off an upload pipeline.
 * Returns a discriminated result so callers can surface a localized message.
 */
export function validateUploadFile(
  file: File,
  options: FileValidationOptions = {},
): FileValidationResult {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;
  const allowedExtensions = options.allowedExtensions;

  if (file.size === 0) {
    return { ok: false, message: t`This file is empty. Please choose a different file.` };
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      message: t`This file is too large. Maximum size is ${formatBytes(maxBytes)}.`,
    };
  }

  if (allowedExtensions && allowedExtensions.length > 0) {
    const extension = getExtension(file.name);

    if (!extension || !allowedExtensions.includes(extension)) {
      const list = allowedExtensions.map((value) => `.${value}`).join(', ');

      return {
        ok: false,
        message: t`Unsupported file type. Allowed types: ${list}.`,
      };
    }
  }

  return { ok: true };
}

/** Convenience validator for document slots (CV, evidence, attachments, org docs). */
export function validateDocumentFile(
  file: File,
  options?: Pick<FileValidationOptions, 'maxBytes'>,
): FileValidationResult {
  return validateUploadFile(file, {
    ...options,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  });
}

/** Convenience validator for image uploads (logos, avatars). */
export function validateImageFile(
  file: File,
  options?: Pick<FileValidationOptions, 'maxBytes'>,
): FileValidationResult {
  return validateUploadFile(file, {
    ...options,
    allowedExtensions: IMAGE_EXTENSIONS,
  });
}
