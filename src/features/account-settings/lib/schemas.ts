import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import * as z from 'zod';

const ACCOUNT_PASSWORD_MIN_LENGTH = 8;

export function createChangePasswordSchema() {
  return z
    .object({
      currentPassword: z.string().min(ACCOUNT_PASSWORD_MIN_LENGTH, {
        message: i18n._(msg`Password must be at least 8 characters.`),
      }),
      newPassword: z.string().min(ACCOUNT_PASSWORD_MIN_LENGTH, {
        message: i18n._(msg`Password must be at least 8 characters.`),
      }),
      confirmNewPassword: z.string().min(ACCOUNT_PASSWORD_MIN_LENGTH, {
        message: i18n._(msg`Password must be at least 8 characters.`),
      }),
    })
    .superRefine((values, ctx) => {
      if (values.newPassword !== values.confirmNewPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmNewPassword'],
          message: i18n._(msg`Passwords must match.`),
        });
      }

      if (values.currentPassword === values.newPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: i18n._(msg`Choose a password you have not used for the current session.`),
        });
      }
    });
}

export function createChangeEmailRequestSchema(currentEmail?: string | null) {
  return z.object({
    newEmail: z
      .email({ message: i18n._(msg`Must be a valid email address.`) })
      .refine((value) => value.trim().toLowerCase() !== (currentEmail ?? '').trim().toLowerCase(), {
        message: i18n._(msg`Enter a different email address.`),
      }),
  });
}

export function createChangeEmailConfirmSchema() {
  return z.object({
    token: z
      .string()
      .trim()
      .min(1, { message: i18n._(msg`Verification token is required.`) }),
  });
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;
export type ChangeEmailRequestFormValues = z.infer<
  ReturnType<typeof createChangeEmailRequestSchema>
>;
export type ChangeEmailConfirmFormValues = z.infer<
  ReturnType<typeof createChangeEmailConfirmSchema>
>;
