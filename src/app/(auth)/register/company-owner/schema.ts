import { t } from '@lingui/core/macro';
import * as z from 'zod';

const COMPANY_OWNER_NAME_MIN_LENGTH = 2;
const COMPANY_OWNER_NAME_MAX_LENGTH = 50;
const COMPANY_OWNER_PASSWORD_MIN_LENGTH = 6;

export function createCompanyOwnerRegistrationSchema() {
  return z.object({
    email: z.email({
      message: t`Please enter a valid email address.`,
    }),
    firstName: z
      .string()
      .trim()
      .min(COMPANY_OWNER_NAME_MIN_LENGTH, {
        message: t`First name must be at least 2 characters.`,
      })
      .max(COMPANY_OWNER_NAME_MAX_LENGTH, {
        message: t`First name must be at most 50 characters.`,
      }),
    lastName: z
      .string()
      .trim()
      .min(COMPANY_OWNER_NAME_MIN_LENGTH, {
        message: t`Last name must be at least 2 characters.`,
      })
      .max(COMPANY_OWNER_NAME_MAX_LENGTH, {
        message: t`Last name must be at most 50 characters.`,
      }),
    password: z.string().min(COMPANY_OWNER_PASSWORD_MIN_LENGTH, {
      message: t`Password must be at least 6 characters.`,
    }),
  });
}

export type CompanyOwnerRegistrationValues = z.infer<
  ReturnType<typeof createCompanyOwnerRegistrationSchema>
>;
