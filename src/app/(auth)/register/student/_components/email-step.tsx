'use client';

import { t } from '@lingui/core/macro';
import { useFormContext } from 'react-hook-form';

import { ResendConfirmationEmail } from 'components/auth/resend-confirmation-email';
import type { StudentRegistrationValues } from 'lib/auth/schemas';

export function EmailStep() {
  const { watch } = useFormContext<StudentRegistrationValues>();
  const email = watch('email')?.trim() ?? '';

  return (
    <div className="space-y-4">
      <div className="border-border bg-card text-foreground rounded-xl border px-4 py-4 text-sm">
        <p>
          {t`We sent a confirmation link to`}{' '}
          <span className="text-foreground font-medium">{email || t`your email address`}</span>.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {t`Open that link from any device to confirm your email — it works even if you are signed out. Once confirmed, you'll continue setting up your profile in onboarding.`}
        </p>
      </div>

      <ResendConfirmationEmail email={email} />
    </div>
  );
}
