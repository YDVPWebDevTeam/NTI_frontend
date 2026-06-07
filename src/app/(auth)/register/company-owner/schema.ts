import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import * as z from 'zod';

import { createPasswordField } from 'lib/auth/schemas';

const COMPANY_OWNER_NAME_MIN_LENGTH = 2;
const COMPANY_OWNER_NAME_MAX_LENGTH = 50;

export function createCompanyOwnerRegistrationSchema() {
  return z.object({
    email: z.email({
      message: i18n._(msg`Please enter a valid email address.`),
    }),
    firstName: z
      .string()
      .trim()
      .min(COMPANY_OWNER_NAME_MIN_LENGTH, {
        message: i18n._(msg`First name must be at least 2 characters.`),
      })
      .max(COMPANY_OWNER_NAME_MAX_LENGTH, {
        message: i18n._(msg`First name must be at most 50 characters.`),
      }),
    lastName: z
      .string()
      .trim()
      .min(COMPANY_OWNER_NAME_MIN_LENGTH, {
        message: i18n._(msg`Last name must be at least 2 characters.`),
      })
      .max(COMPANY_OWNER_NAME_MAX_LENGTH, {
        message: i18n._(msg`Last name must be at most 50 characters.`),
      }),
    password: createPasswordField(),
  });
}

export type CompanyOwnerRegistrationValues = z.infer<
  ReturnType<typeof createCompanyOwnerRegistrationSchema>
>;
