import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import * as z from 'zod';

export const PASSWORD_MIN_LENGTH = 6;
export const VERIFICATION_CODE_MIN_LENGTH = 4;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

export function createLoginSchema() {
  return z.object({
    email: z.email({ message: i18n._(msg`Please enter a valid email address.`) }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: i18n._(msg`Password must be at least 6 characters.`) }),
  });
}

export function createStudentIdentitySchema() {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, { message: i18n._(msg`Must be at least 2 characters.`) })
      .max(NAME_MAX_LENGTH, { message: i18n._(msg`Must be at most 50 characters.`) }),
    lastName: z
      .string()
      .trim()
      .min(NAME_MIN_LENGTH, { message: i18n._(msg`Must be at least 2 characters.`) })
      .max(NAME_MAX_LENGTH, { message: i18n._(msg`Must be at most 50 characters.`) }),
    email: z.email({ message: i18n._(msg`Must be a valid email address.`) }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, { message: i18n._(msg`Password must be at least 6 characters.`) }),
    acceptTerms: z.boolean().refine((val) => val, {
      message: i18n._(msg`You must accept the terms.`),
    }),
  });
}

export function createStudentEmailStepSchema() {
  return z.object({
    verificationCode: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || value.length >= VERIFICATION_CODE_MIN_LENGTH,
        i18n._(msg`Code must be at least 4 characters.`),
      ),
  });
}

export function createStudentRegistrationSchema() {
  const studentIdentitySchema = createStudentIdentitySchema();
  const studentEmailStepSchema = createStudentEmailStepSchema();

  return z.object({
    ...studentIdentitySchema.shape,
    ...studentEmailStepSchema.shape,
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type StudentRegistrationValues = z.infer<ReturnType<typeof createStudentRegistrationSchema>>;
