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
    <div className="border-border bg-muted space-y-6 rounded-2xl border p-5">
      <div>
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h3 className="text-foreground mt-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
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
  isAutoConfirmPending,
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
  isAutoConfirmPending: boolean;
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
    requestLabel = t`Try again in ${remainingSeconds}s`;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <EmailChangePanel
        eyebrow={t`Request change`}
        title={t`Confirm your new email`}
        description={t`Enter an email address you can open right now. We'll send a confirmation message before we make the change.`}
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl px-5 text-[12px] font-semibold tracking-[0.16em] uppercase"
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
        title={t`Finish email change`}
        description={t`Open the link in your email, or paste the code here. After that, sign in again.`}
        feedback={confirmFeedback}
        feedbackEyebrow={t`Confirmation status`}
      >
        {canConfirmEmailChange ? (
          <Form {...confirmForm}>
            <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-5">
              <ControlledInputField
                control={confirmForm.control}
                name="token"
                label={t`Confirmation code`}
                placeholder={t`Paste the code from your email`}
                autoComplete="one-time-code"
                spellCheck={false}
              />

              <Button
                type="submit"
                disabled={
                  isConfirmPending || isAutoConfirmPending || isRedirectPending || !isConfirmReady
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl px-5 text-[12px] font-semibold tracking-[0.16em] uppercase"
              >
                {isConfirmPending || isAutoConfirmPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t`Confirming…`}
                  </>
                ) : (
                  t`Confirm New Email`
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-4 text-sm leading-6">
            {t`This step will unlock after you request the change or open the link from your inbox.`}
          </div>
        )}
      </EmailChangePanel>
    </div>
  );
}
