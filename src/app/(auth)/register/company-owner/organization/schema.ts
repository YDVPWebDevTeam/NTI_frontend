import { t } from '@lingui/core/macro';
import * as z from 'zod';

const COMPANY_NAME_MIN_LENGTH = 2;
const COMPANY_NAME_MAX_LENGTH = 100;
const ICO_LENGTH = 8;
const SECTOR_MIN_LENGTH = 2;
const DESCRIPTION_MIN_LENGTH = 10;

export function normalizeWebsite(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return trimmedValue;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function normalizeIco(value: string) {
  return value.replace(/\D/g, '');
}

export function createCompanyOwnerOrganizationSchema() {
  return z.object({
    name: z
      .string()
      .trim()
      .min(COMPANY_NAME_MIN_LENGTH, {
        message: t`Company name must be at least 2 characters.`,
      })
      .max(COMPANY_NAME_MAX_LENGTH, {
        message: t`Company name must be at most 100 characters.`,
      }),
    ico: z
      .string()
      .trim()
      .refine((value) => normalizeIco(value).length === ICO_LENGTH, {
        message: t`ICO must contain exactly 8 digits.`,
      }),
    sector: z
      .string()
      .trim()
      .min(SECTOR_MIN_LENGTH, {
        message: t`Sector must be at least 2 characters.`,
      }),
    description: z
      .string()
      .trim()
      .min(DESCRIPTION_MIN_LENGTH, {
        message: t`Description must be at least 10 characters.`,
      }),
    website: z
      .string()
      .trim()
      .refine((value) => z.string().url().safeParse(normalizeWebsite(value)).success, {
        message: t`Please enter a valid website URL.`,
      }),
    logoFile: z.unknown().optional().nullable(),
  });
}

export type CompanyOwnerOrganizationValues = z.infer<
  ReturnType<typeof createCompanyOwnerOrganizationSchema>
>;
