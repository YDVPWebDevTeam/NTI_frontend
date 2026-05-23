'use client';

import { t } from '@lingui/core/macro';
import { MailCheck } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { ControlledInputField } from 'components/forms';
import { Button } from 'components/shadcn';
import { useResendCooldown } from 'lib/hooks/use-resend-cooldown';
import type { StudentRegistrationValues } from 'lib/auth/schemas';

const RESEND_CONFIRMATION_COOLDOWN_SECONDS = 60;

type EmailStepProps = {
  isResending: boolean;
  onResend: (email: string) => Promise<boolean>;
};

export function EmailStep({ isResending, onResend }: EmailStepProps) {
  const { control, watch } = useFormContext<StudentRegistrationValues>();
  const email = watch('email')?.trim() ?? '';
  const { isCoolingDown, remainingSeconds, startCooldown } = useResendCooldown(
    `email-confirmation:${email || 'pending'}`,
    RESEND_CONFIRMATION_COOLDOWN_SECONDS,
  );
  let resendLabel = t`Resend confirmation email`;

  if (isResending) {
    resendLabel = t`Sending…`;
  } else if (isCoolingDown) {
    resendLabel = t`Resend in ${remainingSeconds}s`;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700">
        <p>
          {t`A confirmation link will be sent to`}{' '}
          <span className="font-medium text-neutral-900">{email || t`your email address`}</span>.
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          {t`Resend the email if it did not arrive. Paste the token below only if you want to verify this step immediately.`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={async () => {
            if (!email || isCoolingDown) {
              return;
            }

            const wasSent = await onResend(email);

            if (wasSent) {
              startCooldown();
            }
          }}
          className="h-12 rounded-sm bg-[#1e58d5] px-5 text-[11px] font-semibold tracking-[0.1em] text-white hover:bg-[#245fdc]"
          disabled={!email || isResending || isCoolingDown}
        >
          {resendLabel}
        </Button>

        <span
          className="inline-flex items-center gap-2 text-sm text-neutral-600"
          aria-live="polite"
        >
          <MailCheck className="h-4 w-4" aria-hidden="true" />
          {isCoolingDown
            ? t`You can request another email after the countdown finishes.`
            : t`Check your inbox and use the token only if you want to confirm now.`}
        </span>
      </div>

      <ControlledInputField
        control={control}
        name="verificationCode"
        label={t`Verification Token`}
        placeholder={t`Paste the token from your email…`}
        autoComplete="one-time-code"
        inputMode="text"
        spellCheck={false}
        description={t`Optional for now. Leave this blank if you want to verify later from the email link.`}
      />
    </div>
  );
}
