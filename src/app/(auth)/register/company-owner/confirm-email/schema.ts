import { t } from '@lingui/core/macro';
import * as z from 'zod';

const VERIFICATION_TOKEN_MIN_LENGTH = 4;

export function createCompanyOwnerEmailConfirmationSchema() {
  return z.object({
    token: z
      .string()
      .trim()
      .min(VERIFICATION_TOKEN_MIN_LENGTH, {
        message: t`Verification token must be at least 4 characters.`,
      }),
  });
}

export type CompanyOwnerEmailConfirmationValues = z.infer<
  ReturnType<typeof createCompanyOwnerEmailConfirmationSchema>
>;
