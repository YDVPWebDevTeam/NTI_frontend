'use client';

import { t } from '@lingui/core/macro';
import { ArrowRight, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useConfirmStudentEmail } from 'lib/api-client/student-email';
import { ROUTES } from 'lib/constants';

import { AuthSplitShell } from 'components/layout/auth-split-shell';
import { Button } from 'components/shadcn';

type VerificationStatus = 'confirming' | 'success' | 'error' | 'missing-token';

function VerifyStudentEmailFallback() {
  return (
    <AuthSplitShell
      asideEyebrow={t`STUDENT EMAIL`}
      asideTitle={t`Confirm your student email`}
      asideDescription={t`Verify your university email address to continue with onboarding.`}
      headerEyebrow={t`VERIFY STUDENT EMAIL`}
      headerTitle={t`Verify your student email`}
      headerDescription={t`Loading…`}
    >
      <div className="border-info/30 bg-info/10 text-info flex items-center gap-3 rounded-sm border p-4 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t`Loading…`}</span>
      </div>
    </AuthSplitShell>
  );
}

function VerifyStudentEmailContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token')?.trim() ?? '';
  const hasTokenFromUrl = tokenFromUrl.length > 0;
  const hasSubmittedUrlTokenRef = useRef(false);

  const [status, setStatus] = useState<VerificationStatus>(
    hasTokenFromUrl ? 'confirming' : 'missing-token',
  );

  const { mutateAsync: confirmStudentEmail } = useConfirmStudentEmail();

  const confirmToken = useCallback(
    async (token: string): Promise<void> => {
      setStatus('confirming');

      try {
        await confirmStudentEmail(token.trim());
        setStatus('success');
      } catch {
        setStatus('error');
      }
    },
    [confirmStudentEmail],
  );

  // The token comes straight from the email link and is confirmed automatically.
  // It works on any device with no existing session because the token itself is
  // proof of ownership of the student email address.
  useEffect(() => {
    if (!hasTokenFromUrl || hasSubmittedUrlTokenRef.current) {
      return;
    }

    hasSubmittedUrlTokenRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void confirmToken(tokenFromUrl);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [confirmToken, hasTokenFromUrl, tokenFromUrl]);

  let headerTitle = t`Verify your student email`;
  let headerDescription = t`Open the confirmation link from the email we sent to your student address.`;

  if (status === 'confirming') {
    headerTitle = t`Confirming your student email`;
    headerDescription = t`Please wait while we verify your student email address.`;
  } else if (status === 'success') {
    headerTitle = t`Student email confirmed`;
    headerDescription = t`Your student email was confirmed successfully. You can continue your onboarding.`;
  } else if (status === 'error') {
    headerTitle = t`Verification failed`;
    headerDescription = t`The verification link could not be completed. It may have expired or already been used.`;
  }

  return (
    <AuthSplitShell
      asideEyebrow={t`STUDENT EMAIL`}
      asideTitle={t`Confirm your student email`}
      asideDescription={t`Verify your university email address to continue with onboarding.`}
      headerEyebrow={t`VERIFY STUDENT EMAIL`}
      headerTitle={headerTitle}
      headerDescription={headerDescription}
    >
      {status === 'confirming' ? (
        <div className="border-info/30 bg-info/10 text-info flex items-center gap-3 rounded-sm border p-4 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t`Confirming your student email address...`}</span>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="space-y-5">
          <div className="border-success/30 bg-success/10 text-success flex items-center gap-3 rounded-sm border p-4 text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>{t`Student email confirmed successfully.`}</span>
          </div>

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            <Link href={ROUTES.ONBOARDING_PROFILE}>
              {t`CONTINUE ONBOARDING`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      {status === 'missing-token' || status === 'error' ? (
        <div className="space-y-5">
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3 rounded-sm border p-4 text-sm">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">
                {status === 'missing-token' ? t`This link is incomplete` : t`Verification failed`}
              </p>
              <p>
                {status === 'missing-token'
                  ? t`Open the full confirmation link from your email. If it still does not work, request a new confirmation email from your onboarding.`
                  : t`The verification link could not be completed. Request a new confirmation email from your onboarding.`}
              </p>
            </div>
          </div>

          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full rounded-sm text-[12px] font-semibold tracking-widest"
          >
            <Link href={ROUTES.ONBOARDING_PROFILE}>
              {t`RETURN TO ONBOARDING`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </AuthSplitShell>
  );
}

export default function VerifyStudentEmailPage() {
  return (
    <Suspense fallback={<VerifyStudentEmailFallback />}>
      <VerifyStudentEmailContent />
    </Suspense>
  );
}
