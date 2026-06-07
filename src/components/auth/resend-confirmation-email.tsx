'use client';

import { t } from '@lingui/core/macro';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useResendConfirmationEmail } from 'lib/api';
import { useResendCooldown } from 'lib/hooks/use-resend-cooldown';

import { Button } from 'components/shadcn';

const DEFAULT_COOLDOWN_SECONDS = 60;

type ResendConfirmationEmailProps = {
  email: string;
  cooldownSeconds?: number;
};

/**
 * Resend-confirmation-email control with a built-in throttle. The cooldown is
 * keyed by email and persisted in localStorage (via useResendCooldown), so the
 * countdown is shared across every surface that can resend for the same address
 * — the registration wizard, the standalone confirm pages, and other tabs.
 */
export function ResendConfirmationEmail({
  email,
  cooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
}: ResendConfirmationEmailProps) {
  const normalizedEmail = email.trim();
  const { mutateAsync: resendConfirmationEmail, isPending: isResending } =
    useResendConfirmationEmail();
  const { isCoolingDown, remainingSeconds, startCooldown } = useResendCooldown(
    `email-confirmation:${normalizedEmail || 'pending'}`,
    cooldownSeconds,
  );

  let resendLabel = t`Resend confirmation email`;

  if (isResending) {
    resendLabel = t`Sending…`;
  } else if (isCoolingDown) {
    resendLabel = t`Resend in ${remainingSeconds}s`;
  }

  const handleResend = async () => {
    if (!normalizedEmail || isCoolingDown || isResending) {
      return;
    }

    try {
      await resendConfirmationEmail({ data: { email: normalizedEmail } });
      toast.success(t`Confirmation email sent.`);
      startCooldown();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t`Unable to resend the confirmation email right now.`,
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        type="button"
        onClick={handleResend}
        disabled={!normalizedEmail || isResending || isCoolingDown}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-sm px-5 text-[11px] font-semibold tracking-[0.1em]"
      >
        {resendLabel}
      </Button>

      <span
        className="text-muted-foreground inline-flex items-center gap-2 text-sm"
        aria-live="polite"
      >
        <MailCheck className="h-4 w-4" aria-hidden="true" />
        {isCoolingDown
          ? t`You can request another email after the countdown finishes.`
          : t`Did not get the email? Resend it or check your spam folder.`}
      </span>
    </div>
  );
}
