'use client';

import { t } from '@lingui/core/macro';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { ControlledPasswordField } from 'components/forms';
import { Button, Form } from 'components/shadcn';
import type { ChangePasswordFormValues } from '../lib/schemas';
import type { SecurityFeedback } from '../lib/types';
import { SecurityFeedbackBanner } from './security-feedback-banner';

export function PasswordChangeSection({
  feedback,
  form,
  isPending,
  isRedirectPending,
  onSubmit,
}: {
  feedback: SecurityFeedback | null;
  form: UseFormReturn<ChangePasswordFormValues>;
  isPending: boolean;
  isRedirectPending: boolean;
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      {feedback ? (
        <SecurityFeedbackBanner feedback={feedback} eyebrow={t`Password status`} />
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <ControlledPasswordField
            control={form.control}
            name="currentPassword"
            label={t`Current Password`}
            placeholder={t`Enter your current password`}
            startIcon={<KeyRound className="h-4 w-4" />}
            autoComplete="current-password"
          />
          <ControlledPasswordField
            control={form.control}
            name="newPassword"
            label={t`New Password`}
            placeholder={t`Enter a new password`}
            startIcon={<ShieldCheck className="h-4 w-4" />}
            autoComplete="new-password"
          />
          <ControlledPasswordField
            control={form.control}
            name="confirmNewPassword"
            label={t`Confirm New Password`}
            placeholder={t`Repeat the new password`}
            startIcon={<ShieldCheck className="h-4 w-4" />}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            disabled={isPending || isRedirectPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl px-5 text-[12px] font-semibold tracking-[0.16em] uppercase"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t`Updating...`}
              </>
            ) : (
              t`Save New Password`
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
