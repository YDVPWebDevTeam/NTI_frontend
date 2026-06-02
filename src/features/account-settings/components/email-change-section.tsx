'use client';

import { t } from '@lingui/core/macro';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { ControlledInputField } from 'components/forms';
import { Button, Form } from 'components/shadcn';
import { useResendCooldown } from 'lib/hooks/use-resend-cooldown';
import type { ChangeEmailConfirmFormValues, ChangeEmailRequestFormValues } from '../lib/schemas';
import type { SecurityFeedback } from '../lib/types';
import { SecurityFeedbackBanner } from './security-feedback-banner';

const EMAIL_CHANGE_REQUEST_COOLDOWN_SECONDS = 60;

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
  pendingEmail,
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
  onRequestSubmit: (values: ChangeEmailRequestFormValues) => Promise<boolean>;
  pendingEmail: string | null;
  requestFeedback: SecurityFeedback | null;
  requestForm: UseFormReturn<ChangeEmailRequestFormValues>;
}) {
  const confirmToken = confirmForm.watch('token');
  const requestEmail = requestForm.watch('newEmail')?.trim().toLowerCase() ?? '';
  const cooldownEmail = pendingEmail ?? requestEmail;
  const isConfirmReady = confirmToken.trim().length > 0 && confirmForm.formState.isValid;
  const { isCoolingDown, remainingSeconds, startCooldown } = useResendCooldown(
    `account-email-change:${cooldownEmail || 'pending'}`,
    EMAIL_CHANGE_REQUEST_COOLDOWN_SECONDS,
  );
  let requestLabel = t`Send Verification`;

  if (isRequestPending) {
    requestLabel = t`Sending…`;
  } else if (isCoolingDown) {
    requestLabel = t`Send again in ${remainingSeconds}s`;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EmailChangePanel
        eyebrow={t`Request change`}
        title={t`Verify your new email`}
        description={t`Enter an email address you can open right now. We'll send a confirmation message before anything changes.`}
        feedback={requestFeedback}
        feedbackEyebrow={t`Request status`}
      >
        <Form {...requestForm}>
          <form
            onSubmit={requestForm.handleSubmit(async (values) => {
              if (isCoolingDown) {
                return;
              }

              const wasSent = await onRequestSubmit(values);

              if (wasSent) {
                startCooldown();
              }
            })}
            className="space-y-5"
          >
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
              disabled={isRequestPending || isRedirectPending || isCoolingDown}
              className="h-12 rounded-xl bg-[#1e58d5] px-5 text-[12px] font-semibold tracking-[0.16em] uppercase hover:bg-[#245fdc]"
            >
              {isRequestPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t`Sending…`}
                </>
              ) : (
                requestLabel
              )}
            </Button>
          </form>
        </Form>
      </EmailChangePanel>

      <EmailChangePanel
        eyebrow={t`Confirm change`}
        title={t`Apply the verified email`}
        description={t`Open the link in your email, or paste the confirmation code here. After that, you'll need to sign in again.`}
        feedback={confirmFeedback}
        feedbackEyebrow={t`Confirmation status`}
      >
        {canConfirmEmailChange ? (
          <Form {...confirmForm}>
            <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-5">
              <ControlledInputField
                control={confirmForm.control}
                name="token"
                label={t`Confirmation Code`}
                placeholder={t`Paste the code from your email…`}
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
                  t`Confirm New Email`
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[#d4def3] bg-white/80 p-4 text-sm leading-6 text-[#5b667b]">
            {t`This step will become available after you request an email change or open the link from your inbox.`}
          </div>
        )}
      </EmailChangePanel>
    </div>
  );
}
