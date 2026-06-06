import { t } from '@lingui/core/macro';
import * as z from 'zod';

const ICO_LENGTH = 8;
const COMPANY_NAME_MIN_LENGTH = 2;
const COMPANY_NAME_MAX_LENGTH = 120;
const SECTOR_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 2000;
const ORGANIZATION_LOGO_ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
] as const;
const ORGANIZATION_DOCUMENT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
const ORGANIZATION_DOCUMENT_ALLOWED_EXTENSIONS = ['.pdf', '.docx'] as const;

function isBrowserFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function hasAllowedFileExtension(fileName: string, allowedExtensions: readonly string[]) {
  const normalizedName = fileName.toLowerCase();

  return allowedExtensions.some((extension) => normalizedName.endsWith(extension));
}

function isAllowedOrganizationDocumentFile(file: File) {
  if (file.type && ORGANIZATION_DOCUMENT_ALLOWED_TYPES.includes(file.type as never)) {
    return true;
  }

  return hasAllowedFileExtension(file.name, ORGANIZATION_DOCUMENT_ALLOWED_EXTENSIONS);
}

export function normalizeOrganizationWebsite(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function normalizeOrganizationIco(value: string) {
  return value.replace(/\D/g, '');
}

export function createOrganizationProfileSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(COMPANY_NAME_MIN_LENGTH, {
        message: t`Company name must be at least 2 characters.`,
      })
      .max(COMPANY_NAME_MAX_LENGTH, {
        message: t`Company name must be at most 120 characters.`,
      }),
    ico: z
      .string()
      .trim()
      .refine((value) => normalizeOrganizationIco(value).length === ICO_LENGTH, {
        message: t`ICO must contain exactly 8 digits.`,
      }),
    sector: z
      .string()
      .trim()
      .max(SECTOR_MAX_LENGTH, {
        message: t`Sector must be at most 80 characters.`,
      }),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX_LENGTH, {
        message: t`Description must be at most 2000 characters.`,
      }),
    website: z
      .string()
      .trim()
      .refine(
        (value) =>
          !value || z.string().url().safeParse(normalizeOrganizationWebsite(value)).success,
        {
          message: t`Please enter a valid website URL.`,
        },
      ),
    logoFile: z
      .custom<File | null | undefined>(
        (value) => value === null || value === undefined || isBrowserFile(value),
        {
          message: t`Please choose a valid logo file.`,
        },
      )
      .nullable()
      .optional()
      .refine((value) => !isBrowserFile(value) || value.size > 0, {
        message: t`Logo file cannot be empty.`,
      })
      .refine(
        (value) =>
          !isBrowserFile(value) || ORGANIZATION_LOGO_ALLOWED_TYPES.includes(value.type as never),
        {
          message: t`Logo must be a PNG, JPG, WEBP, or SVG image.`,
        },
      ),
  });
}

export type OrganizationProfileFormValues = z.infer<
  ReturnType<typeof createOrganizationProfileSchema>
>;

export function createOrganizationInviteSchema() {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: t`Email is required.` })
      .email({ message: t`Please enter a valid email address.` }),
  });
}

export type OrganizationInviteFormValues = z.infer<
  ReturnType<typeof createOrganizationInviteSchema>
>;

export function createOrganizationDocumentUploadSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t`Document name is required.` }),
    documentType: z
      .string()
      .trim()
      .min(1, { message: t`Document type is required.` }),
    visibility: z.enum(['INTERNAL', 'CONFIDENTIAL']),
    file: z
      .custom<File | null>((value) => value === null || isBrowserFile(value), {
        message: t`Please choose a file to upload.`,
      })
      .refine((value) => value === null || value.size > 0, {
        message: t`Document file cannot be empty.`,
      })
      .refine((value) => value === null || isAllowedOrganizationDocumentFile(value), {
        message: t`Document must be a PDF or DOCX file.`,
      }),
  });
}

export type OrganizationDocumentUploadFormValues = {
  name: string;
  documentType: string;
  visibility: 'INTERNAL' | 'CONFIDENTIAL';
  file: File | null;
};
