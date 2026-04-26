'use client';

import { t } from '@lingui/core/macro';
import { MailCheck } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { ControlledInputField } from 'components/forms';
import { Button } from 'components/shadcn';
import type { StudentRegistrationValues } from '../schema';

type EmailStepProps = {
  isResending: boolean;
  onResend: (email: string) => void;
};

export function EmailStep({ isResending, onResend }: EmailStepProps) {
  const { control, watch } = useFormContext<StudentRegistrationValues>();
  const email = watch('email');

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700">
        <p>
          {t`A confirmation link will be sent to`}{' '}
          <span className="font-medium text-neutral-900">{email || t`your email address`}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={() => {
            if (email?.trim()) {
              onResend(email.trim());
            }
          }}
          className="h-12 rounded-sm bg-[#1e58d5] px-5 text-[11px] font-semibold tracking-[0.1em] text-white hover:bg-[#245fdc]"
          disabled={!email?.trim() || isResending}
        >
          {isResending ? t`SENDING...` : t`RESEND CONFIRMATION EMAIL`}
        </Button>

        <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
          <MailCheck className="h-4 w-4" />
          {t`Check your inbox and paste token only if needed.`}
        </span>
      </div>

      <ControlledInputField
        control={control}
        name="verificationCode"
        label={t`Verification Token (Optional for this step)`}
        placeholder={t`Paste token from email if you want to verify now`}
      />
    </div>
  );
}
