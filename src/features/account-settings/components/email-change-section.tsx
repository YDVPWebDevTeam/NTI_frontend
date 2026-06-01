'use client';

import { t } from '@lingui/core/macro';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { ControlledInputField } from 'components/forms';
import { Button, Form } from 'components/shadcn';
import type { ChangeEmailConfirmFormValues, ChangeEmailRequestFormValues } from '../lib/schemas';
import type { SecurityFeedback } from '../lib/types';
import { SecurityFeedbackBanner } from './security-feedback-banner';

function EmailChangePanel({
  eyebrow,
  title,
  description,
  feedback,
  feedbackEyebrow,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  feedback: SecurityFeedback | null;
  feedbackEyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6 rounded-[1.5rem] border border-[#e5ecfb] bg-[#fbfcff] p-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#5f76a2] uppercase">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[#101a2e]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#5b667b]">{description}</p>
      </div>

      {feedback ? <SecurityFeedbackBanner feedback={feedback} eyebrow={feedbackEyebrow} /> : null}

      {children}
    </div>
  );
}

export function EmailChangeSection({
  canConfirmEmailChange,
  confirmFeedback,
  confirmForm,
  isConfirmPending,
  isRedirectPending,
  isRequestPending,
  onConfirmSubmit,
  onRequestSubmit,
  requestFeedback,
  requestForm,
}: {
  canConfirmEmailChange: boolean;
  confirmFeedback: SecurityFeedback | null;
  confirmForm: UseFormReturn<ChangeEmailConfirmFormValues>;
  isConfirmPending: boolean;
  isRedirectPending: boolean;
  isRequestPending: boolean;
  onConfirmSubmit: (values: ChangeEmailConfirmFormValues) => Promise<void>;
  onRequestSubmit: (values: ChangeEmailRequestFormValues) => Promise<void>;
  requestFeedback: SecurityFeedback | null;
  requestForm: UseFormReturn<ChangeEmailRequestFormValues>;
}) {
  const confirmToken = confirmForm.watch('token');
  const isConfirmReady = confirmToken.trim().length > 0 && confirmForm.formState.isValid;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EmailChangePanel
        eyebrow={t`Request change`}
        title={t`Send verification to the new email`}
        description={t`Use an address you can access right now. Conflicts and existing-account issues will be reported before any email is changed.`}
        feedback={requestFeedback}
        feedbackEyebrow={t`Request status`}
      >
        <Form {...requestForm}>
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-5">
            <ControlledInputField
              control={requestForm.control}
              name="newEmail"
              label={t`New Email Address`}
              type="email"
              placeholder={t`name@company.com`}
              autoComplete="email"
            />

            <Button
              type="submit"
              disabled={isRequestPending || isRedirectPending}
              className="h-12 rounded-xl bg-[#1e58d5] px-5 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-[#245fdc]"
            >
              {isRequestPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t`Sending…`}
                </>
              ) : (
                t`Send Verification`
              )}
            </Button>
          </form>
        </Form>
      </EmailChangePanel>

      <EmailChangePanel
        eyebrow={t`Confirm change`}
        title={t`Apply the verified email`}
        description={t`Paste the token from the email or open the confirmation link. Once confirmed, the account will require a fresh sign-in.`}
        feedback={confirmFeedback}
        feedbackEyebrow={t`Confirmation status`}
      >
        {canConfirmEmailChange ? (
          <Form {...confirmForm}>
            <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-5">
              <ControlledInputField
                control={confirmForm.control}
                name="token"
                label={t`Verification Token`}
                placeholder={t`Paste the token from your email…`}
                autoComplete="one-time-code"
                spellCheck={false}
              />

              <Button
                type="submit"
                disabled={isConfirmPending || isRedirectPending || !isConfirmReady}
                className="h-12 rounded-xl bg-[#123a82] px-5 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-[#174899]"
              >
                {isConfirmPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t`Confirming...`}
                  </>
                ) : (
                  t`Confirm Email Change`
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[#d4def3] bg-white/80 p-4 text-sm leading-6 text-[#5b667b]">
            {t`This confirmation step stays inactive until you request an email change or open a confirmation link from your inbox.`}
          </div>
        )}
      </EmailChangePanel>
    </div>
  );
}
